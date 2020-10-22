//imports
package bus.codyben.me;

import spark.Spark;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Timer;
import java.util.TimerTask;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * Boilerplate code for a Java Spark web server.
 */

/**
 * Hello world!
 *
 */
public class App {

    // The ids of the Lanta routes used. 
    private static final String[] ROUTE_IDS = new String[] { "101", "102" };

    private static final String LEHIGH = "Lehigh";
    private static final String LANTA = "LANTA";

    private static JsonObject cached_stops = new JsonObject();
    private static JsonArray cached_announcements = new JsonArray();
    private static JsonObject cached_route_paths = new JsonObject();
    private static JsonObject cached_detailed_route_info = new JsonObject();

    public static void main(String[] args) {
        // import the jdbc driver
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e1) {
            e1.printStackTrace();
        }
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/busapp?serverTimezone=UTC",
                    "busapp", "busapp");
            // Gets all the positions of all the buses (both Lanta and Lehgih)
            final PreparedStatement bus_query = conn
                    .prepareStatement("SELECT bus_id, short_name, last_stop, latitude, longitude, route_id, bus_service FROM ( "
                                        + "SELECT *, row_number() over(partition by bus_id order by insertion_time desc) as rn "
                                        + "FROM busapp.transient_bus " 
                                        + "WHERE bus_service = 'LANTA' "
                                        + "AND insertion_time > now() - interval 40 day " 
                                    + ") b " 
                                    + "WHERE rn = 1 " 
                                    + "UNION "
                                    + "SELECT bus_id, short_name, last_stop, latitude, longitude, route_id, bus_service FROM ( "
                                        + "SELECT *, row_number() over(partition by bus_id order by insertion_time desc) as rn  "
                                        + "FROM busapp.transient_bus " 
                                        + "WHERE bus_service = 'Lehigh' "
                                        + "AND insertion_time > now() - interval 40 day " 
                                    + ") b " 
                                    + "WHERE rn = 1;");

            int connectTimeout = 1500;
            RequestConfig config = RequestConfig.custom().setConnectTimeout(connectTimeout)
                    .setConnectionRequestTimeout(connectTimeout).setSocketTimeout(connectTimeout).build();

            final CloseableHttpClient httpClient = HttpClients.custom()
                    .setRetryHandler((exception, executionCount, context) -> (executionCount < 3))
                    .setDefaultRequestConfig(config).build();

            // Update all the typically unchanging information every hour
            Timer time = new Timer();
            time.schedule(new TimerTask() {
                @Override
                public void run() {
                    try {
                        updateAnnouncements(httpClient);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    try {
                        updateRoutePaths(httpClient);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    try {
                        updateRouteStops(httpClient);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }, 0, 3600000);

            final HttpGet lantaRoutesGet = new HttpGet(
                    "https://realtimelanta.availtec.com/InfoPoint/rest/Routes/GetVisibleRoutes");
            lantaRoutesGet.addHeader("Accept", "application/json");
            Spark.port(4567);
            // Setup all the backend routes
            Spark.get("/announcements", (req, res) -> {
                res.type("application/json");
                return cached_announcements;
            });
            Spark.get("/route_paths", (req, res) -> {
                res.type("application/json");
                return cached_route_paths;
            });
            Spark.get("/stops", (req, res) -> {
                res.type("application/json");
                return cached_stops;
            });
            Spark.get("/routes", (req, res) -> {
                res.type("application/json");
                return cached_detailed_route_info;
            });
            Spark.get("/about", (req, res) -> {
                return "Howdy there folks! This is our CSE Capstone project. Hope you like it!";
            });
            String[] headers = { "bus_id", "short_name", "latitude", "longitude", "route_id", "bus_service", "last_stop" };
            Spark.get("/buses", (req, res) -> {
                // Queriers for the bus location. (This is the only query that doesn't used cached data)
                final ResultSet bus_results = bus_query.executeQuery();
                JSONArray out = new JSONArray();
                try {
                while (bus_results.next()) {
                    JSONObject entry = new JSONObject();
                    for (String header : headers) {
                        entry.put(header, bus_results.getObject(header));
                    }
                    if (entry.get("bus_service").toString().equals(LEHIGH)) {
                        final JSONObject projections = new JSONObject();
                        final double lat = Double.parseDouble(entry.get("latitude").toString());
                        final double lon = Double.parseDouble(entry.get("longitude").toString());
                        final JsonArray route_info = cached_detailed_route_info.getAsJsonObject(LEHIGH).getAsJsonArray(entry.get("route_id").toString());
                        final String last_stop = entry.get("last_stop").toString();
                        if (route_info != null && last_stop != null) {
                            int last_stop_index = -1;
                            long total_duration = 0;
                            for (int i = 0; i < route_info.size(); ++i) {
                                final JsonObject stop_info = route_info.get(i).getAsJsonObject();
                                final String stop_id = stop_info.get("id").getAsString();
                                if (last_stop_index != -1) {
                                    if (last_stop_index + 1 == i) {
                                        final double stop_lon = stop_info.get("lon").getAsDouble();
                                        final double stop_lat = stop_info.get("lat").getAsDouble();
                                        total_duration = calculateRouteDuration(httpClient, lat, lon, stop_lat, stop_lon);
                                    } else {
                                        total_duration += stop_info.get("time_to_arrive").getAsLong();
                                    }
                                    projections.put(stop_id, total_duration);
                                } else if (stop_info.get("id").getAsString().equals(last_stop)) {
                                    last_stop_index = i;
                                }
                            }
                            if (last_stop_index != -1) {
                                for (int i = 0; i <= last_stop_index; ++i) {
                                    final JsonObject stop_info = route_info.get(i).getAsJsonObject();
                                    final String stop_id = stop_info.get("id").getAsString();
                                    total_duration += stop_info.get("time_to_arrive").getAsLong();
                                    projections.put(stop_id, total_duration);
                                }
                                entry.put("projections", projections);
                            } else {
                                // Last stop doesn't exist
                            }
                        }
                    }
                    out.add(entry);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
                res.type("application/json");
                return out.toJSONString();
                // res.type("application/json");
                // return cached_detailed_route_info;
                // return cached_detailed_route_info.toString();
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static void updateRouteStops(final CloseableHttpClient client) throws ClientProtocolException, IOException {
        // Gets the stops for all the lanta routes
        final JsonObject lanta_stop_info = new JsonObject();
        for (String route_id : ROUTE_IDS) {
            final HttpGet routeKmlGet = new HttpGet(
                    "https://realtimelanta.availtec.com/InfoPoint/rest/RouteDetails/Get/" + route_id);
            final CloseableHttpResponse res = client.execute(routeKmlGet);
            final String data = new String(res.getEntity().getContent().readAllBytes());
            res.close();
            lanta_stop_info.add(route_id, new Gson().fromJson(data, JsonObject.class));
        }
        // Gets all the lehigh stops
        final HttpGet lehighStopsGet = new HttpGet("https://lehigh.doublemap.com/map/v2/stops");
        final CloseableHttpResponse res = client.execute(lehighStopsGet);
        final JsonArray lehigh_stop_info = new Gson().fromJson(new String(res.getEntity().getContent().readAllBytes()),
                JsonArray.class);
        res.close();

        final JsonArray lehigh_routes = cached_route_paths.getAsJsonArray(LEHIGH);
        final JsonObject lehigh_detailed_route_info = new JsonObject();
        for (int i = 0; i < lehigh_routes.size(); ++i) {
            final JsonArray route_stop_info = new JsonArray();
            final JsonObject route_info = lehigh_routes.get(i).getAsJsonObject();
            final JsonArray stops = route_info.getAsJsonArray("stops");
            final int route_id = route_info.get("id").getAsInt();
            double prev_stop_lat = -1;
            double prev_stop_long = -1;
            for (int x = 0; x < stops.size(); ++x) {
                final int stop_id = stops.get(x).getAsInt();
                for (int y = 0; y < lehigh_stop_info.size(); ++y) {
                    final JsonObject possible_stop = lehigh_stop_info.get(y).getAsJsonObject();
                    if (possible_stop.get("id").getAsInt() == stop_id) {
                        JsonObject copied_stop = possible_stop.deepCopy();
                        final double current_stop_lat = possible_stop.get("lat").getAsDouble();
                        final double current_stop_long = possible_stop.get("lon").getAsDouble();
                        if (prev_stop_lat != -1) {
                            final long time_to_arrive = calculateRouteDuration(client, prev_stop_lat, prev_stop_long, current_stop_lat, current_stop_long);
                            copied_stop.addProperty("time_to_arrive", String.valueOf(time_to_arrive));
                        }
                        prev_stop_lat = current_stop_lat;
                        prev_stop_long = current_stop_long;
                        route_stop_info.add(copied_stop);
                        break;
                    }
                }
            }
            final JsonObject first_stop_info = route_stop_info.get(0).getAsJsonObject();
            final double fist_stop_lat = first_stop_info.get("lat").getAsDouble();
            final double fist_stop_lon = first_stop_info.get("lon").getAsDouble();
            final long time_to_arrive = calculateRouteDuration(client, prev_stop_lat, prev_stop_long, fist_stop_lat, fist_stop_lon);
            first_stop_info.addProperty("time_to_arrive", time_to_arrive);
            lehigh_detailed_route_info.add(String.valueOf(route_id), route_stop_info);
        }
        final JsonObject final_detailed_route_info = new JsonObject();
        final_detailed_route_info.add(LEHIGH, lehigh_detailed_route_info);
        cached_detailed_route_info = final_detailed_route_info;
        // Merges the two lists into the cached list. 
        final JsonObject final_stop_info = new JsonObject();
        final_stop_info.add(LEHIGH, lehigh_stop_info);
        final_stop_info.add(LANTA, lanta_stop_info);
        cached_stops = final_stop_info;
    }

    private static long calculateRouteDuration(final CloseableHttpClient client, final double start_lat, final double start_long, final double end_lat, final double end_long)
            throws ClientProtocolException, IOException {
        final String key_str = start_long + "," + start_lat + ";" + end_long + "," + end_long;
        // System.out.println(key_str);
        final HttpGet duration_get = new HttpGet("http://127.0.0.1:5000/route/v1/driving/" + key_str + "?overview=full");
        final CloseableHttpResponse res = client.execute(duration_get);
        final JsonObject route_info = new Gson().fromJson(new String(res.getEntity().getContent().readAllBytes()),
                JsonObject.class);
        res.close();
        return route_info.getAsJsonArray("routes").get(0).getAsJsonObject().get("duration").getAsLong();
    }

    private static void updateAnnouncements(final CloseableHttpClient client)
            throws ClientProtocolException, IOException {
        final HttpGet lehighAnncouncementsGet = new HttpGet("https://lehigh.doublemap.com/map/v2/announcements");
        final CloseableHttpResponse res = client.execute(lehighAnncouncementsGet);
        cached_announcements = new Gson().fromJson(new String(res.getEntity().getContent().readAllBytes()),
                JsonArray.class);
        res.close();
    }

    private static void updateRoutePaths(final CloseableHttpClient client) throws ClientProtocolException, IOException {
        JsonObject lanta_paths = new JsonObject();
        // Converts the kml file type to an array of an array of coordinates of the form:
        // Is an array of array of coordinates since thats the way kml files are formatted. 
        for (String route_id : ROUTE_IDS) {
            final HttpGet routeKmlGet = new HttpGet("https://realtimelanta.availtec.com/InfoPoint/Resources/Traces/Route_" + route_id + ".kml");
            CloseableHttpResponse res = client.execute(routeKmlGet);
            // String data = new String(res.getEntity().getContent().readAllBytes());
            String text = new String(res.getEntity().getContent().readAllBytes());
            res.close();
            JsonArray route_coords = new JsonArray();
            String start_string = "<coordinates>";
            String end_string = "</coordinates>";
            while (text.contains("<coordinates>")) {
                int coordinate_start = text.indexOf(start_string);
                int coordinate_end = text.indexOf(end_string);
                String coordinate_string = text.substring(coordinate_start + start_string.length(), coordinate_end);
                JsonArray coordinate_list = new JsonArray();
                String[] coordinates = coordinate_string.split(" ");
                for (String coordinate_set : coordinates) {
                    String[] coords = coordinate_set.split(",");
                    JsonArray json_coords = new JsonArray();
                    json_coords.add(coords[0]);
                    json_coords.add(coords[1]);
                    coordinate_list.add(json_coords);
                }
                route_coords.add(coordinate_list);
                text = text.substring(coordinate_end + end_string.length());
            }
            lanta_paths.add(route_id, route_coords);
        }
        

        // Just directly passes the lehigh route paths. 
        final HttpGet lehighRoutePathsGet = new HttpGet("https://lehigh.doublemap.com/map/v2/routes");
        final CloseableHttpResponse res = client.execute(lehighRoutePathsGet);
        final JsonArray lehigh_route_paths = new Gson().fromJson(new String(res.getEntity().getContent().readAllBytes()),
                JsonArray.class);

        JsonObject out = new JsonObject();
        out.add(LEHIGH, lehigh_route_paths);
        out.add(LANTA, lanta_paths);
        cached_route_paths = out;
        res.close();
    }
}
