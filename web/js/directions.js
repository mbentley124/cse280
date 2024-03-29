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

//How many nearest stops to consider:
const NUM_NEAREST_STOPS = 5


/**
 * returns a string in the form:
 * "Get on {bus route} at {nearest bus stop to starting location}
 * Depart at {nearest bus stop to destination} and walk to destination."
 * @param {location} start the starting location
 * @param {location} dest the destination location
 */
async function get_directions() {
    await get_loc_onclick();
}

function htmlHelper() {
    $("#directions_tab").show(); //make it visible
    $("#directions_tab").addClass("list-opened");
    $("#directions_child").remove(); //clear out old content
}

async function get_directions_worker(start, dest, transService = null) {
    try {

        if (transService == null) {
            htmlHelper();
        }

        var start_nearest_arr = calc_nearest_result(start); //get the nearest stop to the starting location
        var dest_nearest_arr = calc_nearest_result(dest); //get the nearest stop to the destination location

        for (var start_nearest of start_nearest_arr) {
            for (var dest_nearest of dest_nearest_arr) {
                if ((start_nearest.type != dest_nearest.type) && //if start stop is on lanta, and dest is on lehigh or vice versa
                    (transService == null)) { //also have to make sure we aren't currently working on transfer to avoid infinite loop
                    if (start_nearest.type == "lehigh") {
                        await get_directions_worker(start, {
                            lat: stop_arr["Farrington Square Bus Stop (new)"]._latlng.lat,
                            long: stop_arr["Farrington Square Bus Stop (new)"]._latlng.lng
                        }, 'lehigh')
                        await get_directions_worker({
                            lat: stop_arr["4TH&NEWw"]._latlng.lat,
                            long: stop_arr["4TH&NEWw"]._latlng.lng
                        }, dest, 'lehigh')
                    } else if (start_nearest.type == "lanta") {
                        await get_directions_worker(start, {
                            lat: stop_arr["4TH&NEWw"]._latlng.lat,
                            long: stop_arr["4TH&NEWw"]._latlng.lng
                        }, 'lanta')
                        await get_directions_worker({
                            lat: stop_arr["Farrington Square Bus Stop (new)"]._latlng.lat,
                            long: stop_arr["Farrington Square Bus Stop (new)"]._latlng.lng
                        }, dest, 'lanta')
                    }
                    return
                }

                //get list of routes associated with our stops
                var start_nearest_routes = await getRoutes(start_nearest);
                var dest_nearest_routes = await getRoutes(dest_nearest);

                var sameRoute = getRouteIfSame(start_nearest_routes, dest_nearest_routes);

                var directions_string;

                var ending;
                switch (transService) {
                    case 'lehigh':
                        ending = '4th & New'
                        break
                    case 'lanta':
                        ending = 'Farrington Sqaure Bus Stop'
                        break
                    default:
                        ending = 'destination'
                }

                if (sameRoute != null) { //if the starting and dest stops have a matching route

                    let routeName
                    if (typeof sameRoute.name === "undefined") { //Lanta and Lehigh route arrays have different var names
                        routeName = sameRoute.LongName
                    } else {
                        routeName = sameRoute.name
                    }
                    startingStopName = getStopName(start_nearest)
                    destStopName = getStopName(dest_nearest)
                    directions_string = ("Get on " + routeName + " at " + startingStopName + ".<br><br>Depart at " + destStopName + " and walk to " + ending + ".");
                    html_string = `<p id="directions_child">${directions_string}</p>`;
                    $("#directions_tab").append(html_string);

                    return

                    //CODY'S STUFF?
                    // const coercedStart = { lat: start.lat, lng: start.long };
                    // const coercedDest = { lat: dest.lat, lng: dest.long };
                    // const vizDrxn = new VisualDirections(mymap, coercedStart, coercedDest, null, stop_arr[start_nearest]._latlng, stop_arr[dest_nearest]._latlng);
                    // vizDrxn.visualizeDirections();

                } else { //if they don't, find a connection along the two routes
                    connection = route_connection(start_nearest_routes, dest_nearest_routes);
                    if (connection != null) {
                        directions_string = ("Get on " + sameRoute + " at " + start_nearest + ".<br><br>Transer to " + connection + " at " + connection + ". Depart at " + dest_nearest + " and walk to " + ending + ".");
                        html_string = `<p id="directions_child">${directions_string}</p>`
                        $("#directions_tab").append(html_string)
                        return
                    }
                }
            }
        }

        //no route found
        $("#directions_tab").append("Could not find directions using location given.");
    } catch (e) {
        console.error(e);
        $("#directions_tab").append("Could not find directions using location given.");
    }

}

function getStopName(stop) {
    let service
    if (stop.type == "lanta") {
        service = stops.lanta
    } else if (stop.type == "lehigh") {
        service = stops.lehigh
    }

    for (let i of service) {
        if (i.stop_id == stop._stopid) {
            return i.name
        }
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

async function getRoutes(stop) {
    if (stop.type == "lehigh") {
        service = routes.lehigh
    } else if (stop.type == "lanta") {
        service = routes.lanta
    } else throw 'Error: Not a service'
    var stopRoutes = []

    var stopid = stop._stopid
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
    for (let stop in stop_arr) {
        stop = stop_arr[stop]
        let b_lat = parseFloat(stop._latlng.lat);
        let b_lon = parseFloat(stop._latlng.lng);
        let dist = distance(lat, lon, b_lat, b_lon, 'M');
        let key = stop;
        if (isNaN(dist)) {
            dist = 9999999999999;
        }
        dist_arr.push({ "key": key, "dist": dist, "r": dist.toString() });
    }


    // var results = sortByKey(dist_arr, "dist").slice(0, NUM_NEAREST_STOPS);
    // results.forEach

    var results = sortByKey(dist_arr, "dist").slice(0, NUM_NEAREST_STOPS).map(i => i.key)

    return results;
}


async function get_loc_onclick() {
    $("#directions_instructions").empty();
    $("#directions_instructions").html("<p>Choose a starting location.</p>");

    mymap.on('click', function(e) {
        // const ex = get_directions_worker(start, { lat: e.latlng.lat, long: e.latlng.lng });
        start = { lat: e.latlng.lat, long: e.latlng.lng }
        $("#directions_instructions p").html("Choose a destination.");
        mymap.off('click');
        mymap.on('click', async function(e) {
            dest = { lat: e.latlng.lat, long: e.latlng.lng }
            $("#directions_instructions").toggle();
            $('#directions_instructions').removeClass('list-opened');

            //Meaure Performance
            let perArr = []
            for (let i = 0; i < 50; i++) {
                const t0 = performance.now()

                //Do the work
                await get_directions_worker(start, dest)
                    .then(() => {
                        //End Measure Performance
                        perArr.push(performance.now() - t0)
                            // console.log("TIME: " + (t1 - t0))
                        mymap.off('click');
                    });
            }
            setTimeout(() => {
                let sum = 0
                for (let i = 0; i < perArr.length; i++) {
                    console.log(perArr[i])
                    sum += perArr[i]
                }
                console.log(sum / 50)
            }, 5000)
        });

    });
}