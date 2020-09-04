import json, requests, os
import random as rand
from BusRoute import BusRoute
from BusStop import BusStop
from Bus import Bus
import time as t
class LANTAScraper:
    routes = []
    cleaned_routes = []
    buses = []
    stops = []
    last_stops = t.time()
    def __init__(self, routes = []):
        self.routes = routes #init with predetermined route numbers if needed
        print("Initialized LANTAScraper | PID: {}".format(os.getpid()))
    
    def request_routes(self, url = "https://realtimelanta.availtec.com/InfoPoint/rest/Routes/GetVisibleRoutes", return_data = False, processing = None):
        response = requests.get(url, headers = {
            "Accept": "Accept: application/json, text/javascript, */*; q=0.01"
        })

        if response.status_code != 200:
            response.raise_for_status()
        
        results = response.json() #let the caller handle exceptions


        if processing:
            results = processing(results)

        self.routes = results

        if return_data:
            return results

    def get_routes(self):
        new_routes = []
        for route in self.routes:
            new_routes.append(BusRoute(
                route_id=route.get("RouteId"),
                short_name=route.get("ShortName"),
                long_name=route.get("LongName"),
                ).to_dict()
            )
        self.cleaned_routes = new_routes
        return new_routes

    def request_buses(self, url = "https://realtimelanta.availtec.com/InfoPoint/rest/Vehicles/GetAllVehiclesForRoutes", processing = None, return_data = False):
        no_cache = str(rand.randrange(879006685))
        all_rids = ",".join([str(r["route_id"]) for r in self.cleaned_routes])
        response = requests.get(url, headers = {
            "Accept": "Accept: application/json, text/javascript, */*; q=0.01"
        }, 
        params = {
            "routeIDs": all_rids,
            "_": no_cache,
        })

        if response.status_code != 200:
            response.raise_for_status()
        
        results = response.json() #let the caller handle exceptions


        if processing:
            results = processing(results)

        self.buses = results

        if return_data:
            return results

    def get_buses(self):
        bus_list = []
        for bus in self.buses:
            bus_id = bus.get("VehicleId")
            name = bus.get("name")
            lat = bus.get("Latitude")
            lon = bus.get("Longitude")
            route = bus.get("RouteId")
            last_stop = bus.get("LastStop")
            bus_list.append(Bus(
                bus_id=bus_id,
                short_name=name,
                last_stop=last_stop,
                latitude=lat,
                longitude=lon,
                route_id=route,
                do_projection=True
                ).to_dict()
            )
        return bus_list

    def request_stops(self, url = "https://realtimelanta.availtec.com/InfoPoint/rest/RouteDetails/Get/{}", processing = None, return_data = False):
        curr_time = t.time()
        if (self.last_stops - curr_time > 900) or (not self.stops):
            self.last_stops = t.time()
        else:
            return self.stops
        # print(self.cleaned_routes)
        new_stops = []
        no_cache = str(rand.randrange(879006685))
        for route in self.cleaned_routes:
            rid = route["route_id"]
            # print(url.format(str(rid)))
            response = requests.get(url.format(str(rid)), headers = {
                "Accept": "Accept: application/json, text/javascript, */*; q=0.01"
            }, 
            params = {
                "_": no_cache,
            })

            if response.status_code != 200:
                response.raise_for_status()
            
            results = response.json() #let the caller handle exceptions
            # print(results)
            results = results.get("Stops")


            if processing:
                results = processing(results)

            new_stops.append(results)
        self.stops = new_stops

        if return_data:
            return new_stops
    
    def get_stops(self):
        new_stops = []
        # print(self.stops)
        for route in self.stops:
            for stop in route:
                name = stop.get("Name")
                lat = stop.get("Latitude")
                lon = stop.get("Longitude")
                stop_id = stop.get("StopId")
                new_stops.append(
                    BusStop(
                        stop_id=stop_id,
                        name=name,
                        latitude=lat,
                        longitude=lon
                    ).to_dict()
                )
        return new_stops
