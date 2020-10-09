'use strict';
/* DEFINE TILE LAYERS */

// tile_style['dark'] = L.tileLayer(tile_server_url_dark, { //takes tile server URL and will return a tile
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
// });

// tile_style['light'] = L.tileLayer(tile_server_url_light, { //takes tile server URL and will return a tile
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
// });

var stops_list = [] //holds stop names
let mapped_routes = new Map(); // Holds the mapping for the route_id to the actual route name

var highlighted_route = null;

//TODO: what is this?
const stop_obj = {};

$.each(routes.lehigh, function (){ // Sets the mapping for the mapped_routes map
    mapped_routes.set(this.id, this.short_name);
})

tile_style['default'] = L.tileLayer(tile_server_url, { //takes tile server URL and will return a tile
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
});

//needs a lot of class refactoring.
let polyline_global = {};
//change window size
if (window.innerWidth > 600) {
    ic = [48, 48] //bus icon
    icb = [32, 32] //bus stop icon
} else {
    ic = [32, 32]
    icb = [20, 20]
}

/* END */


/* DRAW THE MAP */

function sync_callback(data) {
    var json = data;
    if (!(json.ip).includes("128.180.27")) {
        tile_style['dark'] = tile_style['light'] = tile_style['default'] = L.tileLayer(tile_server_url_mapbox, { //takes tile server URL and will return a tile
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
        });
    }
}

//determine what tileservers to load
function check_ip() {
    // var json = null;
    // $.ajax({
    //     dataType: "json",
    //     url: "https://api.ipify.org?format=jsonp&callback=?",
    //     async: false,
    //     success: sync_callback,
    //   });
    //   console.log(json);
}




function do_location() {

    if (navigator.geolocation) {
        calc_nearest();
    } else {
        alert("Geolocation is not supported by this browser.");
    }
    // draw_stops(mymap);
}

function distance(lat1, lon1, lat2, lon2, unit) {
    //https://www.geodatasource.com/developers/javascript
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}

function sortByKey(array, key) {
    //https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        // console.log(x);
        // console.log(y);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function calc_nearest() {
    var lat = lc._marker._latlng.lat;
    var lon = lc._marker._latlng.lng;
    var dist_arr_lu = []
    var dist_arr_lanta = []
        //replace with combined stops array
    $.each(stops.lehigh, function() {
        var b_lat = parseFloat(this.latitude);
        var b_lon = parseFloat(this.longitude);
        var dist = distance(lat, lon, b_lat, b_lon, 'M');
        var key = this.name;
        if (isNaN(dist)) {
            dist = 9999999999999;
        }
        dist_arr_lu.push({ "key": key, "dist": dist, "r": dist.toString() });
    });

    $.each(stops.lanta, function() { //LOOP: interates through each route for LANTA
        var b_lon = this.longitude;
        var b_lat = this.latitude;
        var dist = distance(lat, lon, b_lat, b_lon, 'M');
        // console.log(dist);
        if (isNaN(dist)) {
            dist = 9999999999999;
        }
        var key = this.name;
        dist_arr_lanta.push({ "key": key, "dist": dist, "r": dist.toString() });
        // console.log(dist_arr_lanta);
    });
    var result_lu = sortByKey(dist_arr_lu, "dist")[0];
    // stop_arr[result_lu.key].openPopup();
    // console.log(result_lu);
    var result_lanta = sortByKey(dist_arr_lanta, "dist")[0];
    // console.log(result_lanta);
    // stop_arr[result_lanta.key].openPopup();
    var close_key = result_lu.key;
    var close_dist = result_lu.dist;
    if (result_lanta.dist < result_lu.dist) {
        close_key = result_lanta.key;
        close_dist = result_lanta.dist;
    }
    // console.log(close_key);
    var data_str;
    var popup = stop_arr[close_key].getPopup();
    data_str = popup.getContent();
    stop_arr[close_key].openPopup();
    if (!data_str.includes("miles")) {
        popup.setContent(data_str + "<br>~" + close_dist.toFixed(2) + " miles");
        mymap.setView([stop_arr[close_key].getLatLng().lat, stop_arr[close_key].getLatLng().lng], 16);
    }
    // 


    // alert("Nearest Lehigh Stop: "+result_lu.key);
    // alert("Nearest LANTA Stop: "+result_lanta.key);

}

function draw_stops(map) {
    //TODO: CLEAN THIS UP
    $.each(stops.lehigh, function() { //LOOP: gets all stops for lehigh and places them on map

        stop_arr[this.name] = L.circleMarker([this.latitude, this.longitude], { color: "#68310A" }).bindPopup(this.name).addTo(map).on('click', function(e) {
            // console.log(this.name);
            map.setView([this.getLatLng().lat, this.getLatLng().lng], 16);
        });
        stop_arr[this.name]._stopid = this.stop_id;
        stop_obj[this.stop_id] = this.name;
        //  console.log(cardinality_arr);
    });

    $.each(stops.lanta, function() { //LOOP: gets all stops for lanta and places them on map

        stop_arr[this.name] = L.circleMarker([this.latitude, this.longitude], { color: "#004BBD" }).bindPopup(this.name, { maxWidth: '500px' }).addTo(map).on('click', function(e) { map.setView([this.getLatLng().lat, this.getLatLng().lng], 16); });
        stop_obj[this.stop_id] = this.name;
        stop_arr[this.name]._stopid = this.stop_id;
        //  console.log(cardinality_arr);
    });

}

