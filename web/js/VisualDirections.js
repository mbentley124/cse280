"use strict";

class VisualDirections {

    /**
     * Construct a visual directions object to draw walking directions on a map.
     * @param map a leaflet map object.
     * @param startingLocation the starting location of the user. A lat/lng object.
     * @param endingLocation the desired location of the user. A lat/lng object.
     * @param nearestStartingStop the nearest bus stop to the starting location. Defaults to startingLocation.
     * @param nearestEndingStop the nearest bus stop to the end location. Defaults to endingLocation.
     */

    constructor(map, startingLocation, endingLocation, routes = [], nearestStartingStop = startingLocation, nearestEndingStop = endingLocation) {
        this.map = map;
        this.startingLocation = startingLocation;
        this.endingLocation = endingLocation;
        this.nearestEndingStop = nearestEndingStop;
        this.nearestStartingStop = nearestStartingStop;
        this.sameStart = (nearestStartingStop === startingLocation);
        this.sameEnd = (nearestEndingStop === endingLocation);
        this.routes = routes;
        this.promises = [];
        this.requestURL = null;
        this.markers = [L.marker(this.startingLocation), L.marker(this.endingLocation)];
        this.visualLayer = L.layerGroup(this.markers);
        this.kvArgs = ["geometries=geojson"];
    }

    /**
     * Make two requests to the public routing API, and then place them on map by default.
     * @param {boolean} autoplace 
     */
    async visualizeDirections(autoplace=true) {
        const promises = [this._makeStartingRequest(), this._makeEndingRequest()];
        await Promise.all(promises);
        if(autoplace) this.visualLayer.addTo(this.map);
        return this.visualLayer;
    }

    /**
     * Remove visual directions from map.
     */
    removeVisualDirections() {
        this.visualLayer.removeFrom(this.map);
    }

    /**
     * Actually make a request to the API and then chain promises until the route is drawn on the map.
     * @param {string} url 
     */
    _makeRequests(url = this.requestURL) {
        return fetch(url, {
            method: "GET",
        }).then((r) => {
            if(!r.ok) {
                throw r.ok;
            } else {
                return r;
            }
        }).then(j => j.json())
        .then(j => this._drawPolyline(j.routes[0].geometry));
    }

    /**
     * Make a request given starting directions to the nearest bus stop. Returns a resolved promise(false) on error.
     * @param {string} serverURL 
     */
    _makeStartingRequest(serverURL = "http://public-routing.triplemap.me:5000/route/v1/foot/") {
        if(this.sameStart) {
            console.warn("Same starting position given.");
            return Promise.resolve(false);
        }

        const startingLat = this.startingLocation.lat;
        const startingLng = this.startingLocation.lng;

        const stopLat = this.nearestStartingStop.lat;
        const stopLng = this.nearestStartingStop.lng;

        const beginGroup = `${startingLng},${startingLat}`;
        const endGroup = `${stopLng},${stopLat}`;
        //http://52.91.129.81:5000/route/v1/foot/-75.909231,41.079351;-75.632908,41.335576
        const reqURL = `${serverURL}${beginGroup};${endGroup}?${this.kvArgs.join("&")}`;
        this.requestURL = reqURL;
        return this._makeRequests(reqURL);

    }
       
    /**
     * Make a request given ending directions to the nearest bus stop to destination. Returns a resolved promise(false) on error.
     * @param {string} serverURL 
     */
    _makeEndingRequest(serverURL = "http://public-routing.triplemap.me:5000/route/v1/foot/") {
        if(this.sameEnd) {
            console.warn("Same ending position given.");
            return Promise.resolve(false);
        }

        const startingLat = this.endingLocation.lat;
        const startingLng = this.endingLocation.lng;

        const stopLat = this.nearestEndingStop.lat;
        const stopLng = this.nearestEndingStop.lng;

        const beginGroup = `${startingLng},${startingLat}`;
        const endGroup = `${stopLng},${stopLat}`;
        //http://52.91.129.81:5000/route/v1/foot/-75.909231,41.079351;-75.632908,41.335576
        const reqURL = `${serverURL}${beginGroup};${endGroup}?${this.kvArgs.join("&")}`;
        this.requestURL = reqURL;
        return this._makeRequests(reqURL);
    }

    /**
     * Given a geoJSON, draw a polyline on the map and add it to our layer group.
     * @param {object} polyline 
     */
    _drawPolyline(polyline) {
        console.log(polyline);
        this.visualLayer.addLayer(L.geoJSON(polyline));
    }


}