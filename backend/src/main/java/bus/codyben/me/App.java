//imports
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

        //connect to db
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/busapp?serverTimezone=UTC", "busapp", "busapp");) {
            PreparedStatement preparedStatement = conn.prepareStatement("select distinct route_id from lehighbusdata");
            ResultSet results = preparedStatement.executeQuery();
            while (results.next()) {
                System.out.println(results.getInt("route_id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        
        // System.out.println("Hello World!");
        Spark.port(4567); //the port to use

        //boilerplate. Will be replaced by our actual routes.
        Spark.get("/test", (req, res) -> {
            System.out.println("Hi");
            return "";
        });
    }
}