async function draw_polyline_sample(map) {
    const routes = await fetch("temp_routes_lu.json")
        .then((data) => data.json())
        .then(
            (parsed) => {
                const routes = [];

                $.each(parsed, function() {
                    // console.log(this);
                    const { color, path, name } = this;
                    routes.push({ color: color, path: path, name: name });
                });

                return routes;
            }
        );
    const polylines = {};

    $.each(routes, function() {
        const polyline = [];
        for (let i = 0; i < this.path.length; i += 2) {
            polyline.push(new L.LatLng(this.path[i], this.path[i + 1]));
        }
        const leaflet_line = new L.polyline(
            polyline, {
                color: this.color,
                smoothFactor: 2,
            }
        );
        if (this.name == "Campus Connnector") {
            this.name = "Campus Connector";
        }
        polylines[this.name] = {
                color: this.color,
                path: polyline,
                leaflet_obj: leaflet_line,
                onmap: false,
            }
            // leaflet_line.addTo(map);
    });

    polyline_global = polylines;
    return polylines;


}

function reset_popup_content(stop_arrivals) {
    // console.log(stop_arrivals);
    $.each(stop_arr, function(name, marker) {
        const stop_id = marker._stopid;
        // console.log(stop_id);
        let tdata = "<td>N/A</td><td>N/A</td>";
        if (stop_id in stop_arrivals) {
            tdata = "";
            stop_arrivals[stop_id].forEach(arrival => {
                tdata += "<tr>";
                tdata += arrival;
                tdata += "</tr>";
            });
        }
        const simple_table = `
        <h3>${name}</h3>
        <table class="pure-table" id="${stop_id}">
        <thead>
            <tr>
                <th>Bus #</th>
                <th>Arriving</th>
            </tr>
        </thead>
        <tbody>
            ${tdata}
        </tbody>
    </table>`;
        marker.setPopupContent(simple_table);
    })
}

function update_stop_times(timings, bus_id, route_id, stop_arrivals) {
    $.each(timings, function(stop_id, time) {
        const new_content = `<td>${bus_id + " (" + mapped_routes.get(route_id) + ") "}</td> <td> ${time.minutes} minutes and ${time.seconds} seconds.</td>`;
        if (!(stop_id in stop_arrivals)) {
            stop_arrivals[stop_id] = [new_content];
        } else {
            stop_arrivals[stop_id].push(new_content);
        }
    });
}

function draw_buses(bus_obj, map) {
    const buses_running = new Set();
    const stop_arrivals = {};
    $.each(bus_obj, function(k, bus) {
        const { bus_id, short_name, latitude, longitude, route_id, route_name, service, timings } = bus;
        let { next_stop, last_stop } = bus;
        let next_time = null;
        if (service == "Lehigh" && timings != null) {
            update_stop_times(timings, bus_id, route_id, stop_arrivals);
            next_time = timings[next_stop];
            next_stop = stop_obj[next_stop];
            last_stop = stop_obj[last_stop];
            // console.log(timings);
            // console.log(next_stop);
        }
        const icon_style = ((service == "Lehigh") ? lehigh : lanta); //will only work for two bus services.
        if (bus_id in marker_obj) {
            marker_obj[bus_id].setLatLng([latitude, longitude]).update();
        } else {
            marker_obj[bus_id] = L.marker([latitude, longitude], { icon: icon_style }).addTo(map);
            marker_obj[bus_id].bindPopup(""); //bind a simple popup for use later.
        }
        const marker = marker_obj[bus_id];
        let popup_content = "Error";
        if ((timings == null) || (timings.length == 0)) {
            popup_content = `${service} Bus: ${bus_id} <br>On route: ${typeof mapped_routes.get(route_id) === "undefined" ? route_id : mapped_routes.get(route_id)} <br> Previous stop: ${last_stop}`;
        } else {
            const { minutes, seconds, total_time } = next_time;
            let time_str = `${minutes} minutes & ${seconds} seconds.`;
            if (minutes == 0 && seconds < 20) {
                time_str = "Arriving Soon.";
            }
            popup_content = `${service} Bus: ${bus_id} <br>On route: ${typeof mapped_routes.get(route_id) === "undefined" ? route_id : mapped_routes.get(route_id)} <br> ${last_stop} => ${next_stop} in ${time_str}`;
        }
        marker.setPopupContent(popup_content);
        buses_running.add(bus_id);
    });
    reset_popup_content(stop_arrivals);
    const buses_with_markers = new Set(Array.from(bus_obj.keys()));
    const buses_to_be_removed = new Set([...buses_with_markers].filter(x => !buses_running.has(x))); //https://stackoverflow.com/questions/1723168/what-is-the-fastest-or-most-elegant-way-to-compute-a-set-difference-using-javasc
    $.each(buses_to_be_removed, function() {
        marker_obj[this].removeFrom(map);
    });
}

