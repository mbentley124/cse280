package bus.codyben.me;

import spark.Spark;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import spark.Request;
import spark.Response;
import spark.Route;

import bus.codyben.me.routefinder.RouteParser;

/**
 * Hello world!
 *
 */
public class App {
    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e1) {
            e1.printStackTrace();
        }

        if (args.length == 0 || args.length > 2) {
            System.out.println("Invalid number of arguments.");
            System.out.println("Use: routeparser <username> <password>");
            System.exit(126); // failed to start.
        }
        String username = args[0];
        String password = args[1];

        System.out.println(username + " : " + password);

        Connection conn;
        try {
            conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/busapp?serverTimezone=UTC", username,
                    password);

            Spark.port(4567);

            Spark.get("/routes", (req, res) -> {
                Map<Integer, List<List<String>>> routes = RouteParser.calculateRoutes(conn);
                return routes;
            });
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        // PreparedStatement preparedStatement = conn.prepareStatement("select distinct
        // route_id from lehighbusdata");
        // ResultSet results = preparedStatement.executeQuery();
        // while (results.next()) {
        // System.out.println(results.getInt("route_id"));
        // }

        // RouteParser.calculateRoutes(conn);

    }
}
