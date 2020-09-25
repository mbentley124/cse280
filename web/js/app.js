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

var stops_list = []

var highlighted_route = null;

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

/* Make a bus icon */

function make_icon_bus(fill, background) {
    var svg_str = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="300.000000pt" height="314.000000pt" viewBox="0 0 300.000000 314.000000" preserveAspectRatio="xMidYMid meet"> <metadata> Created by potrace 1.10, written by Peter Selinger 2001-2011 </metadata> <circle r="49%" cx="50%" cy="50%" fill="' + background + '"/> <g transform="translate(0.000000,314.000000) scale(0.050000,-0.050000)" fill="' + fill + '" stroke="none"> <path d="M2590 5950 c-1750 -308 -2821 -2026 -2308 -3700 269 -875 991 -1602 1877 -1889 l189 -61 729 0 728 0 205 69 c771 258 1368 786 1726 1526 l114 235 -2 970 -1 970 -71 160 c-375 850 -1119 1466 -2036 1684 -265 63 -885 83 -1150 36z m1073 -929 c382 -85 753 -246 828 -360 156 -235 268 -2728 133 -2945 -46 -73 -213 -176 -288 -176 -33 0 -36 -23 -36 -257 0 -336 -16 -363 -220 -363 -204 0 -220 27 -220 363 l0 257 -778 0 -779 0 -6 -270 c-9 -333 -25 -360 -219 -360 -194 0 -218 41 -218 367 l0 255 -93 25 c-274 73 -286 111 -287 953 -1 1035 82 1998 185 2151 200 296 1349 503 1998 360z"/> <path d="M2269 4651 c-31 -31 -49 -72 -49 -111 0 -39 18 -80 49 -111 l49 -49 762 0 762 0 49 49 c67 67 65 158 -4 222 l-53 49 -758 0 -758 0 -49 -49z"/> <path d="M1904 4210 c-93 -41 -114 -109 -153 -502 -37 -381 -32 -426 53 -498 l59 -50 1214 0 c1520 0 1388 -56 1325 558 -42 411 -59 463 -166 501 -103 35 -2248 27 -2332 -9z"/> <path d="M1796 2542 c-140 -125 -47 -342 146 -342 115 0 198 84 198 200 0 183 -204 267 -344 142z"/> <path d="M4076 2542 c-140 -125 -47 -342 146 -342 115 0 198 84 198 200 0 183 -204 267 -344 142z"/> </g> </svg>';
    return 'data:image/svg+xml;base64,' + btoa(svg_str);
}


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
//determine if we should make it dark or not.
function check_dark() {
    var hours = new Date().getHours();

    if (hours >= 20 || hours <= 4) {
        $(".navbar").removeClass("bg-primary").addClass("bg-dark");
        $("body").addClass("body_dark");
        return 'dark';
    }

    return 'default';
}


function toggle_style(style) { //use buttons to toggle dark mode on/off
    // console.log(style);
    // if (style in tile_style) {
    //     mymap.removeLayer(tile_style[curr_style]);
    //     mymap.addLayer(tile_style[style]);
    //     curr_style = style;

    //     if (curr_style == "dark") {
    //         $(".navbar").removeClass("bg-primary").addClass("bg-dark");
    //         $("body").addClass("body_dark");
    //     } else if (curr_style == "light") {
    //         $(".navbar").removeClass("bg-dark").addClass("bg-primary");
    //         $("body").removeClass("body_dark");
    //     }

    // } else {
    //     console.warn("Invalid tile style selected.");
    // }
    var navbar = $(".navbar");
    var tiles = $(".leaflet-tile-pane");
    var body = $("body");
    if (style.toLowerCase() === "dark") {
        navbar.removeClass("bg-primary").addClass("bg-dark");
        body.addClass("body_dark");
        tiles.addClass("tile_dark");
    } else {
        tiles.removeClass("tile_dark");
        body.removeClass("body_dark");
        navbar.removeClass("bg-dark").addClass("bg-primary");
    }
}

function do_location() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(calc_nearest);
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

