package bus.codyben.me;

import spark.Spark;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;


import spark.Request;
import spark.Response;
import spark.Route;

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

        if(args.length == 0 || args.length > 2) {
            System.out.println("Invalid number of arguments.");
            System.out.println("Use: routeparser <username> <password>");
            System.exit(126); //failed to start.
        }
        username = args[0];
        password = args[1];

        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/busapp?serverTimezone=UTC", username, password);) {
            PreparedStatement preparedStatement = conn.prepareStatement("select distinct route_id from lehighbusdata");
            ResultSet results = preparedStatement.executeQuery();
            while (results.next()) {
                System.out.println(results.getInt("route_id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        System.out.println("Hello World!");
        Spark.port(4567);
        Spark.get("/test", (req, res) -> {
            System.out.println("Hi");
            return "";
        });
    }
}
