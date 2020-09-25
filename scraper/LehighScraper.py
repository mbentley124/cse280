from BusStop import BusStop
from Bus import Bus
from BusRoute import BusRoute
import requests, os
import time as t
from multiprocessing import Pool
class LehighScraper:
    buses = []
    stops = []
    last_stops = t.time()
    routes = []
    clean_stops = {}
    def __init__(self, scraping_url = "https://lehigh.doublemap.com/map/v2/buses", next_stop=False):
        self.scraping_url = scraping_url
        self.next_stop = next_stop
        print("Initialized LehighScraper | PID: {}".format(os.getpid()))
    
    def request_buses(self, processing = None, return_data = False):
        response = requests.get(self.scraping_url)

        if response.status_code != 200:
            response.raise_for_status()
        
        results = response.json() #let the caller handle exceptions


        if processing:
            results = processing(results)
        
        self.buses = results

        if return_data:
            return results

    def get_buses(self, projection=True, next_=True):
        bus_list = []
        self.projection = projection
        self.next_stop = next_
        with Pool(len(self.buses)) as p:
            bus_list = list(p.map(self._multi_bus, self.buses))
                
        return bus_list

    def _multi_bus(self, bus):
        bus_id = bus.get("id")
        name = bus.get("name")
        lat = bus.get("lat")
        lon = bus.get("lon")
        route = bus.get("route")
        last_stop = bus.get("lastStop")
        return Bus(
            bus_id=bus_id,
            short_name=name,
            last_stop=last_stop,
            latitude=lat,
            longitude=lon,
            route_id=route,
            do_projection=self.projection,
            do_next_stop=self.next_stop,
            service="Lehigh",
            stops=self.clean_stops
            ).to_dict()

    def request_stops(self, url = "https://lehigh.doublemap.com/map/v2/stops", processing = None, return_data = False):
        curr_time = t.time()
        if (self.last_stops - curr_time > 1800) or (not self.stops):
            self.last_stops = t.time()
        else:
            return self.stops

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
        self.clean_stops = new_stops
        return new_stops

    def request_routes(self, url = "https://lehigh.doublemap.com/map/v2/routes", processing = None, return_data = False):
        # https://lehigh.doublemap.com/map/v2/routes
        curr_time = t.time()
        if (self.last_stops - curr_time > 2700) or (not self.routes):
            self.last_stops = t.time()
        else:
            return self.routes
        response = requests.get(url)

        if response.status_code != 200:
            response.raise_for_status()
        
        results = response.json() #let the caller handle exceptions


        if processing:
            results = processing(results)
        
        self.routes = results

        if return_data:
            return results


        

        
