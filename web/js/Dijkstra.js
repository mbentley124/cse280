class Node {
    constructor(stop, d = Infinity) {
        this.stopid = stop
        this.d = d
        this.visited = false
    }
}

//TODO: going to have to add easy transfers to stopsGraph

var NodesArr = []
var minVal = Infinity
var start = new Node() //TODO: get starting stop (which one do I choose?)

//go through every node connected to this one

//create a copy of the graph. 
async function dijkstra(start, dest) {
    var start = calc_nearest_result(start); //get the nearest stop to the starting location
    var dest = calc_nearest_result(dest); //get the nearest stop to the destination location

    let DISTANCE = Infinity

    function visitNode(node, d) {
        node.visited = true
        node.d = d + 1
        if (node.stopid == dest) {
            DISTANCE = d
            return
        }
        visitNode(myGraph.get(node))
    }

    let myGraph = new Map(stopsGraph)
    let startNode = new Node(start, 0)

    //graph now has stop nodes instead of just stops 
    myGraph.forEach((value, key, map) => {
        for (let i = 0; i < value.length; i++) {
            value[i] = new Node(value[i])
        }
        map.set(key, value)

        if (key == start._stopid) { //TODO: won't work for lanta
            map.set(key, startNode)
        } else {
            map.set(key, new Node(key))
        }
    })

    //visit every connected node until we get to the dest
    myGraph.get(startNode).forEach((element) => {
        visitNode(element, 0)
    })

    console.log("Hello! ", DISTANCE)
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
            dijkstra(start, dest)
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