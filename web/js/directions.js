/**
 * general algorithm (Note: doesn't work for disjoint routes):
 * 
 * find bus stop that is closest to starting point
 * find bus stop that is closest to destination
 * 
 * Are those stops on the same route?
 * If not, do their routes contain the same stop?
 * 
 * if so, give first instance of shared stop after starting_stop
 */

/**
 * returns a string in the form:
 * "Get on {bus route} at {nearest bus stop to starting location}
 * Depart at {nearest bus stop to destination} and walk to destination."
 * @param {location} start the starting location
 * @param {location} dest the destination location
 */
function get_directions(start, dest) {

    var start_nearest = calc_nearest_result(start);
    var dest_nearest = calc_nearest_result(dest);

    //TODO: I need a routes list
    //TODO: define getRoutes();

    //get list of routes associated with our stops
    var start_nearest_routes = getRoutes(start_nearest);
    var dest_nearest_routes = getRoutes(dest_nearest);

    var sameRoute = getRouteIfSame(start_nearest_routes, dest_nearest_routes);

    if (sameRoute != null) {
        //TODO: idk if these are strings
        return ("Get on " + sameRoute + " at " + start_nearest + "\nDepart at " + dest_nearest + " and walk to destination.")
    }

}

//one stop can have multiple routes, so I have to check if any route for start_nearest is the same has any route for dest_nearest
//TODO: I imagine theres a faster way to do this
function getRouteIfSame(start_nearest_routes, dest_nearest_routes) {
    for (i in start_nearest_routes) {
        for (j in dest_nearest_routes) {
            if (i == j) {
                return i;
            }
        }
    }
    return null;
}

function getRoutes(stopName) {
    routes = [];
    for (i in routes.lehigh) {
        if (i.name == stopName) {
            routes.push(i.name)
        }
    }
    if (routes.length == 0) {
        for (i in routes.lanta) {
            if (i.name == stopName) {
                routes.push(i.name)
            }
        }
    }
    return routes;
}



function calc_nearest_result(location) {
    var lat = location._marker._latlng.lat;
    var lon = location._marker._latlng.lng;
    var dist_arr_lu = []
    var dist_arr_lanta = []
        //replace with combined stops array
    $.each(stops.lehigh, function() { //LOOP: interates through each route for Lehigh
        var b_lat = parseFloat(this.latitude);
        var b_lon = parseFloat(this.longitude);
        var dist = distance(lat, lon, b_lat, b_lon, 'M');
        var key = this.name;
        if (isNaN(dist)) {
            dist = 9999999999999;
        }
        dist_arr_lu.push({ "key": key, "dist": dist, "r": dist.toString() });
    });

    $.each(stops.lanta, function() { //LOOP: interates through each route for LANTA
        var b_lon = this.longitude;
        var b_lat = this.latitude;
        var dist = distance(lat, lon, b_lat, b_lon, 'M');
        // console.log(dist);
        if (isNaN(dist)) {
            dist = 9999999999999;
        }
        var key = this.name;
        dist_arr_lanta.push({ "key": key, "dist": dist, "r": dist.toString() });
        // console.log(dist_arr_lanta);
    });
    var result_lu = sortByKey(dist_arr_lu, "dist")[0];
    var result_lanta = sortByKey(dist_arr_lanta, "dist")[0];
    var close_key = result_lu.key;
    var close_dist = result_lu.dist;
    if (result_lanta.dist < result_lu.dist) {
        close_key = result_lanta.key;
        close_dist = result_lanta.dist;
    }

    return [close_key, close_dist];
}