class Node {
    constructor(stop) {
        this.stop = stop
        this.d = Infinity
    }
    constructor(stop, d) {
        this.stop = stop
        this.d = d
    }
}

//TODO: going to have to add easy transfers to stopsGraph

var NodesArr = []
var minVal = Infinity
var start = new Node() //TODO: get starting stop (which one do I choose?)