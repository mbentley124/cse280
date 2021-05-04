async function myDijkstra(start, dest) {
    var start = calc_nearest_result(start)._stopid; //get the nearest stop to the starting location
    var dest = calc_nearest_result(dest)._stopid; //get the nearest stop to the destination location
    var graph = new Graph()


    result = addAllStops(graph, start, dest)
    let nodes = result.nodes
    let startNode = result.startNode
    let destNode = result.destNode
    console.log(startNode)
    console.log(destNode)

    addAllEdges(nodes)
    console.log(graph)

    let dist = dijkstra(graph, startNode, destNode); // returns shortest distance between source and destination nodes
    console.log(dist)
}

function addAllStops(graph, start, dest) {
    var nodes = new Map() //maps key (stopid) to Graph Node
    stopsGraph.forEach((value, key, map) => {
        nodes.set(key, graph.addNode(key))
        if (key == start) {
            startNode = nodes.get(key)
        }
        if (key == dest) {
            destNode = nodes.get(key)
        }
    })
    return { nodes, startNode, destNode }
}

function addAllEdges(nodes) {
    stopsGraph.forEach((value, key, map) => {
        value.forEach((el) => {
            keyNode = nodes.get(key)
            recipient = nodes.get(el)
            keyNode.addEdge(recipient)
        })
    })
}



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


async function get_loc_onclick() {
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

            //Meaure Performance
            const t0 = performance.now()

            //Do the work
            myDijkstra(start, dest)
                .then(() => {
                    //End Measure Performance
                    const t1 = performance.now()
                    console.log("TIME: " + (t1 - t0))
                    mymap.off('click');
                });


        });

    });
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

    var result = sortByKey(dist_arr, "dist")[0].key
        // console.log(result)
        // var close_key = result.key;

    return result;
}