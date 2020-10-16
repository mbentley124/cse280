import json, mysql.connector, requests
class Bus:
    route_map = {
        12: "AccessLU",
        50: "Campus Connector",
        28: "Packer Express"
    }
    def __init__(self, bus_id, short_name, latitude, longitude, route_id, route_name=None, last_stop=None, next_stop=None, do_projection=False, cnx=None, service="Lehigh", do_next_stop=False, stops=None, routes=[], cache={}):
        self.bus_id = bus_id
        self.short_name = short_name
        self.last_stop = last_stop
        self.next_stop = next_stop
        self.latitude = latitude
        self.longitude = longitude
        self.route_id = route_id
        self.route_name = self.route_map.get(route_id, None) if service == "Lehigh" else None
        self.coords = {"lat":latitude, "long":longitude}
        self.service = service
        self.timings = None
        self.stop_offset_cache = cache
        if do_projection:
            self.cnx = mysql.connector.connect(  user='busapp',
                                        password='busapp',
                                        host='localhost',
                                        database='busapp',
                                        auth_plugin='mysql_native_password')
            self.prepared_statement = """select last_stop as ls, bus_id as b, route_id as ro, insertion_time as r, (SELECT CONCAT(latitude,",",longitude) FROM transient_bus as l WHERE UNIX_TIMESTAMP(l.insertion_time) BETWEEN UNIX_TIMESTAMP(r) +5 AND UNIX_TIMESTAMP(r)+20 AND l.route_id = ro AND l.bus_id = b AND l.last_stop = ls ORDER BY UNIX_TIMESTAMP(l.insertion_time) LIMIT 1) as projected_point, ST_Distance_Sphere(point(latitude, longitude), point(%s,%s)) as D FROM transient_bus ORDER BY D ASC LIMIT 1"""
            self.projected_coords = self.compute_projection()
        else:
            self.projected_coords = {"lat":None, "long":None}

        if do_next_stop and self.route_name and (self.route_name != "AccessLU"): #NB: Make sure we're projecting on a known route.
            try:
                curr_route = routes.get(str(self.route_id))
                if not (curr_route is None):
                    new_route = self.pivot_unwrap(curr_route, self.last_stop)
                    self.next_stop = new_route[1]
                    self.timings = {}
                    stop_map = self.align_routes(stops, new_route)
                    first_lookahead = stop_map[str(self.next_stop)]
                    first = self.time_to(self.latitude, self.longitude, first_lookahead.get("latitude"), first_lookahead.get("longitude"))
                    accumulation = first.get("total_time", 0)
                    self.timings[first_lookahead.get("stop_id")] = first
                    for cntr, stop_id in enumerate(new_route[2:], 2):
                        # print(cntr)
                        if new_route[cntr] == 156 or new_route[cntr - 1] == 156:
                            continue # TODO: Missing stop?
                        last = stop_map[str(new_route[cntr - 1])]
                        curr = stop_map[str(new_route[cntr])]
                        time_dict = self.time_to(last.get("latitude"), last.get("longitude"), curr.get("latitude"), curr.get("longitude"), accumulation, offset_stop=False)
                        self.timings[curr.get("stop_id")] = time_dict
                        accumulation = time_dict.get("total_time")
            except Exception as e:
                print(f"Bus Init Error: {str(e)}")


    def to_json(self):
        return json.dumps(self.to_dict())
    
    def pivot_unwrap(self, route, stop):
        index = route.index(stop)
        return [*route[index:],*route[:index]]

    def align_routes(self, stop_dicts, stop_ids):
        # TODO: Make this not a double loop
        stop_map = {}
        for stop_id in stop_ids:
            # print(stop_id)
            for stop_dict in stop_dicts:
                if stop_id == stop_dict.get("stop_id"):
                    stop_map[str(stop_id)] = stop_dict
        # print(stop_map)
        return stop_map

    def time_to(self, lat1, lng1, lat2, lng2, prev=0, offset_stop=True):
        key_str = f"{lng1},{lat1};{lng2},{lat2}"
        # print(self.stop_offset_cache)
        cache_hit = self.stop_offset_cache.get(key_str, False)
        if (not offset_stop) and cache_hit:
            return cache_hit
        #http://127.0.0.1:5000/route/v1/driving/${proj_long},${proj_lat};${lng},${lat}?overview=full
        query_str = f"http://127.0.0.1:5000/route/v1/driving/{key_str}?overview=full"
        response = requests.get(query_str, timeout=(1, 2))

        if response.status_code != 200:
            response.raise_for_status()
        
        results = response.json() #let the caller handle exceptions
        possible_routes = results.get("routes")
        if possible_routes is None:
            return None
        
        route = possible_routes[0]
        time = route.get("duration", -1)
        time *= 1.05
        time += prev
        minutes = time // 60
        seconds = time % 60
        return_obj = {"minutes": minutes, "seconds": round(seconds, 2), "total_time": round(time, 2)}
        # print(self.stop_offset_cache)
        return return_obj

    def to_dict(self):
        d = self.__dict__
        exclude = ["cnx", "prepared_statement", "do_next_stop", "stop_offset_cache"]
        return {i:d[i] for i in d if not (i in exclude)}

    def compute_projection(self):
        cursor = self.cnx.cursor(prepared=True)
        cursor.execute(self.prepared_statement, (self.latitude, self.longitude))
        res = cursor.fetchone()
        # self.cnx.commit()
        projection = res[4]
        if projection is None:
            return {"lat": None, "long": None}
        lat, lng = projection.split(",")
        return {"lat": float(lat), "long":float(lng)}
 
    def __exit__(self, exc_type, exc_value, traceback):
        if not(self.cnx is None):
            cnx.close()
