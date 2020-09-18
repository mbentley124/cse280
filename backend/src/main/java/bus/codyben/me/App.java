//imports
package bus.codyben.me;

import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.Timer;
import java.util.TimerTask;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpRequestRetryHandler;
import org.apache.http.client.config.AuthSchemes;
import org.apache.http.client.config.CookieSpecs;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.protocol.HttpContext;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

/**
 * Boilerplate code for a Java Spark web server.
 */

/**
 * Hello world!
 *
 */
public class App {

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

            final HttpGet lehighRoutePathsGet = new HttpGet("https://lehigh.doublemap.com/map/v2/routes");
            final HttpGet lantaRoutesGet = new HttpGet(
                    "https://realtimelanta.availtec.com/InfoPoint/rest/Routes/GetVisibleRoutes");
            lantaRoutesGet.addHeader("Accept", "application/json");
            System.out.println("Hello World!");
            Spark.port(4567);
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

    private static byte[] getHttp(final CloseableHttpClient client, final HttpGet get, final Response response)
            throws UnsupportedOperationException, ClientProtocolException, IOException {
        // TODO add some form of error handling.
        response.type("application/json");
        CloseableHttpResponse res = client.execute(get);
        byte[] data = res.getEntity().getContent().readAllBytes();
        res.close();
        return data;
    }

    private static void updateRouteStops(final CloseableHttpClient client) throws ClientProtocolException, IOException {
        final JsonObject lanta_stop_info = new JsonObject();
        for (String route_id : ROUTE_IDS) {
            final HttpGet routeKmlGet = new HttpGet(
                    "https://realtimelanta.availtec.com/InfoPoint/rest/RouteDetails/Get/" + route_id);
            final CloseableHttpResponse res = client.execute(routeKmlGet);
            final String data = new String(res.getEntity().getContent().readAllBytes());
            res.close();
            lanta_stop_info.add(route_id, new Gson().fromJson(data, JsonObject.class));
        }
        final HttpGet lehighStopsGet = new HttpGet("https://lehigh.doublemap.com/map/v2/stops");
        final CloseableHttpResponse res = client.execute(lehighStopsGet);
        final JsonArray lehigh_stop_info = new Gson().fromJson(new String(res.getEntity().getContent().readAllBytes()),
                JsonArray.class);
        res.close();

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
