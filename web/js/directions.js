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
 * If starting and dest stops are on different services, get user to 4th&New or Farrington, 
 * then have them transer to the other.
 */


/**
 * returns a string in the form:
 * "Get on {bus route} at {nearest bus stop to starting location}
 * Depart at {nearest bus stop to destination} and walk to destination."
 * @param {location} start the starting location
 * @param {location} dest the destination location
 */
async function get_directions(service) {
    await get_loc_onclick(service);
}

async function get_directions_worker(service, start, dest) {
    try {

        $("#directions_tab").toggle(); //make it visible
        $("#directions_tab").addClass("list-opened");
        $("#directions_child").remove(); //clear out old content

        var start_nearest = calc_nearest_result(start); //get the nearest stop to the starting location
        var dest_nearest = calc_nearest_result(dest); //get the nearest stop to the destination location

        //get list of routes associated with our stops
        var start_nearest_routes = await getRoutes(service, start_nearest);
        var dest_nearest_routes = await getRoutes(service, dest_nearest);

        var sameRoute = getRouteIfSame(start_nearest_routes, dest_nearest_routes);

        //if the starting and dest stops have a matching route
        directions_string = "Nothing.";
        if (sameRoute != null) {
            let routeName
            if (typeof sameRoute.name === "undefined") {
                routeName = sameRoute.LongName
            } else {
                routename = sameRoute.name
            } //Lanta and Lehigh route arrays have different var names
            directions_string = ("Get on " + routeName + " at " + start_nearest + ".<br><br>Depart at " + dest_nearest + " and walk to destination.");
            html_string = `<p id="directions_child">${directions_string}</p>`;
            $("#directions_tab").append(html_string);
            const coercedStart = { lat: start.lat, lng: start.long };
            const coercedDest = { lat: dest.lat, lng: dest.long };
            const vizDrxn = new VisualDirections(mymap, coercedStart, coercedDest, null, stop_arr[start_nearest]._latlng, stop_arr[dest_nearest]._latlng);
            vizDrxn.visualizeDirections();

        } else { //if they don't, find a connection along the two routes
            connection = route_connection(start_nearest_routes, dest_nearest_routes);
            if (connection != null) {
                directions_string = ("Get on " + sameRoute + " at " + start_nearest + ".<br><br>Transer to " + connection + " at " + connection + ". Depart at " + dest_nearest + " and walk to destination.");
                html_string = `<p id="directions_child">${directions_string}</p>`
                $("#directions_tab").append(html_string)
            } else {
                $("#directions_tab").append("Could not find directions using location given.");
            }
        }
    } catch (e) {
        console.error(e);
        $("#directions_tab").append("Could not find directions using location given.");
    }

}

function route_connection(start_nearest_routes, dest_nearest_routes) {
    //only works for Lehigh atm
    //iterate through all the routes at nearest starting stop
    for (var i = 0; i < start_nearest_routes.length; i++) {
        curr_route_stops = start_nearest_routes[i].stops

        for (var j = 0; j < curr_route_stops; j++) {

            for (var k = 0; k < dest_nearest_routes.length; k++) {
                dest_curr_route_stops = dest_nearest_routes[j].stops

                for (var z = 0; z < dest_curr_route_stops; z++) {
                    if (curr_route_stops[j] == dest_curr_route_stops[z]) {
                        return curr_route_stops[j].name;
                    }
                }
            }
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
//TODO: Need to get LANTA routes in routes[]
async function getRoutes(service, stopName) {
    if (service == "lehigh") {
        service = routes.lehigh
    } else if (service == "lanta") {
        service = routes.lanta
    } else throw 'Error: Not a service'
    var stopRoutes = []
    var stopid = stop_arr[stopName]._stopid
    for (var i of service) {
        if (i.stops.includes(stopid)) {
            stopRoutes.push(i)
        }
    }
    return stopRoutes;
}

function calc_nearest_result(location) {
    var lat = location.lat;
    var lon = location.long;
    var dist_arr = []
    for (let service in stops) {
        stops[service].forEach(function(stop) {
            var b_lat = parseFloat(stop.latitude);
            var b_lon = parseFloat(stop.longitude);
            var dist = distance(lat, lon, b_lat, b_lon, 'M');
            var key = stop.name;
            if (isNaN(dist)) {
                dist = 9999999999999;
            }
            dist_arr.push({ "key": key, "dist": dist, "r": dist.toString() });
        })
    }

    var result = sortByKey(dist_arr, "dist")[0];

    var close_key = result.key;



    return close_key;
}


async function get_loc_onclick(service) {
    $("#directions_instructions").empty();
    $("#directions_instructions").html("<p>Choose a starting location.</p>");

    mymap.on('click', function(e) {
        // const ex = get_directions_worker(start, { lat: e.latlng.lat, long: e.latlng.lng });
        start = { lat: e.latlng.lat, long: e.latlng.lng }
        $("#directions_instructions p").html("Choose a destination.");
        mymap.off('click');
        mymap.on('click', function(e) {
            dest = { lat: e.latlng.lat, long: e.latlng.lng }
            $("#directions_instructions").toggle();
            $('#directions_instructions').removeClass('list-opened');
            const ex = get_directions_worker(service, start, dest);
            ex.then(() => {
                mymap.off('click');
            });
        });

    });
}