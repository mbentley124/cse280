class Node {
    constructor(stop, d = Infinity) {
        this.stopid = stop
        this.d = d
        this.equals = function(otherNode) {
            if (this.stopid == otherNode.stopid) {
                return true
            }
            return false;
        }
        this.adjacent = [] //holds adjacent nodes
        this.path = [] // holds currPath to this node

        this.addAdjacent = function(node) {
            this.adjacent.push(node)
                // node.adjacent.push(this)
        }
        this.updateDistance = function(dist) {
            this.d = dist
        }
        this.updatePath = function(pathToHere) {
            pathToHere.push(this)
            this.path = pathToHere
        }
    }
}

//TODO: going to have to add easy transfers to stopsGraph

//create a copy of the graph. 
async function dijkstra(start, dest) {

    initHTML()

    var start = calc_nearest_result(start)._stopid; //get the nearest stop to the starting location
    var dest = calc_nearest_result(dest)._stopid; //get the nearest stop to the destination location

    //TRY 3
    var graph = loadNodes()
    let RESULT

    function explore(node, dist, path) {
        if (dist >= node.d) {
            return
        }
        node.updateDistance(dist + 1)
        node.updatePath(path)
        if (node.stopid == dest) { //if we reach the dest
            RESULT = node.path
            return
        }
        //otherwise, explore adjacents
        for (let i = 0; i < node.adjacent.length; i++) {
            explore(node.adjacent[i], node.d, node.path.map((x) => x))
                //need to use map to avoid all nodes referencing the same node.path array
        }

    }

    let startNodeNum
    for (let i = 0; i < graph.length; i++) {
        if (graph[i].stopid == start) {
            startNodeNum = i
        }
    }

    explore(graph[startNodeNum], 0, [])


    let startingStopID = RESULT[0].stopid
    let destStopID = RESULT[RESULT.length - 1].stopid
    let startingStop = getStopFromID(startingStopID)
    let destStop = getStopFromID(destStopID)
    renderHTML(startingStop.type, startingStop._popup._content, destStop._popup._content)

}

/**
 * helper to find the Node corresponding to a stopid
 * @param {[Node]} graph in which to find the nodes
 * @param {int} stopid the stopid of the node we are looking for
 * @returns 
 */
function findNode(graph, stopid) {
    for (let i of graph) {
        if (i.stopid == stopid) {
            return i
        }
    }
}

/**
 * helper to convert map of stopid's to graph of Nodes
 * @returns a graph (implemented as an arr of nodes)
 */
function loadNodes() {
    let graph = [] //will just be an array of nodes

    stopsGraph.forEach((value, key) => { //add all of the elements from the map
        currNode = new Node(key)
        graph.push(currNode)
    })

    stopsGraph.forEach((value, key) => { //add all of the elements from the map
        currNode = findNode(graph, key)
        value.forEach((el) => {
            newNode = findNode(graph, el)
            currNode.addAdjacent(newNode)
        })
    })

    return graph
}

/**
 *  initialize the dispay box for the html
 */
function initHTML() {
    $("#directions_tab").show(); //make it visible
    $("#directions_tab").addClass("list-opened");
    $("#directions_child").remove(); //clear out old content
}

/**
 * helper to display directions in html
 */
function renderHTML(startRoute, startStop, destStop) {
    let directions_string = "Get on " + startRoute + " at " + startStop + ". " + "Get off at " + destStop + " and walk to destination"
    html_string = `<p id="directions_child">${directions_string}</p>`;
    $("#directions_tab").append(html_string);
}

/**
 * find the stop object pertaining to stopid
 * @param {int} stopid 
 * @returns the stop object from stop_arr
 */
function getStopFromID(stopid) {
    for (i in stop_arr) {
        if (stop_arr[i]._stopid == stopid) {
            return stop_arr[i]
        }
    }
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

    var result = sortByKey(dist_arr, "dist")[0].key

    return result;
}




//TESTING
// setTimeout(function() { //wait for stopsGraph to finish (async)
//     dijkstra(206, 207) //lehigh to lehigh, one stop
//     dijkstra(206, 208) //lehigh to lehigh, multistop
//     dijkstra(4587, 4583) //lanta to lanta, one stop
//     dijkstra(4591, 4583) //lanta to lanta, multistop
//     dijkstra(4591, 207) //lanta to lehigh
// }, 1000)