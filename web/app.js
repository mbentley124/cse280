/*

some variable declarations

*/
isFirstRun = true; //is this the first time page has been loaded
marker_obj = {}; //store bus markers/locations (for updating)
route_to_use = null; //used in if statements for knowing which routes to use
var stop_arr = {}; //holds location of each bus stop

let query_string = window.location.search; //get query string from url
let args = new URLSearchParams(query_string);
var tile_style = {}; //holds different tile styles.
var curr_style = "light"



//routes
let tile_server_url_light = "https://tiles.codyben.me/styles/positron/{z}/{x}/{y}.png";
var tile_server_url_mapbox = "https://api.mapbox.com/styles/v1/bencodyoski/ck83ddg6u5xa91ipc15icdk21/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmVuY29keW9za2kiLCJhIjoiY2s1c2s0Y2JmMHA2bzNrbzZ5djJ3bDdscyJ9.7MuHmoSKO5zAgY0IKChI8w";
let tile_server_url_dark = "https://tiles.codyben.me/styles/dark-matter/{z}/{x}/{y}.png";
let route_server_url = "https://routeserver.codyben.me/";
let tile_server_url = "http://tiles.codyben.me/styles/osm-bright/{z}/{x}/{y}.png";



tile_style['dark'] = L.tileLayer(tile_server_url_dark, { //takes tile server URL and will return a tile
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
});

tile_style['light'] = L.tileLayer(tile_server_url_light, { //takes tile server URL and will return a tile
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
});

tile_style['default'] = L.tileLayer(tile_server_url, { //takes tile server URL and will return a tile
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
});



//change window size
if (window.innerWidth > 600) {
    ic = [48, 48] //bus icon
    icb = [32, 32] //bus stop icon
} else {
    ic = [128, 128]
    icb = [96, 96]
}


function sync_callback(data) {
    json = data;
    if(!(json.ip).includes("128.180.27")) {
        tile_style['dark'] = tile_style['light'] = tile_style['default'] = L.tileLayer(tile_server_url_mapbox, { //takes tile server URL and will return a tile
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
        });
    }
}

//determine what tileservers to load
function check_ip() {
    json = null;
    $.ajax({
        dataType: "json",
        url: "https://api.ipify.org?format=jsonp&callback=?",
        async: false,
        success: sync_callback,
      });
      console.log(json);
}
//determine if we should make it dark or not.
function check_dark() {
    var hours = new Date().getHours();

    if( hours >= 20 || hours <= 4) {
        $(".navbar").removeClass("bg-primary").addClass("bg-dark");
        $("body").addClass("body_dark");
        return 'dark';
    } 

    return 'default';
}

function toggle_style(style) { //use buttons to toggle dark mode on/off
    console.log(style);
    if( style in tile_style ) {
        mymap.removeLayer(tile_style[curr_style]);
        mymap.addLayer(tile_style[style]);
        curr_style = style;

        if( curr_style == "dark") {
            $(".navbar").removeClass("bg-primary").addClass("bg-dark");
            $("body").addClass("body_dark");
        } else if(curr_style == "light") {
            $(".navbar").removeClass("bg-dark").addClass("bg-primary");
            $("body").removeClass("body_dark");
        }

    } else {
        console.warn("Invalid tile style selected.");
    }
}

function do_location() {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(calc_nearest);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
}