function update_map(map) {
    //console.log(map)
    $.get("/bus_data.json", function(data, textStatus, xhr) { //gets data from JSON file which was created by scraper
        //removing animated moving markers for now, will probably just animate along a polyline in the future.
        // console.log(xhr);
        // console.log(data);
        if (xhr.status == 304) {
            //unchanged file, so don't redraw buses.
            //begin any animations here.
        } else if (xhr.status == 404 || xhr.status == 500) {
            console.error("Failed to get bus data");
        } else if (xhr.status == 200) {
            $.each(data, function() {
                draw_buses(this, map);
            });
        } else {
            console.error("Received Response Code: " + xhr.status);
            console.error("Not drawing buses.");
        }

    });
}

function toggle_polylines_sample(name) {
    if (name in polyline_global) {
        const { leaflet_obj, onmap } = polyline_global[name];
        if (onmap) {
            leaflet_obj.removeFrom(mymap);
            polyline_global[name].onmap = false;
            return false;
        } else {
            if (highlighted_route != null) {
                polyline_global[highlighted_route].leaflet_obj.removeFrom(mymap);
                polyline_global[highlighted_route].onmap = false;
            }
            highlighted_route = name;
            polyline_global[name].onmap = true;
            leaflet_obj.addTo(mymap);
            return true;
        }
    }
}

mymap = L.map('mapid', leaflet_config).setView([40.604377, -75.372161], 16); //sets center of map & zoom level
draw_stops(mymap);
// update_initial(mymap);


toggle_style((args.get("style") == null) ? check_dark() : args.get("style"));
mymap.addLayer(tile_style['default']);
update_map(mymap);
setInterval(function(mymap) { update_map(mymap) }, 2000, mymap); //TODO: will update map every 'interval'

// Center map view on click from the stops list
function find_stop(lat, lng, name) {
    mymap.setView([lat, lng], 16);
    stop_arr[name].openPopup();
}
const poly_func = draw_polyline_sample(mymap);

// Populate side-menu on render
$('#stops').append('<ul class="pure-menu-list" id="init-stop-list" style="display: none; background-color: rgb(107, 46, 3); font-size: 15px;"></ul>');

const keys = Object.keys(stops);

$.each(keys, function() {
    const bus = this;
    let stops_tracker = new Map();
    var count = 0;
    $('#init-stop-list').append('<a id="transportation-item" class="pure-menu-link" onclick="show_stops(\'' + this + '\')">' + this.charAt(0).toUpperCase() + this.slice(1) + '</a>');
    $('#init-stop-list').append('<div id="stops-list-container-' + this + '" style="display: none;"><ul class="pure-menu-list" id="stops-list-' + this + '" style="background-color: rgb(153, 67, 6); font-size: 15px; overflow-x: hidden; overflow-y: scroll; max-height: 52.2vh;"></ul></div><ul class="pure-menu-list" id="' + this + '-query-results" style="background-color: rgb(153, 67, 6); font-size: 15px; overflow-x: hidden; overflow-y: scroll; max-height: 52.2vh;"></ul></div>');
    $('#stops-list-container-' + bus).prepend('<div style="text-align:center;border-bottom: 1px solid white; height:33.6px;"><input type="text" id="search-' + this + '" class="stops-item" style="margin-top:5px; width: 90%;" placeholder="Look for a stop" onkeyup="render_search_results(\'' + this + '\')"/></div>');
    $.each(stops[this], function() {
        if (!stops_tracker.has(this.name)) {
            $('#stops-list-' + bus).append('<li><a class="pure-menu-link stops-item" onclick="find_stop(' + this.latitude + ',' + this.longitude + ',\'' + this.name + '\')">' + this.name + '</a></li>');
            count++;
            stops_tracker.set(this.name, true);
            stops_list.push(this); //add to list of stops
        }
    })
    console.log(this + " " + count);
})
try {
    var lc = L.control.locate({
        flyTo: true,
        locateOptions: {
            enableHighAccuracy: true
        },
        strings: {
            title: "Your location"
        },
        drawCircle: false,
        keepCurrentZoomLevel: true,
        metric: false
    }).addTo(mymap);

    lc.start();
    lc.stopFollowing();
} catch (e) {
    console.warn(e.toString());
}


// Animate Hamburger Icon on smaller screens
function animateHamburger(elem) {
    elem.classList.toggle("change");
}

//toggle the visibility of the about page.
function showAbout() {
    $("#about").toggle()
    $("#map").toggle()
}

//get the about page html contents from about.html and insert them into index.html
async function make_about() {
    await fetch('html/about.html')
        .then(response => response.text())
        .then(text => {
            $(text).insertAfter("#map")
            $("#about").toggle()
        })
}

make_about()