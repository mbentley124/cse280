/*

some variable declarations

*/
isFirstRun = true; //is this the first time page has been loaded
marker_obj = {}; //store bus markers/locations (for updating)
route_to_use = null; //used in if statements for knowing which routes to use
var stop_arr = {}; //holds location of each bus stop

let query_string = window.location.search; //get query string from url
let args = new URLSearchParams(query_string);



//routes
let tile_server_url_light = "https://api.mapbox.com/styles/v1/bencodyoski/ck83ddg6u5xa91ipc15icdk21/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmVuY29keW9za2kiLCJhIjoiY2s1c2s0Y2JmMHA2bzNrbzZ5djJ3bDdscyJ9.7MuHmoSKO5zAgY0IKChI8w";
var tile_server_url = "https://api.mapbox.com/styles/v1/bencodyoski/ck83ddg6u5xa91ipc15icdk21/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmVuY29keW9za2kiLCJhIjoiY2s1c2s0Y2JmMHA2bzNrbzZ5djJ3bDdscyJ9.7MuHmoSKO5zAgY0IKChI8w";
let tile_server_url_dark = "https://api.mapbox.com/styles/v1/bencodyoski/ck83degh82qlu1in7bvg1h09q/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmVuY29keW9za2kiLCJhIjoiY2s1c2s0Y2JmMHA2bzNrbzZ5djJ3bDdscyJ9.7MuHmoSKO5zAgY0IKChI8w";
var dark = check_dark();;
let route_server_url = "https://routeserver.codyben.me/";

var dark_arg = (args.get("dark") == null ? 'false' : args.get("dark"))
if ( dark_arg.toLowerCase() === "true" ) { //check the URL if the argument for dark mode is set
    dark = true;
}

//change window size
if (window.innerWidth > 600) {
    ic = [48, 48] //bus icon
    icb = [32, 32] //bus stop icon
} else {
    ic = [128, 128]
    icb = [96, 96]
}

//determine if we should make it dark or not.
function check_dark() {
    var hours = new Date().getHours();

    if( hours >= 20 && hours <= 4) {
        return true;
    } 

    return false;
}

/*

images for icons

*/
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

mymap = L.map('mapid').setView([40.604377, -75.372161], 16); //sets center of map & zoom level


/* do the dark mode switch */
if (dark) {
    tile_server_url = tile_server_url_dark;
} else {
    tile_server_url = tile_server_url_light;
}

L.tileLayer(tile_server_url, { //takes tile server URL and will return a tile
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
}).addTo(mymap);

update_map(mymap);
setInterval(function(mymap){update_map(mymap)}, 1000, mymap); //TODO: will update map every 'interval'