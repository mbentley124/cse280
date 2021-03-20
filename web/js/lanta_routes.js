//TODO: Shouldn't be fetching in front-end, thats what scraper is for
//goes through lanta routes and adds a stop list for each route
routes.lanta.forEach(element => {
    delete element.Stops //just deleting the empty Stops array
    element.stops = [] //placeholder for list of stops
    fetch("https://realtimelanta.availtec.com/InfoPoint/rest/Stops/GetAllStopsForRoutes?routeIDs=" + element.RouteId)
        .then(response => response.json())
        .then(response => response.forEach(responseElement => {
            element.stops.push(responseElement.StopId)
        }))
});