//imports
package bus.codyben.me;

import spark.Spark;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Timer;
import java.util.TimerTask;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

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

    private static JsonObject cached_stops = new JsonObject();
    private static JsonArray cached_announcements = new JsonArray();
    private static JsonObject cached_route_paths = new JsonObject();

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
                    .prepareStatement("SELECT bus_id, short_name, latitude, longitude, route_id, bus_service FROM ( "
                                        + "SELECT *, row_number() over(partition by bus_id order by insertion_time desc) as rn "
                                        + "FROM busapp.transient_bus " 
                                        + "WHERE bus_service = 'LANTA' "
                                        + "AND insertion_time > now() - interval 5 minute " 
                                    + ") b " 
                                    + "WHERE rn = 1 " 
                                    + "UNION "
                                    + "SELECT bus_id, short_name, latitude, longitude, route_id, bus_service FROM ( "
                                        + "SELECT *, row_number() over(partition by bus_id order by insertion_time desc) as rn  "
                                        + "FROM busapp.transient_bus " 
                                        + "WHERE bus_service = 'LEHIGH' "
                                        + "AND insertion_time > now() - interval 5 minute " 
                                    + ") b " 
                                    + "WHERE rn = 1;");

            int connectTimeout = 250;
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
                        updateRouteStops(httpClient);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
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
            Spark.get("/about", (req, res) -> {
                return "Howdy there folks! This is our CSE Capstone project. Hope you like it!";
            });
            String[] headers = { "bus_id", "short_name", "latitude", "longitude", "route_id", "bus_service" };
            Spark.get("/buses", (req, res) -> {
                // Queriers for the bus location. (This is the only query that doesn't used cached data)
                final ResultSet bus_results = bus_query.executeQuery();
                res.type("application/json");
                JSONArray out = new JSONArray();
                while (bus_results.next()) {
                    JSONObject entry = new JSONObject();
                    for (String header : headers) {
                        entry.put(header, bus_results.getObject(header));
                    }
                    out.add(entry);
                }
                return out.toJSONString();
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

        // Merges the two lists into the cached list. 
        final JsonObject final_stop_info = new JsonObject();
        final_stop_info.add("lehigh", lehigh_stop_info);
        final_stop_info.add("lanta", lanta_stop_info);
        cached_stops = final_stop_info;
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
        out.add("lehigh", lehigh_route_paths);
        out.add("lanta", lanta_paths);
        cached_route_paths = out;
        res.close();
    }
}
