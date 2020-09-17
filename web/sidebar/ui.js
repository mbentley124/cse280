var bus_opened = null;
var opened = null;

var layout = document.getElementById('layout'),
    menu = document.getElementById('menu'),
    menuLink = document.getElementById('menuLink'),
    content = document.getElementById('main'),
    topbar = document.getElementById('topbar');

function toggleClass(element, className) {
    var classes = element.className.split(/\s+/),
        length = classes.length,
        i = 0;

    for (; i < length; i++) {
        if (classes[i] === className) {
            classes.splice(i, 1);
            break;
        }
    }
    // The className is not found
    if (length === classes.length) {
        classes.push(className);
    }

    element.className = classes.join(' ');
}

function toggleAll(e) {
    var active = 'active';

    e.preventDefault();
    toggleClass(layout, active);
    toggleClass(menu, active);
    toggleClass(menuLink, active);
    toggleClass(topbar, active)
}

menuLink.onclick = function (e) {
    toggleAll(e);
};

content.onclick = function (e) {
    if (menu.className.indexOf('active') !== -1) {
        toggleAll(e);
    }
};

let routes = [];
//TODO: Get Routes from Backend, need more clarification
function getRoutes() {
    //Figure out a way to not expose URL, unless it's fine
    fetch(url)
        .then(response)
        .then(data => { })
}
// Show route dropdown on sidebar
function show_routes(){
    $('.list-opened').toggle();
    $('.list-opened').removeClass('list-opened');
    if(opened!='routes'){
        $("#routes-list").toggle();
        $("#routes-list").addClass("list-opened");
        opened = 'routes';
    } else {
        opened = null;
    }
}

// Show transportation methods on side bar
function show_init_stop_list(){
    $('.list-opened').toggle();
    $('.list-opened').removeClass('list-opened');
    if(opened!='stops'){
        $("#init-stop-list").toggle();
        $("#init-stop-list").addClass("list-opened");
        opened = 'stops';
    } else {
        opened = null;
    }
}
// Show stops for a transportation on sidebar
function show_stops(bus){
    if(bus_opened!=null){
        $("#stops-list-" + bus_opened).toggle();
        if(bus_opened!=bus){
            $("#stops-list-" + bus).toggle();
            bus_opened = bus;
        } else {
            bus_opened = null;
        }
    } else {
        $("#stops-list-" + bus).toggle();
        bus_opened = bus;
    }
}
