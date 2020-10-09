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