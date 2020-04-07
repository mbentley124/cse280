package bus.codyben.me;

import spark.Spark;
import spark.Request;
import spark.Response;
import spark.Route;

/**
 * Hello world!
 *
 */
public class App {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        Spark.port(4567);
        Spark.get("/test", (req, res) -> {
            System.out.println("Hi");
            return "";
        });
    }
}
