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

//use buttons to toggle dark mode on/off
function toggle_style(style) {
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

toggle_style((args.get("style") == null) ? check_dark() : args.get("style"));