function distance(lat1, lon1, lat2, lon2, unit) {
    //https://www.geodatasource.com/developers/javascript
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

function sortByKey(array, key) {
    //https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function calc_nearest(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    L.marker([lat, lon], { icon: you }).addTo(mymap);
    dist_arr_lu = []
    dist_arr_lanta = []
    //replace with combined stops array
    $.each(stops.lehigh, function() {
        b_lat = this.lon;
        b_lon = this.lat;
        var dist = distance(lat,lon, b_lat, b_lon, 'K');
        var key = this.name
        dist_arr_lu.push({"key":key, "dist":dist});
    });

    $.each(stops.lanta, function(k, v) { //LOOP: interates through each route for LANTA
        $.each(stops.lanta[k], function() { //LOOP: iterates through each stop on that route
            b_lat = this.Longitude;
            b_lon = this.Latitude;
            var dist = distance(lat,lon, b_lat, b_lon, 'K');
            var key = this.Name
            dist_arr_lanta.push({"key":key, "dist":dist});
        });
    });
    result_lu = sortByKey(dist_arr_lu, "dist")[0];
    stop_arr[result_lu.key].openPopup();

    result_lanta = sortByKey(dist_arr_lanta, "dist")[0];
    stop_arr[result_lanta.key].openPopup();

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

var lu_stop = L.icon({
    iconUrl: 'img/lu_stop.png',

    iconSize: icb, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var lanta_stop = L.icon({
    iconUrl: 'img/lanta_stop.png',

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

var lanta = L.icon({
    iconUrl: 'img/lanta.jpeg',

    iconSize: ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

function update_map(map) {
    //console.log(map)
    $.getJSON("bus_data.json", function(data) { //gets data from JSON file which was created by scraper
        if (isFirstRun) { //checks so that you don't need to load the map everytime you update bus locations
            $.each(stops.lehigh, function() { //LOOP: gets all stops for lehigh and places them on map
                L.marker([this.lat, this.long], { icon: lu_stop }).addTo(map);
                stop_arr[this.name] = [this.lat, this.long];

                //  console.log(cardinality_arr);
            });

            $.each(stops.lanta, function(k, v) { //LOOP: interates through each route for LANTA
                $.each(stops.lanta[k], function() { //LOOP: iterates through each stop on that route
                    L.marker([this.Latitude, this.Longitude], { icon: lanta_stop }).addTo(map);
                    stop_arr[this.Name] = [this.Latitude, this.Longitude];
                });
            });
            $.each(data.lehigh, function() { //LOOP: loops through every Lehigh bus and 
                //places it initially on map
                // cardinality_arr[this.vid] = new Set();
                // console.log(cardinality_arr);
                if (this.key == "CC") {
                    img = cc;
                    route_to_use = cc_routes;
                } else if (this.key == "PE") {
                    img = pe;
                    route_to_use = pe_routes;
                } else if (this.key == "FW") {
                    img = fw;
                    route_to_use = fw_routes;
                } else {
                    img = lu;
                }
                marker_obj[this.vid] = L.marker([this.lat, this.long], { icon: img }).addTo(map);
            });

            $.each(data.lanta, function(k, v) { //LOOP: goes through every route for LANTA
                // cardinality_arr[this.vid] = new Set();
                // console.log(cardinality_arr);
                $.each(data.lanta[k], function() { //LOOP: initial placement of every LANTA bus
                    marker_obj[this.VehicleId] = L.marker([this.Latitude, this.Longitude], { icon: lanta }).addTo(map);
                });

            });
            isFirstRun = false;
        } else {
			$.each(data.lehigh, function(){
				// cardinality_arr[this.vid] = new Set();
				// console.log(cardinality_arr);
				 if(this.key == "CC") {
					 img = cc;
					 route_to_use = cc_routes;
				 } else if(this.key == "PE") {
					 img = pe;
					 route_to_use = pe_routes;
				 } else if(this.key == "FW") {
					 img = fw;
					 route_to_use = fw_routes;
				 } else {
					 img = lu;
				 }
				 var loc_list = [this.lat, this.long]
				 var marker = (marker_obj[this.vid]);
				 marker.setLatLng(loc_list).update();
				});
	
				$.each(data.lanta, function(k,v){
					// cardinality_arr[this.vid] = new Set();
					// console.log(cardinality_arr);
					 $.each(data.lanta[k], function(){
						var loc_list = [this.Latitude, this.Longitude]
						var marker = (marker_obj[this.VehicleId]);
						marker.setLatLng(loc_list).update();
						// marker_obj[this.vid] = L.marker(, {icon: lanta}).addTo(map);
					 });
					 
			});
		}
	});
        //NOW WE ARE OUT OF ifFirstRun
		//TODO: fix this (doesn't account for LANTA). ATM, nothing updates after initial placement
		//TODO: Done :)
    //     $.each(data, function() { //
    //         // console.log(this);
    //         if (this.arrival_delta < 0.5) { //how much time for bus to get to stop (from JSON)
    //             this.arrival_delta = "Arriving soon"; //if less then 30sec
    //         } else {
    //             this.arrival_delta = this.arrival_delta + " minutes"; //TODO: change to sec for 30sec to 1 min
    //         }
    //         console.log("Bus (VID:" + this.vid + ") and (Num:" + this.fleetnum + ") is going from " + this.last_stop + " to " + this.next_stop + " in " + this.arrival_delta);
    //         var marker = (marker_obj[this.vid]);
    //         marker.setLatLng([this.lat, this.long]).update();
    //         marker.bindPopup("<b>" + this.key + "</b><br>" + "Going to " + this.next_stop + " in " + this.arrival_delta);
    //     });
    // });
}

check_ip();

mymap = L.map('mapid').setView([40.604377, -75.372161], 16); //sets center of map & zoom level

toggle_style((args.get("style") == null) ? check_dark() : args.get("style"));

update_map(mymap);
setInterval(function(mymap){update_map(mymap)}, 1000, mymap); //TODO: will update map every 'interval'