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
 * 
 * lehigh_route_stop_ids
 */


/**
 * returns a string in the form:
 * "Get on {bus route} at {nearest bus stop to starting location}
 * Depart at {nearest bus stop to destination} and walk to destination."
 * @param {location} start the starting location
 * @param {location} dest the destination location
 */
async function get_directions() {
    //set up UI
    if ($("#directions_tab").is(":visible")) {
        $("#directions_tab").toggle();
        return
    }
    $("#directions_tab").empty();
    // $("#directions_choice").show();
    $("#directions_instructions").toggle();
    $("#directions_instructions p").html("Choose a starting location.");

    await get_loc_onclick();
}

async function get_directions_worker(start, dest) {
    try {
        $("#directions_tab").toggle(); //make it visible
        $("#directions_child").remove(); //clear out old content

        //if we passed a browser location object instead of lat/long pair
        // if (typeof start == typeof(lc)) {
        //     var start2 = [];
        //     start2.lat = start._marker._latlng.lat;
        //     start2.long = start._marker._latlng.lng;
        //     start = start2;
        // }

        // if (typeof dest == typeof(lc)) {
        //     dest2 = [];
        //     dest2.lat = dest._marker._latlng.lat;
        //     dest2.long = dest._marker._latlng.lng;
        // }
        // try {
        //     dest2 = {};
        //     dest2.lat = dest._marker._latlng.lat;
        //     dest2.long = dest._marker._latlng.lng;
        //     dest = dest2;
        // } catch (e) {}

        var start_nearest = calc_nearest_result(start);
        var dest_nearest = calc_nearest_result(dest);

        //get list of routes associated with our stops
        var start_nearest_routes = await getRoutes(start_nearest);
        var dest_nearest_routes = await getRoutes(dest_nearest);

        var sameRoute = getRouteIfSame(start_nearest_routes, dest_nearest_routes);

        //the starting and dest stops have a matching route
        directions_string = "Nothing.";
        if (sameRoute != null) {
            directions_string = ("Get on " + sameRoute + " at " + start_nearest + ".<br>Depart at " + dest_nearest + " and walk to destination.");
            html_string = `<p id="directions_child">${directions_string}</p>`
            $("#directions_tab").append(html_string)

        } else {
            connection = route_connection(start_nearest_routes, dest_nearest_routes);
            if (connection != null) {
                directions_string = ("Get on " + sameRoute + " at " + start_nearest + ".<br>Transer to " + connection + " at " + connection + ". Depart at " + dest_nearest + " and walk to destination.");
                html_string = `<p id="directions_child">${directions_string}</p>`
                $("#directions_tab").append(html_string)
            }
            $("#directions_tab").append("Could not find directions using location given.");
        }
    } catch (e) {
        console.error(e)
        $("#directions_tab").append("Could not find directions using location given.");
    }

}

function route_connection(start_nearest_routes, dest_nearest_routes) {
    //only works for Lehigh atm
    //iterate through all the routes at nearest starting stop
    for (var i = 0; i < start_nearest_routes.length(); i++) {
        curr_route_stops = routes.lehigh[start_nearest_routes[i]].stops

        for (var j = 0; j < curr_route_stops; j++) {

            for (var k = 0; k < dest_nearest_routes.length(); k++) {
                dest_curr_route_stops = routes.lehigh[dest_nearest_routes[i]].stops

                for (var z = 0; z < dest_curr_route_stops; z++) {
                    if (curr_route_stops[j] == dest_curr_route_stops[z]) {
                        return stopid_to_name("lehigh", curr_route_stops[j]);
                    }
                }
            }
        }
    }
}

function stopid_to_name(service, id) {
    for (var i = 0; stops.service.length(); i++) {
        if (stops.service[i].stop_id == id) {
            return stops.service[i].name;
        }
    }
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
    stopid = stop_arr[stopName]._stopid
    for (var i = 0; i < routes.lehigh.length; i++) {
        if (routes.lehigh[i].stops.includes(stopid)) {
            stopRoutes.push(routes.lehigh[i].name)
        }
    }
    return stopRoutes;
}

function get_stops_into_routes(routes) {

}

function calc_nearest_result(location) {
    var lat = location.lat;
    var lon = location.long;
    var dist_arr_lu = []
    var dist_arr_lanta = []
    LEHIGH_STOPS_INFO.forEach(function(value) {
        var b_lat = parseFloat(value.latitude);
        var b_lon = parseFloat(value.longitude);
        var dist = distance(lat, lon, b_lat, b_lon, 'M');
        var key = value.name;
        if (isNaN(dist)) {
            dist = 9999999999999;
        }
        dist_arr_lu.push({ "key": key, "dist": dist, "r": dist.toString() });
    })

    // $.each(stops.lanta, function() { //LOOP: interates through each stop for LANTA
    //     var b_lon = this.longitude;
    //     var b_lat = this.latitude;
    //     var dist = distance(lat, lon, b_lat, b_lon, 'M');
    //     // console.log(dist);
    //     if (isNaN(dist)) {
    //         dist = 9999999999999;
    //     }
    //     var key = this.name;
    //     dist_arr_lanta.push({ "key": key, "dist": dist, "r": dist.toString() });
    //     // console.log(dist_arr_lanta);
    // });
    var result_lu = sortByKey(dist_arr_lu, "dist")[0];
    // var result_lanta = sortByKey(dist_arr_lanta, "dist")[0];
    var close_key = result_lu.key;
    // var close_dist = result_lu.dist;

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


async function get_loc_onclick() {
    mymap.on('click', function(e) {
        // const ex = get_directions_worker(start, { lat: e.latlng.lat, long: e.latlng.lng });
        start = { lat: e.latlng.lat, long: e.latlng.lng }
        $("#directions_instructions p").html("Choose a destination.");
        mymap.off('click');
        mymap.on('click', function(e) {
            dest = { lat: e.latlng.lat, long: e.latlng.lng }
            $("#directions_instructions").toggle();
            const ex = get_directions_worker(start, dest);
            ex.then(() => {
                mymap.off('click');
            });
        });

    });
}