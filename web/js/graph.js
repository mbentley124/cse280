// Get stops in a graph format to allow for Dikstra's and other algorithms

try {

    var stopsGraph = new Map()
    stopsGraph.addStop = function(stop) {
        this.set(stop, [])
    }
    stopsGraph.updateConnections = function(stop, connectingStop) {
        let connections = this.get(stop)
        if (connections != null) {
            connections.push(connectingStop)
            this.set(stop, connections)
        } else { return null }
    }

    var addStopsToGraph = function(route) {
        //TODO: lets really hope that stopID for lehigh and lanta never overlap
        for (let i = 0; i < route.stops.length; i++) {
            let stop = route.stops[i]
            stopsGraph.addStop(stop)

            if (i - 1 >= 0) {
                stopsGraph.updateConnections(stop, route.stops[i - 1])
            }
            if (i + 1 < route.stops.length) {
                stopsGraph.updateConnections(stop, route.stops[i + 1])
            }
        }
    }

    // routes.lehigh.forEach(myfunc)
    // routes.lanta.forEach(myfunc)

    console.log(stopsGraph)

} catch (e) { console.log(e) }