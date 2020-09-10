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
import java.util.Arrays;

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

/**
 * Boilerplate code for a Java Spark web server.
 */

/**
 * Hello world!
 *
 */
public class App {
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

            final HttpGet anncouncementsGet = new HttpGet("https://lehigh.doublemap.com/map/v2/announcements");
            final HttpGet routePathsGet = new HttpGet("https://lehigh.doublemap.com/map/v2/routes");
            final HttpGet stopsGet = new HttpGet("https://lehigh.doublemap.com/map/v2/stops");
            System.out.println("Hello World!");
            Spark.port(4567);
            Spark.get("/announcements", (req, res) -> {
                return getHttp(httpClient, anncouncementsGet, res);
            });
            Spark.get("/route_paths", (req, res) -> {
                return getHttp(httpClient, routePathsGet, res);
            });
            Spark.get("/stops", (req, res) -> {
                return getHttp(httpClient, stopsGet, res);
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
}
