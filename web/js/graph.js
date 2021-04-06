// Get stops in a graph format to allow for Dikstra's and other algorithms

try {

    var stopsGraph = new Map()

    for (let service in routes) {
        routes[service].forEach(route => {
            //TODO: lets really hope that stopID for lehigh and lanta never overlap
            for (let i = 0; i < route.stops.length; i++) {
                if (i - 1 >= 0) {
                    addStopToGraph(route.stops[i - 1])
                }
                if (i + 1 < route.stops.length) {
                    addStopToGraph(route.stops[i + 1])
                }
            }
        })
    }

    function addStopToGraph(stop) {
        // console.log(stop)
        if (stopsGraph.has(stop)) {
            oldNodes = stopsGraph.get(stop)
            console.log(oldNodes)
            withNewNode = oldNodes.push(stop)
            stopsGraph.set(stop, withNewNode)
        } else {
            stopsGraph.set(stop, [])
        }
    }

    console.log(stopsGraph)

} catch (e) { console.log(e) }