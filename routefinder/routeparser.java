/**
 * Finds bus routes by querying DB and then parsing repeating patterns
 */

 //imports
import java.sql.*;  
import java.io.*;
import java.util.*;
import java.util.function.BooleanSupplier;

class routeparser{

    private static String username;
    private static String password;
    private final static String host = "localhost"; //the database is firewalled off.
    private final static String PIVOT = "67";
    private final static String FALLBACK_PIVOT = "137"; //use this pivot is an error happens with the first one.

    
    /**
     * naively determine routes
     */
    private static HashMap<Integer, ArrayList<String>> naive_route_determ(HashMap<Integer, ArrayList<String>> routemap) {
        
        HashMap<Integer, ArrayList<String>> good_routes = new HashMap<>();
        
        for(int rid : routemap.keySet()) { //for every route id in the routemap
            System.out.print("\nFinding naive route for: "+rid+" ");
            
            good_routes.put(rid, find_same_route(routemap.get(rid)));
            System.out.print("...done\n");
        }

        System.out.println();
        return good_routes;

    }

    /**
     * helper method for naive_route_determ
     */
    private static ArrayList<String> find_same_route(ArrayList<String> routes) {
        String recent = "";
        ArrayList<String> res = new ArrayList<>();
        for(int i = 0; i < routes.size(); i++) {
            ArrayList<String> rmed = (ArrayList<String>)routes.clone();
            rmed.remove(i);
            String orig = routes.get(i);

            for(String cmpString : rmed) {
                if(cmpString.equals(orig)) {
                    if(recent.equals(orig)) {
                        continue;
                    }
                    recent = orig;
                    res.add(orig);
                }
            }

        }

        return res;
    }

    /**
     * Deduplicate adjacent stops
     * @param big_arr
     * @return
     */
    private static ArrayList<String> dedup_adjacent(String[] big_arr) {
        ArrayList<String> ret = new ArrayList<>();
        String old = big_arr[0];
        String curr;
        ret.add(old);
        for(int i = 1; i < big_arr.length; i++) {
            curr = big_arr[i];
            if(!curr.equals(old)) {
                ret.add(curr);
                old = curr;
            } 
        }

        return pivot_unwrap(ret, PIVOT); //PICK A PIVOT THAT ISN'T A LOOP STOP (i.e Taylor College, Farrington Square)
    }

    /**
     * helper for dedup_adjacent
     * @param deduped
     * @param pivot
     * @return
     */
    private static ArrayList<String> pivot_unwrap(ArrayList<String> deduped, String pivot) {
        ArrayList<String> ret = new ArrayList<>();
        boolean hitPivot = false;
        boolean second_pivot = false;
        boolean closed = true;  //set to false so you don't have a closed walk.

        ret.add(pivot); //add pivot as first stop.

        for(String s : deduped) {

            if(second_pivot && closed) {
                ret.add(s);
            } 

            if(second_pivot && s.equals(pivot)) {
                return ret; //we completed a cycle so return
            } else if(s.equals(pivot) && hitPivot) {
                second_pivot = true; //make sure we do a full cycle.
            } else if(s.equals(pivot)) {
                hitPivot = true;
            }


        }
        if(pivot.equals(FALLBACK_PIVOT)) {
            return null; //terminate recursion if the second pivot point fails.
        } else {
            return pivot_unwrap(deduped, FALLBACK_PIVOT);
        }
    }

    /**
     * main
     * parse arguments, connect to db
     */
    public static void main(String args[]) {
        //Parse args
        if(args.length == 0 || args.length > 2) {
            System.out.println("Invalid number of arguments.");
            System.out.println("Use: routeparser <username> <password>");
            System.exit(126); //failed to start.
        }
        username = args[0];
        password = args[1];
        
        
        HashMap<Integer, ArrayList<String>> route_map = new HashMap<>();

        //connect jdbc driver
        try {
            Class.forName("com.mysql.cj.jdbc.Driver"); 
        } catch (ClassNotFoundException e1) {
            System.out.println("here");
            e1.printStackTrace();
        }

        //contect to DB
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://"+host+":3306/busapp?serverTimezone=UTC", username, password);) {
            
            //prepare and execute our SQL query
            PreparedStatement preparedStatement = conn.prepareStatement("SELECT route_id,GROUP_CONCAT(last_stop), GROUP_CONCAT(insertion_time), GROUP_CONCAT(latitude), GROUP_CONCAT(longitude) from `transient_bus` WHERE last_stop is not null AND bus_service = \"Lehigh\" AND latitude is not nULL and longitude is not null GROUP BY route_id, bus_id,DATEDIFF(CURDATE(), insertion_time)");
            ResultSet results = preparedStatement.executeQuery();

            //iterate through bus routes
            while (results.next()) {
                System.out.println();
                String big_stop_str = results.getString("GROUP_CONCAT(last_stop)");
                // System.out.println("\t++"+big_stop_str);
                String big_stop_arr[] = big_stop_str.split(",");
                ArrayList<String> deduped = dedup_adjacent(big_stop_arr);
                int rid = results.getInt("route_id");

                System.out.println("++ ROUTE "+rid+" ++");
                if(deduped == null) {
                    System.out.println("Error in unwrapping. Skipping.");
                    System.out.println("Is your pivot value in the route?");
                    System.out.println("--------------------------------------------");
                    continue;
                }

                String route_str = "";

                //initialize a new list if it hasn't been done
                if(route_map.get(rid) == null) {
                    route_map.put(rid, new ArrayList<String>());
                } 

                route_str = Arrays.toString(deduped.toArray());
                System.out.println(route_str);
                // for(int s = 0; s < deduped.size() - 1; s++) {

                //     String stop = deduped.get(s); //if you just us
                //     route_str += stop+", "; 
                    
                //     System.out.print(stop+", ");
                // }
                ArrayList<String> temp = route_map.get(rid);
                temp.add(route_str);
                System.out.println("\n--------------------------------------------");

            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // get the routes naively (by simply iterating throught the list of stops)
        HashMap<Integer, ArrayList<String>> potentials = naive_route_determ(route_map);
        String json = "{"; //this is so terrible but the fastest way
        for(int rid : potentials.keySet()) {
            System.out.println("Potential routes for: "+rid);
            if((potentials.get(rid)).size() == 0) {
                System.out.println("\t+Could not determine a simple route.\n");
            }
            for(String r : potentials.get(rid)) {
                json += "\""+Integer.toString(rid) + "\": " + r.toString() + ",";
                System.out.println("\n"+r+"\n");
            }
        }
        json += "\"route\": true}";
        System.out.println(json);

    }
}