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

/**
 * Boilerplate code for a Java Spark web server.
 */

/**
 * Hello world!
 *
 */
public class App {
    public static void main(String[] args) {

        //import the jdbc driver
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e1) {
            e1.printStackTrace();
        }
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/busapp?serverTimezone=UTC", "busapp", "busapp");) {
            final PreparedStatement preparedStatement = conn.prepareStatement("select distinct route_id from lehighbusdata");
            final ResultSet results = preparedStatement.executeQuery();
            while (results.next()) {
                System.out.println(results.getInt("route_id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        int connectTimeout = 250;
        RequestConfig config = RequestConfig.custom()
                                            .setConnectTimeout(connectTimeout)
                                            .setConnectionRequestTimeout(connectTimeout)
                                            .setSocketTimeout(connectTimeout)
                                            .build();

        final CloseableHttpClient httpClient = HttpClients.custom()
                                                          .setRetryHandler(( exception,  executionCount,  context) -> (executionCount < 3))
                                                          .setDefaultRequestConfig(config)
                                                          .build();
        
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
