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
let prevent_duplicates = new Set(); // Tracks which stops have been drawn to prevent duplicate draws
let lehigh_route_stop_ids = new Set();
var LEHIGH_STOPS_INFO = new Map();


var highlighted_route = null;

// These will track whether or not the switches at the topbar have been toggled.
var lehigh_toggled = false;
var lanta_toggled = false;

// These wil

//TODO: what is this?
const stop_obj = {};

$.each(routes.lehigh, function() { // Sets the mapping for the mapped_routes map
    mapped_routes.set(this.id, this.short_name);
    if (this.name != "accessLU") {
        $.each(this.stops, function() {
            lehigh_route_stop_ids.add(this);
        });
    }
});

tile_style['default'] = L.tileLayer(tile_server_url, { //takes tile server URL and will return a tile
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
});

//needs a lot of class refactoring.
let polyline_global = {};

//TODO: I moved this into icons.js, should I delete it here?
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

//TODO: can I delete this?
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

function draw_stops(map) {
    draw_lehigh(map);
    draw_lanta(map);
    console.log(stop_arr);
}

function draw_lehigh(map) {
    $.each(stops.lehigh, function() { //LOOP: gets all stops for lehigh and places them on map
        if (!prevent_duplicates.has(this.name) && lehigh_route_stop_ids.has(this.stop_id)) {
            stop_arr[this.name] = L.circleMarker([this.latitude, this.longitude], { color: "#68310A" }).bindPopup(this.name).addTo(map).on('click', function(e) {
                map.setView([this.getLatLng().lat, this.getLatLng().lng], 16);
            });
            stop_arr[this.name]._stopid = this.stop_id;
            stop_obj[this.stop_id] = this.name;
            stop_arr[this.name].type = 'lehigh';
            prevent_duplicates.add(this.name);
        }
    });
    prevent_duplicates.clear(); //reset duplicate tracker
}

