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
async function get_directions(start) {
    $("#directions_instructions").toggle();

    await get_loc_onclick(start);
}

async function get_directions_worker(start, dest) {

    //set up UI
    if ($("#directions_tab").is(":visible")) {
        $("#directions_tab").toggle();
        return
    }
    $("#directions_tab").toggle(); //make it visible
    $("#directions_child").remove(); //clear out old content

    //if we passed a browser location object instead of lat/long pair
    if (typeof start == typeof(lc)) {
        var start2 = [];
        start2.lat = start._marker._latlng.lat;
        start2.long = start._marker._latlng.lng;
        start = start2;
    }

    // if (typeof dest == typeof(lc)) {
    //     dest2 = [];
    //     dest2.lat = dest._marker._latlng.lat;
    //     dest2.long = dest._marker._latlng.lng;
    // }
    try {
        dest2 = {};
        dest2.lat = dest._marker._latlng.lat;
        dest2.long = dest._marker._latlng.lng;
        dest = dest2;
    } catch(e) {}

    var start_nearest = calc_nearest_result(start);
    var dest_nearest = calc_nearest_result(dest);

    //get list of routes associated with our stops
    var start_nearest_routes = await getRoutes(start_nearest);
    var dest_nearest_routes = await getRoutes(dest_nearest);

    var sameRoute = getRouteIfSame(start_nearest_routes, dest_nearest_routes);

    //the starting and dest stops have a matching route
    if (sameRoute != null) {
        directions_string = ("Get on " + sameRoute + " at " + start_nearest + ".<br>Depart at " + dest_nearest + " and walk to destination.");
        html_string = `<p id="directions_child">${directions_string}</p>`
        $("#directions_tab").append(html_string)

        return directions_string
    }

    $("#directions_tab").append("Could not find directions using location given.")
    return "Nothing"

}



//one stop can have multiple routes, so I have to check if any route for start_nearest is the same as any route for dest_nearest
//TODO: I imagine theres a faster way to do this
function getRouteIfSame(start_nearest_routes, dest_nearest_routes) {
    for (i in start_nearest_routes) {
        for (j in dest_nearest_routes) {
            if (start_nearest_routes[i] == dest_nearest_routes[j]) {
                return start_nearest_routes[i];
            }
        }
    }
    return null;
}

//TODO: Only works for Lehigh atm
async function getRoutes(stopName) {
    var stopRoutes = []
        // const routes = await fetch("temp_routes_lu.json")
        //     .then((data) => data.json())
        //     .then(
        //         (parsed) => {
        //             const routes = [];

    //             $.each(parsed, function() {
    //                 // console.log(this);
    //                 const { color, path, name } = this;
    //                 routes.push({ color: color, path: path, name: name });
    //             });

    //             return routes;
    //         }
    //     );
    stopid = stop_arr[stopName]._stopid
    for (var i = 0; i < routes.lehigh.length; i++) {
        if (routes.lehigh[i].stops.includes(stopid)) {
            stopRoutes.push(routes.lehigh[i].name)
        }
    }
    // if (routes.length == 0) {
    //     for (i in routes.lanta) {
    //         if (i.name == stopName) {
    //             routes.push(i.name)
    //         }
    //     }
    // }
    return stopRoutes;
}

function get_stops_into_routes(routes) {

}

function calc_nearest_result(location) {
    var lat = location.lat;
    var lon = location.long;
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

    //TODO: this will be needed for using LANTA
    // if (result_lanta.dist < result_lu.dist) {
    //     close_key = result_lanta.key;
    //     close_dist = result_lanta.dist;
    // }

    return close_key;
}

// function get_same_stops(routesList1, routesList2) {
//     for (i in routesList1) {
//         for (j in routes.lehigh.name == i)
//             if (route2.stops.includes(i)) {
//                 return stops.i
//             }
//     }
// }


async function get_loc_onclick(start) {
    console.log(start);
    mymap.on('click', function(e) {

        const ex = get_directions_worker(start, {lat: e.latlng.lat, long: e.latlng.lng});
        ex.then(() => {
            mymap.off('click');
            console.log(ex);
        });


    })
}