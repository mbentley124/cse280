// class Node {
//     constructor(stop, d = Infinity) {
//         this.stopid = stop
//         this.d = d
//         this.equals = function(otherNode) {
//             if (this.stopid == otherNode.stopid) {
//                 return true
//             }
//             return false;
//         }
//     }
// }

// //TODO: going to have to add easy transfers to stopsGraph

// var NodesArr = []
// var minVal = Infinity
// var start = new Node() //TODO: get starting stop (which one do I choose?)

// //go through every node connected to this one

// //create a copy of the graph. 
// async function dijkstra(start, dest) {
//     var start = calc_nearest_result(start)._stopid; //get the nearest stop to the starting location
//     var dest = calc_nearest_result(dest)._stopid; //get the nearest stop to the destination location

//     let myGraph = new Map()

//     myGraph.findPairById = function(stopid, stopNode = null) {
//         for (const [key, children] of this.entries()) {
//             if (key.stopid == stopid) {
//                 return { key, children }
//             }
//         }
//         return null
//     }

//     myGraph.findPairByNode = function(stopid, stopNode = null) {
//         for (const [key, children] of this.entries()) {
//             if (key.equals(stopNode)) {
//                 return { key, children }
//             }
//         }
//         return null
//     }

//     //make a new graph each time we want to search (to set distances to 0)
//     //TODO: maybe should preprocess and then just clear distances to 0 for each run?
//     stopsGraph.forEach((children, currStop, graph) => {
//         // let childrenAsNodes = []
//         // for (let i = 0; i < children.length; i++) {
//         //     childrenAsNodes.push(new Node(children[i]))
//         // }
//         myGraph.set(new Node(currStop), children)
//     })

//     function explore(currNode, destNode, distance) { //NOT SURE IF THIS ACTUALLY CHANGES THE ITEM IN THE MAP
//         if (currNode.distance > distance) {
//             currNode.distance = distance
//             return
//         }
//         if (currNode.key.equals(destNode)) {
//             DISTANCE = currNode.distance
//             return
//         }
//         children = currNode.children
//         for (let i = 0; i < children.length; i++) {
//             let nextNode = myGraph.findPairById(children[i])
//             explore(nextNode, destNode, distance++)
//         }
//     }

//     let startNode = myGraph.findPairById(start)
//     let destNode = myGraph.findPairById(dest)

//     let DISTANCE

//     explore(startNode, destNode, 0)
//     console.log(DISTANCE)

//     // let DISTANCE = Infinity //start off by setting the distance to the dest to infinity

//     // let myGraph = new Map()
//     // let startNode = new Node(start, 0)

//     // function visitNode(node, d) {
//     //     node.visited = true
//     //     node.d = d + 1
//     //     if (node.stopid == dest) {
//     //         DISTANCE = d
//     //         return
//     //     }
//     //     visitNode(myGraph.get(node))
//     // }

//     // //graph now has stop nodes instead of just stops 
//     // stopsGraph.forEach((value, key, map) => {
//     //     var keyNode = new Node(key)

//     //     for (let i = 0; i < value.length; i++) { //change arrays of stopids to Node arrays
//     //         value[i] = new Node(value[i])
//     //     }

//     //     myGraph.set(keyNode, value)


//     // })

//     // //visit every connected node until we get to the dest
//     // myGraph.get(startNode).forEach((element) => {
//     //     visitNode(element, 0)
//     // })

//     // console.log("Hello! ", DISTANCE)
// }



// /**
//  * returns a string in the form:
//  * "Get on {bus route} at {nearest bus stop to starting location}
//  * Depart at {nearest bus stop to destination} and walk to destination."
//  * @param {location} start the starting location
//  * @param {location} dest the destination location
//  */
// async function get_directions() {
//     await get_loc_onclick();
// }


// async function get_loc_onclick() {
//     $("#directions_instructions").empty();
//     $("#directions_instructions").html("<p>Choose a starting location.</p>");

//     mymap.on('click', function(e) {
//         // const ex = get_directions_worker(start, { lat: e.latlng.lat, long: e.latlng.lng });
//         start = { lat: e.latlng.lat, long: e.latlng.lng }
//         $("#directions_instructions p").html("Choose a destination.");
//         mymap.off('click');
//         mymap.on('click', function(e) {
//             dest = { lat: e.latlng.lat, long: e.latlng.lng }
//             $("#directions_instructions").toggle();
//             $('#directions_instructions').removeClass('list-opened');

//             //Meaure Performance
//             const t0 = performance.now()

//             //Do the work
//             dijkstra(start, dest)
//                 .then(() => {
//                     //End Measure Performance
//                     const t1 = performance.now()
//                     console.log("TIME: " + (t1 - t0))
//                     mymap.off('click');
//                 });


//         });

//     });
// }


// function calc_nearest_result(location) {
//     var lat = location.lat;
//     var lon = location.long;
//     var dist_arr = []
//     for (let stop in stop_arr) {
//         stop = stop_arr[stop]
//         let b_lat = parseFloat(stop._latlng.lat);
//         let b_lon = parseFloat(stop._latlng.lng);
//         let dist = distance(lat, lon, b_lat, b_lon, 'M');
//         let key = stop;
//         if (isNaN(dist)) {
//             dist = 9999999999999;
//         }
//         dist_arr.push({ "key": key, "dist": dist, "r": dist.toString() });
//     }


//     // var results = sortByKey(dist_arr, "dist").slice(0, NUM_NEAREST_STOPS);
//     // results.forEach

//     var result = sortByKey(dist_arr, "dist")[0].key
//         // console.log(result)
//         // var close_key = result.key;

//     return result;
// }