package bus.codyben.me.routefinder;

import java.sql.*;
import java.util.*;

public class RouteParser {

    private final static String PIVOT = "Williams Hall";
    private final static String FALLBACK_PIVOT = "Whitaker Lab"; // use this pivot is an error happens with the first
                                                                 // one.

    private static Map<Integer, List<List<String>>> naive_route_determ(Map<Integer, List<List<String>>> routemap) {
        Map<Integer, List<List<String>>> good_routes = new HashMap<>();
        for (int rid : routemap.keySet()) {
            System.out.print("\nFinding naive route for: " + rid + " ");

            good_routes.put(rid, find_same_route(routemap.get(rid)));
            System.out.print("...done\n");
        }

        System.out.println();
        return good_routes;

    }

    private static List<List<String>> find_same_route(List<List<String>> routes) {
        List<String> recent = new ArrayList<>();
        List<List<String>> out = new ArrayList<>();
        for (int i = 0; i < routes.size(); i++) {
            List<String> current_route = routes.get(i);

            for (int x = 0; x < routes.size(); x++) {
                if (x != i) {
                    List<String> cmp_route = routes.get(x);
                    if (current_route.equals(cmp_route)) {
                        if (!recent.equals(current_route)) {
                            recent = current_route;
                            out.add(current_route);
                        }
                    }
                }
            }
        }

        return out;
    }

    private static ArrayList<String> dedup_adjacent(String[] big_arr) {
        ArrayList<String> ret = new ArrayList<>();
        String old = big_arr[0];
        String curr;
        ret.add(old);
        for (int i = 1; i < big_arr.length; i++) {
            curr = big_arr[i];
            if (!curr.equals(old)) {
                ret.add(curr);
                old = curr;
            }
        }

        return pivot_unwrap(ret, PIVOT); // PICK A PIVOT THAT ISN'T A LOOP STOP (i.e Taylor College, Farrington Square)
    }

    private static ArrayList<String> pivot_unwrap(ArrayList<String> deduped, String pivot) {
        ArrayList<String> ret = new ArrayList<>();
        boolean hitPivot = false;
        boolean second_pivot = false;
        boolean closed = true; // set to false so you don't have a closed walk.

        ret.add(pivot); // add pivot as first stop.

        for (String s : deduped) {

            if (second_pivot && closed) {
                ret.add(s);
            }

            if (second_pivot && s.equals(pivot)) {
                return ret; // we completed a cycle so return
            } else if (s.equals(pivot) && hitPivot) {
                second_pivot = true; // make sure we do a full cycle.
            } else if (s.equals(pivot)) {
                hitPivot = true;
            }

        }
        if (pivot.equals(FALLBACK_PIVOT)) {
            return null; // terminate recursion if the second pivot point fails.
        } else {
            return pivot_unwrap(deduped, FALLBACK_PIVOT);
        }
    }

    public static Map<Integer, List<List<String>>> calculateRoutes(Connection conn) {

        HashMap<Integer, List<List<String>>> route_map = new HashMap<>();

        try (PreparedStatement preparedStatement = conn.prepareStatement(
                "SELECT route_id,GROUP_CONCAT(current_stop), GROUP_CONCAT(retrieved), GROUP_CONCAT(latitude), GROUP_CONCAT(longitude) from `lehighbusdata` WHERE current_stop is not null AND current_stop != 'NULL' AND latitude is not nULL and longitude is not null GROUP BY route_id, vehicle_id,DATEDIFF(CURDATE(), retrieved)");
                ResultSet results = preparedStatement.executeQuery();) {
            while (results.next()) {
                System.out.println();
                String big_stop_str = results.getString("GROUP_CONCAT(current_stop)");
                // System.out.println("\t++"+big_stop_str);
                String big_stop_arr[] = big_stop_str.split(",");
                ArrayList<String> deduped = dedup_adjacent(big_stop_arr);
                int rid = results.getInt("route_id");

                System.out.println("++ ROUTE " + rid + " ++");
                if (deduped == null) {
                    System.out.println("Error in unwrapping. Skipping.");
                    System.out.println("Is your pivot value in the route?");
                    System.out.println("--------------------------------------------");
                    continue;
                }

                // String route_str = "";

                // initialize a new list if it hasn't been done
                if (route_map.get(rid) == null) {
                    route_map.put(rid, new ArrayList<List<String>>());
                }

                // route_str = deduped;
                System.out.println(Arrays.toString(deduped.toArray()));
                // for(int s = 0; s < deduped.size() - 1; s++) {

                // String stop = deduped.get(s); //if you just us
                // route_str += stop+", ";

                // System.out.print(stop+", ");
                // }
                List<List<String>> temp = route_map.get(rid);
                temp.add(deduped);
                System.out.println("\n--------------------------------------------");

            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        Map<Integer, List<List<String>>> potentials = naive_route_determ(route_map);
        for (int rid : potentials.keySet()) {
            System.out.println("Potential routes for: " + rid);
            if ((potentials.get(rid)).size() == 0) {
                System.out.println("\t+Could not determine a simple route.\n");
            }
            for (List<String> r : potentials.get(rid)) {
                System.out.println("\n" + Arrays.toString(r.toArray()) + "\n");
            }
        }

        return potentials;
    }
}