function draw_lanta(map) {
    $.each(stops.lanta, function() { //LOOP: gets all stops for lanta and places them on map
        if (!prevent_duplicates.has(this.name)) {
            stop_arr[this.name] = L.circleMarker([this.latitude, this.longitude], { color: "#004BBD" }).bindPopup(this.name, { maxWidth: '500px' }).addTo(map).on('click', function(e) { map.setView([this.getLatLng().lat, this.getLatLng().lng], 16); });
            stop_obj[this.stop_id] = this.name;
            stop_arr[this.name]._stopid = this.stop_id;
            stop_arr[this.name].type = 'lanta';
            prevent_duplicates.add(this.name);
        }
    });
    prevent_duplicates.clear(); //reset duplicate tracker
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

function zoom_to_bus(bus_id) {
    if (bus_id in marker_obj) {
        const the_bus = marker_obj[bus_id];
        mymap.setView(the_bus.getLatLng());
        the_bus.openPopup();
    }
}

function zoom_to_stop(stop_id) {
    if (stop_id in stop_arr) {
        const the_stop = stop_arr[stop_id];
        mymap.setView(the_stop.getLatLng());
        the_stop.openPopup();
    }
}

function update_stop_times(timings, bus_id, route_id, stop_arrivals) {
    $.each(timings, function(stop_id, time) {
        const new_content = `<td><a href="#bus-${bus_id}" onclick="zoom_to_bus(${bus_id});">${bus_id + " (" + mapped_routes.get(route_id) + ") "}</a></td> <td> ${time.minutes} minutes and ${time.seconds} seconds.</td>`;
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
        let icon_style;
        if (service === "LANTA") {
            icon_style = lanta;
        } else if (route_name === "AccessLU") {
            icon_style = lehigh_alu;
        } else if (route_name === "Packer Express") {
            icon_style = lehigh_pe;
        } else if (route_name === "Campus Connector") {
            icon_style = lehigh_pe;
        } else {
            icon_style = lehigh;
        }
        if (bus_id in marker_obj) {
            // If the bus marker was removed, and the bus marker is a part of lehigh, and lehigh has been toggled to appear
            if (marker_obj[bus_id].rmved && (marker_obj[bus_id].type == 'Lehigh' && !lehigh_toggled)) {
                marker_obj[bus_id] = L.marker([latitude, longitude], { icon: icon_style }).addTo(map);
                marker_obj[bus_id].bindPopup(""); //bind a simple popup for use later.
                marker_obj[bus_id].type = service;
                marker_obj[bus_id].rmved = false;
            }
            // If the bus marker was removed, and the bus marker is a part of lanta, and lanta has been toggled to appear
            else if (marker_obj[bus_id].rmved && (marker_obj[bus_id].type != 'Lehigh' && !lanta_toggled)) {
                marker_obj[bus_id] = L.marker([latitude, longitude], { icon: icon_style }).addTo(map);
                marker_obj[bus_id].bindPopup(""); //bind a simple popup for use later.
                marker_obj[bus_id].type = service;
                marker_obj[bus_id].rmved = false;
            } else {
                marker_obj[bus_id].setLatLng([latitude, longitude]).update();
            }
        } else {
            if ((service == "Lehigh" && !lehigh_toggled) || (service != "Lehigh" && !lanta_toggled)) {
                marker_obj[bus_id] = L.marker([latitude, longitude], { icon: icon_style }).addTo(map);
                marker_obj[bus_id].bindPopup(""); //bind a simple popup for use later.
                marker_obj[bus_id].type = service;
                marker_obj[bus_id].rmved = false;
            }
        }
        const marker = marker_obj[bus_id];
        let popup_content = "Error";
        try {
            if ((timings == null) || (timings.length == 0)) {
                popup_content = `<h3>${service} Bus: ${bus_id}</h3>
                <table class="pure-table" id="${bus_id}">
                    <thead>
                        <tr>
                            <th>Route</th>
                            <th>Previous Stop</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${typeof mapped_routes.get(route_id) === "undefined" ? route_id : mapped_routes.get(route_id)}</td>
                            <td><a onclick="zoom_to_stop('${last_stop}')" href="#stop-${last_stop}"> ${last_stop}</a></td>
                        </tr>
                    </tbody>
                </table>`;
            } else {
                const { minutes, seconds, total_time } = next_time;
                let time_str = `${minutes} minutes and ${seconds} seconds.`;
                if (minutes == 0 && seconds < 20) {
                    time_str = "Arriving Soon.";
                }
                popup_content = `<h3>${service} Bus: ${bus_id}</h3>
                <table class="pure-table" id="${bus_id}">
                    <thead>
                        <tr>
                            <th>Route</th>
                            <th>Previous Stop</th>
                            <th>Next Stop</th>
                            <th>Arriving</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${typeof mapped_routes.get(route_id) === "undefined" ? route_id : mapped_routes.get(route_id)}</td>
                            <td><a onclick="zoom_to_stop('${last_stop}')" href="#stop-${last_stop}"> ${last_stop}</a></td>
                            <td><a onclick="zoom_to_stop('${next_stop}');" href="#stop-${next_stop}">${next_stop}</a></td>
                            <td>${time_str}</tr>
                        </tr>
                    </tbody>
                </table>`;

            }
        } catch (e) {
            // console.log("Destructure error");
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
            console.log("Drawing buses...");
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

mymap.invalidateSize()

//TODO: what does this do?
mymap.addLayer(tile_style['default']);
update_map(mymap);
setInterval(function(mymap) { update_map(mymap) }, 500, mymap); //TODO: will update map every 'interval'

// Center map view on click from the stops list
function find_stop(lat, lng, name) {
    mymap.setView([lat, lng], 16);
    stop_arr[name].openPopup();
}
const poly_func = draw_polyline_sample(mymap);

// Populate side-menu on render
$('#stops').append('<ul class="pure-menu-list" id="init-stop-list" style="display: none; background-color: rgb(107, 46, 3); font-size: 15px;"></ul>');

const keys = Object.keys(stops);

// This populates the stops lists for each transportation option, and checks for duplicates
$.each(keys, function() {
    const bus = this;
    let stops_tracker = new Map();
    var count = 0;
    $('#init-stop-list').append('<a id="transportation-item" class="pure-menu-link" onclick="show_stops(\'' + this + '\')">' + this.charAt(0).toUpperCase() + this.slice(1) + '</a>');
    $('#init-stop-list').append('<div id="stops-list-container-' + this + '" style="display: none;"><ul class="pure-menu-list" id="stops-list-' + this + '" style="background-color: rgb(153, 67, 6); font-size: 15px; overflow-x: hidden; overflow-y: scroll; max-height: 52.2vh;"></ul><ul class="pure-menu-list" id="' + this + '-query-results" style="background-color: rgb(153, 67, 6); font-size: 15px; overflow-x: hidden; overflow-y: scroll; max-height: 52.2vh;"></ul></div>');
    $('#stops-list-container-' + bus).prepend('<div style="text-align:center;border-bottom: 1px solid white; height:33.6px;"><input type="text" id="search-' + this + '" class="stops-item" style="margin-top:5px; width: 90%;" placeholder="Look for a stop" onkeyup="render_search_results(\'' + this + '\')"/></div>');
    $.each(stops[this], function() {
        if (!stops_tracker.has(this.name) && (bus !== "lehigh" || lehigh_route_stop_ids.has(this.stop_id))) {
            $('#stops-list-' + bus).append('<li><a class="pure-menu-link stops-item" onclick="find_stop(' + this.latitude + ',' + this.longitude + ',\'' + this.name + '\')">' + this.name + '</a></li>');
            count++;
            stops_tracker.set(this.name, true);
            stops_list.push(this); //add to list of stops
        }
    })
    console.log(this + " " + count);
})

// This adds the 'find me' button
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

// This adds the 'Lehigh' button, to pan the view to campus
L.easyButton('<img src="img/lehigh_logo.png" style="padding-top:6px; float:center;">', function(btn, map) {
    var lehigh = [40.597856, -75.367639];
    map.setView(lehigh, 14);
}).addTo(mymap);

// Animate Hamburger Icon on smaller screens
function animateHamburger(elem) {
    elem.classList.toggle("change");
}

// Toggles the stops for Lehigh
function toggle_lehigh() {
    if (lehigh_toggled) {
        draw_lehigh(mymap);
        lehigh_toggled = false;
        update_map(mymap);
    } else {
        $.each(stop_arr, function() {
            if (this.type == 'lehigh') {
                this.remove();
            }
        })
        $.each(marker_obj, function() {
            if (this.type == 'Lehigh') {
                this.rmved = true;
                this.remove();
            }
        })
        lehigh_toggled = true;
    }
}

// Toggles the stops for lanta
function toggle_lanta() {
    if (lanta_toggled) {
        draw_lanta(mymap);
        lanta_toggled = false;
        update_map(mymap);
    } else {
        $.each(stop_arr, function() {
            if (this.type == 'lanta') {
                this.remove();
            }
        })
        $.each(marker_obj, function() {
            if (this.type != 'Lehigh') {
                this.rmved = true;
                this.remove();
            }
        })
        lanta_toggled = true;
    }
}

// Had to add directions this way to fix the map canvas disorientation
$('<div id="directions_instructions" style="padding: 2%; color: whitesmoke;"><p>Choose a destination.</p></div><div id="directions_tab" style="padding: 2%; color: whitesmoke;"></div>').insertBefore('#map')
    //make these things default invisible
$("#directions_tab").toggle();
$("#directions_instructions").toggle();



for (var id of lehigh_route_stop_ids) {
    for (var j of stops.lehigh) {
        if (j.stop_id == id) {
            lehigh_stops_info.set(id, j);
        }
    }
}