function calc_nearest(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    console.log(lc.getLatLng())
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
    console.log(result_lu);
    var result_lanta = sortByKey(dist_arr_lanta, "dist")[0];
    console.log(result_lanta);
    // stop_arr[result_lanta.key].openPopup();
    var close_key = result_lu.key;
    var close_dist = result_lu.dist;
    if (result_lanta.dist < result_lu.dist) {
        close_key = result_lanta.key;
        close_dist = result_lanta.dist;
    }
    console.log(close_key);
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

/*

images for icons

*/

var you = L.icon({
    iconUrl: 'img/you.png',

    iconSize: ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var fw = L.icon({
    iconUrl: 'img/FW.jpeg',

    iconSize: ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var bstop = L.icon({
    iconUrl: 'img/busstop.png',

    iconSize: icb, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


var pe = L.icon({
    iconUrl: 'img/PE.jpeg',

    iconSize: ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var lu = L.icon({
    iconUrl: 'img/LU.jpeg',

    iconSize: ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var cc = L.icon({
    iconUrl: 'img/CC.jpeg',

    iconSize: ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

const lanta = L.icon({
    iconUrl: make_icon_bus("#FFFFFF", "#1500ff"),

    iconSize: ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

const lehigh = L.icon({
    iconUrl: make_icon_bus("#FFFFFF", "#68310A"),

    iconSize: ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

const new_position = L.icon({
    iconUrl: make_icon_bus("#dbddde7d", "#dbddde"),
    iconSize: ic,
});

function draw_stops(map) {
    $.each(stops.lehigh, function() { //LOOP: gets all stops for lehigh and places them on map

        stop_arr[this.name] = L.circleMarker([this.latitude, this.longitude], { color: "#68310A" }).bindPopup(this.name).addTo(map).on('click', function(e) {
            console.log(this.name);
            map.setView([this.getLatLng().lat, this.getLatLng().lng], 16);
        });

        //  console.log(cardinality_arr);
    });

    $.each(stops.lanta, function() { //LOOP: gets all stops for lanta and places them on map

        stop_arr[this.name] = L.circleMarker([this.latitude, this.longitude], { color: "#004BBD" }).bindPopup(this.name, { maxWidth: '500px' }).addTo(map).on('click', function(e) { map.setView([this.getLatLng().lat, this.getLatLng().lng], 16); });

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
                    console.log(this);
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

function update_map(map) {
    //console.log(map)
    $.getJSON("https://bus.codyben.me/bus_data.json", function(data) { //gets data from JSON file which was created by scraper

        $.each(data.lehigh, function() {
            // cardinality_arr[this.vid] = new Set();
            // console.log(cardinality_arr);
            // let img = lu;
            // if (this.key == "CC") {
            //     img = cc;
            //     route_to_use = cc_routes;
            // } else if (this.key == "PE") {
            //     img = pe;
            //     route_to_use = pe_routes;
            // } else if (this.key == "FW") {
            //     img = fw;
            //     route_to_use = fw_routes;
            // }
            const vid = this.bus_id;
            var loc_list = [this.latitude, this.longitude];
            // const lc = L.LatLng(this.latitude, this.longitude);
            if (!(vid in marker_obj)) {
                marker_obj[vid] = L.Marker.movingMarker([loc_list, loc_list], [29000000000], { icon: lehigh }).bindPopup("System: LU-TPS<br>" + "VID: " + vid).addTo(map).on('click', function(e) { map.setView([this.getLatLng().lat, this.getLatLng().lng], 16); });
            }
            let marker = (marker_obj[vid]);
            const { lat, lng } = marker.getLatLng();


            if ((lat === loc_list[0]) && (lng === loc_list[1])) {
                return 1;
            } else if (marker.isRunning()) {
                return 1;
            }

            const proj_lat = this.projected_coords.lat;
            const proj_long = this.projected_coords.long;

            if (!proj_long || !proj_lat) {
                return 1;
            }
            $.getJSON(`https://routeserver.codyben.me/route/v1/driving/${proj_long},${proj_lat};${lng},${lat}?overview=full`, function(response) {
                // if(response.routes[0].duration > 30) {
                //     marker.moveTo(loc_list, [500]);
                //     return 1; //abort on long running trips.
                // }
                const pairs = polyline.decode(response.routes[0].geometry);
                // console.log(marker.isEnded());
                marker.moveTo(loc_list, [500]);
                map.removeLayer(marker);
                marker = L.Marker.movingMarker([
                    [lat, lng], loc_list
                ], [1000000000], { icon: lehigh }).bindPopup("System: LU-TPS<br>" + "VID: " + vid).addTo(map).on('click', function(e) { map.setView([this.getLatLng().lat, this.getLatLng().lng], 16); });
                marker.moveTo(pairs[pairs.length - 1], 1);
                $.each(pairs.reverse(), function() {
                    // console.log(this);
                    marker.addLatLng(this, [1100]);
                });
                marker_obj[vid] = marker;
                marker.start();
                if (vid in old_pairs) {
                    old_pairs[vid].removeFrom(map);
                }
                // console.log(marker.isEnded());
                const poly = L.polyline(polyline.decode(response.routes[0].geometry), { color: "gray" });
                // console.log(poly);
                poly.addTo(map);
                old_pairs[vid] = poly;
                // });

            });
            // console.log(marker.isRunning());
            // marker.setLatLng(loc_list).update();
            // var marker = (marker_obj[this.vid]);
            // marker.setLatLng(loc_list).update();
        });

        $.each(data.lanta, function() {
            // cardinality_arr[this.vid] = new Set();
            // console.log(cardinality_arr);
            const vid = this.bus_id;
            var loc_list = [this.latitude, this.longitude];

            const proj_lat = this.projected_coords.lat;
            const proj_long = this.projected_coords.long;
            // const vid = this.bus_id;
            var loc_list = [this.latitude, this.longitude];
            // const lc = L.LatLng(this.latitude, this.longitude);
            if (!(vid in marker_obj)) {
                marker_obj[vid] = L.Marker.movingMarker([loc_list, loc_list], [29000000000], { icon: lanta }).bindPopup("System: LANTA<br>" + "VID: " + vid).addTo(map).on('click', function(e) { map.setView([this.getLatLng().lat, this.getLatLng().lng], 16); });
            }
            let marker = (marker_obj[vid]);
            const { lat, lng } = marker.getLatLng();

            if ((lat === loc_list[0]) && (lng === loc_list[1])) {
                return 1;
            } else if (marker.isRunning()) {
                return 1;
            }

            if (!proj_long || !proj_lat) {
                return 1;
            }
            $.getJSON(`https://routeserver.codyben.me/route/v1/driving/${proj_long},${proj_lat};${lng},${lat}?overview=full`, function(response) {
                const pairs = polyline.decode(response.routes[0].geometry);
                // console.log(marker.isEnded());
                // marker.removeFrom(map);
                // marker = L.Marker.movingMarker([[lat, lng], loc_list],[1000000000],{ icon: lanta }).bindPopup("System: LANTA<br>"+"VID: "+vid).addTo(map);
                marker.moveTo(pairs[pairs.length - 1], 1);

                // old_pairs[vid] = L.marker(loc_list,{ icon: new_position }).addTo(map);
                $.each(pairs.reverse(), function() {
                    // console.log(this);
                    marker.addLatLng(this, [1400]);
                });
                marker_obj[vid] = marker;
                marker.start();
                if (vid in old_pairs) {
                    old_pairs[vid].removeFrom(map);
                }
                // console.log(marker.isEnded());
                const poly = L.polyline(polyline.decode(response.routes[0].geometry));
                // console.log(poly);
                poly.addTo(map);
                old_pairs[vid] = poly;
                // marker_obj[this.vid] = L.marker(, {icon: lanta}).addTo(map);

            });
        });

    });
}

function toggle_polylines_sample(name) {
    if (name in polyline_global) {
        const { leaflet_obj, onmap } = polyline_global[name];
        const { prev_leaflet_obj, onmap1 } = polyline_global[highlighted_route];
        if (onmap) {
            leaflet_obj.removeFrom(mymap);
            polyline_global[name].onmap = false;
            return false;
        } else {
            highlighted_route = name;
            if(highlighted_route != null){
                polyline_global[highlighted_route].onmap = false;
                prev_leaflet_obj.removeFrom(mymap);
            }
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
function find_stop(lat, lng) {
    mymap.setView([lat, lng], 16);
}
const poly_func = draw_polyline_sample(mymap);

// Populate side-menu on render
$('#stops').append('<ul class="pure-menu-list" id="init-stop-list" style="display: none; background-color: rgb(107, 46, 3); font-size: 15px;"></ul>');
$('#init-stop-list').append('<input type="text" id="search" placeholder="Look for a stop" onkeypress="render_search_results()">');


const keys = Object.keys(stops);

$.each(keys, function() {
    const bus = this;
    let stops_tracker = new Map();
    var count = 0;
    $('#init-stop-list').append('<a id="transportation-item" class="pure-menu-link" onclick="show_stops(\'' + this + '\')">' + this.charAt(0).toUpperCase() + this.slice(1) + '</a>');
    $('#init-stop-list').append('<ul class="pure-menu-list" id="stops-list-' + this + '" style="display: none; background-color: rgb(153, 67, 6); font-size: 15px; overflow-x: hidden; overflow-y: scroll; max-height: 52.2vh;"></ul>');
    $.each(stops[this], function() {
        if (!stops_tracker.has(this.name)) {
            $('#stops-list-' + bus).append('<li><a class="pure-menu-link stops-item" onclick="find_stop(' + this.latitude + ',' + this.longitude + ')">' + this.name + '</a></li>');
            count++;
            stops_tracker.set(this.name, true);
            stops_list.push(this);
        }
    })
    console.log(this + " " + count);
})

var lc = L.control.locate({
    flyTo: true,
    showCompass: true,
    locateOptions: {
        enableHighAccuracy: true
    },
    strings: {
        title: "Your location"
    },
    drawCircle: false,
    keepCurrentZoomLevel: true
}).addTo(mymap);

lc.start();
lc.stopFollowing();

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