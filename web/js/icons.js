/* 

Make a bus icon 

*/

function make_icon_bus(fill, background) {
    var svg_str = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="300.000000pt" height="314.000000pt" viewBox="0 0 300.000000 314.000000" preserveAspectRatio="xMidYMid meet"> <metadata> Created by potrace 1.10, written by Peter Selinger 2001-2011 </metadata> <circle r="49%" cx="50%" cy="50%" fill="' + background + '"/> <g transform="translate(0.000000,314.000000) scale(0.050000,-0.050000)" fill="' + fill + '" stroke="none"> <path d="M2590 5950 c-1750 -308 -2821 -2026 -2308 -3700 269 -875 991 -1602 1877 -1889 l189 -61 729 0 728 0 205 69 c771 258 1368 786 1726 1526 l114 235 -2 970 -1 970 -71 160 c-375 850 -1119 1466 -2036 1684 -265 63 -885 83 -1150 36z m1073 -929 c382 -85 753 -246 828 -360 156 -235 268 -2728 133 -2945 -46 -73 -213 -176 -288 -176 -33 0 -36 -23 -36 -257 0 -336 -16 -363 -220 -363 -204 0 -220 27 -220 363 l0 257 -778 0 -779 0 -6 -270 c-9 -333 -25 -360 -219 -360 -194 0 -218 41 -218 367 l0 255 -93 25 c-274 73 -286 111 -287 953 -1 1035 82 1998 185 2151 200 296 1349 503 1998 360z"/> <path d="M2269 4651 c-31 -31 -49 -72 -49 -111 0 -39 18 -80 49 -111 l49 -49 762 0 762 0 49 49 c67 67 65 158 -4 222 l-53 49 -758 0 -758 0 -49 -49z"/> <path d="M1904 4210 c-93 -41 -114 -109 -153 -502 -37 -381 -32 -426 53 -498 l59 -50 1214 0 c1520 0 1388 -56 1325 558 -42 411 -59 463 -166 501 -103 35 -2248 27 -2332 -9z"/> <path d="M1796 2542 c-140 -125 -47 -342 146 -342 115 0 198 84 198 200 0 183 -204 267 -344 142z"/> <path d="M4076 2542 c-140 -125 -47 -342 146 -342 115 0 198 84 198 200 0 183 -204 267 -344 142z"/> </g> </svg>';
    return 'data:image/svg+xml;base64,' + btoa(svg_str);
}

//change window size
if (window.innerWidth > 600) {
    ic = [48, 48] //bus icon
    icb = [32, 32] //bus stop icon
} else {
    ic = [32, 32]
    icb = [20, 20]
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