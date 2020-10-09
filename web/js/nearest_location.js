//get nearest location
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

//calculate nearest bus stop?
function calc_nearest() {
    var lat = lc._marker._latlng.lat;
    var lon = lc._marker._latlng.lng;
    var dist_arr_lu = []
    var dist_arr_lanta = []
        //replace with combined stops array
    $.each(stops.lehigh, function() { //LOOP: interates through each route for Lehigh
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

    var data_str;
    var popup = stop_arr[close_key].getPopup();
    data_str = popup.getContent();
    stop_arr[close_key].openPopup();
    if (!data_str.includes("miles")) {
        popup.setContent(data_str + "<br>~" + close_dist.toFixed(2) + " miles");
        mymap.setView([stop_arr[close_key].getLatLng().lat, stop_arr[close_key].getLatLng().lng], 16);
    }

}