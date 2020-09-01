from BusStop import BusStop
from Bus import Bus
from BusRoute import BusRoute
import requests, os
class LehighScraper:
    response_data = []
    stops = []
    def __init__(self, scraping_url = "https://lehigh.doublemap.com/map/v2/buses"):
        self.scraping_url = scraping_url
        print("Initialized LehighScraper | PID: {}".format(os.getpid()))
    
    def request_buses(self, processing = None, return_data = False):
        response = requests.get(self.scraping_url)

        if response.status_code != 200:
            response.raise_for_status()
        
        results = response.json() #let the caller handle exceptions


        if processing:
            results = processing(results)
        
        self.response_data = results

        if return_data:
            return results

    def get_buses(self):
        if not self.response_data:
            self.response_data = self.request_buses()
        bus_list = []
        for bus in self.response_data:
            bus_id = bus.get("id")
            name = bus.get("name")
            lat = bus.get("lat")
            lon = bus.get("lon")
            route = bus.get("route")
            last_stop = bus.get("lastStop")
            bus_list.append(Bus(
                bus_id=bus_id,
                short_name=name,
                last_stop=last_stop,
                latitude=lat,
                longitude=lon,
                route_id=route
                ).to_dict()
            )
        return bus_list

    def request_stops(self, url = "https://lehigh.doublemap.com/map/v2/stops", processing = None, return_data = False):
        
        response = requests.get(url)

        if response.status_code != 200:
            response.raise_for_status()
        
        results = response.json() #let the caller handle exceptions


        if processing:
            results = processing(results)
        
        self.stops = results

        if return_data:
            return results

    def get_stops(self):
        new_stops = []
        for stop in self.stops:
            name = stop.get("name")
            lat = stop.get("lat")
            lon = stop.get("lon")
            stop_id = stop.get("id")
            new_stops.append(
                BusStop(
                    stop_id=stop_id,
                    name=name,
                    latitude=lat,
                    longitude=lon
                ).to_dict()
            )
        return new_stops

    def request_routes():
        # https://lehigh.doublemap.com/map/v2/routes
        pass


        

        
