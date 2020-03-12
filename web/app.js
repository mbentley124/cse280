isFirstRun = true;
marker_obj = {};
route_to_use = null;
do_flip = false;
var cardinality_arr = {};
var stop_arr = {};

var tile_server_url = "https://tileserver.codyben.me/";
var route_server_url = "https://routeserver.codyben.me/";

if (window.innerWidth > 600) {
	ic = [48,48]
	icb = [32,32]
} else {
	ic = [128,128]
	icb =[96,96]
}

var fw = L.icon({
    iconUrl: 'img/FW.jpeg',

    iconSize:     ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var bstop = L.icon({
    iconUrl: 'img/busstop.png',

    iconSize:     icb, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var lu_stop = L.icon({
    iconUrl: 'img/lu_stop.png',

    iconSize:     icb, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var lanta_stop = L.icon({
    iconUrl: 'img/lanta_stop.png',

    iconSize:     icb, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var pe = L.icon({
    iconUrl: 'img/PE.jpeg',

    iconSize:     ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var lu = L.icon({
    iconUrl: 'img/LU.jpeg',

    iconSize:     ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var cc = L.icon({
    iconUrl: 'img/CC.jpeg',

    iconSize:     ic, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
function update_map(map) {
	//console.log(map)
	$.getJSON("bus_data.json", function( data ) {
		if(isFirstRun) {
		 $.each(stops.lehigh, function() {
			L.marker([this.lat, this.long], {icon: lu_stop}).addTo(map);
			stop_arr[this.name] = [this.lat,this.long];
			
			//  console.log(cardinality_arr);
		 });

		 $.each(stops.lanta, function(k,v){
			 $.each(stops.lanta[k], function(){
				L.marker([this.Latitude, this.Longitude], {icon: lanta_stop}).addTo(map);
				stop_arr[this.Name] = [this.Latitude,this.Longitude];
			 });
		 });
		 $.each(data, function(){
			cardinality_arr[this.vid] = new Set();
			console.log(cardinality_arr);
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
		 	marker_obj[this.vid] = L.marker([this.lat, this.long], {icon: img}).addTo(map);
			});
		 isFirstRun = false;
		}
		$.each(data, function() {
			// console.log(this);
			if(this.arrival_delta < 0.5) {
				this.arrival_delta = "Arriving soon";
			} else {
				this.arrival_delta = this.arrival_delta+" minutes";
			}
			console.log("Bus (VID:"+this.vid+") and (Num:"+this.fleetnum+") is going from "+this.last_stop+" to "+this.next_stop+" in "+this.arrival_delta);
			var marker = (marker_obj[this.vid]);
			marker.setLatLng([this.lat, this.long]).update();
			marker.bindPopup("<b>"+this.key+"</b><br>"+"Going to "+this.next_stop+" in "+this.arrival_delta);
		});
	});
} 

mymap = L.map('mapid').setView([40.604377, -75.372161], 16);

L.tileLayer(tile_server_url+'tile/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
}).addTo(mymap);

update_map(mymap);
// setInterval(function(mymap){update_map(mymap)}, 1000, mymap);
