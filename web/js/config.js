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

/* leaflet configuration */
leaflet_config = {
    preferCanvas: true,
};


//routes
// let tile_server_url_light = "https://tiles.codyben.me/styles/positron/{z}/{x}/{y}.png";
var tile_server_url_mapbox = "https://api.mapbox.com/styles/v1/bencodyoski/ck83ddg6u5xa91ipc15icdk21/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmVuY29keW9za2kiLCJhIjoiY2s1c2s0Y2JmMHA2bzNrbzZ5djJ3bDdscyJ9.7MuHmoSKO5zAgY0IKChI8w";
// let tile_server_url_dark = "https://tiles.codyben.me/styles/dark-matter/{z}/{x}/{y}.png";
// let route_server_url = "https://routeserver.codyben.me/";
let tile_server_url = "https://tiles.codyben.me/styles/osm-bright/{z}/{x}/{y}.png";
