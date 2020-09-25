import json, mysql.connector, requests
class Bus:
    def __init__(self, bus_id, short_name, latitude, longitude, route_id, route_name=None, last_stop=None, next_stop=None, do_projection=False, cnx=None, service="Lehigh", do_next_stop=False, stops=None, routes=[]):
        self.bus_id = bus_id
        self.short_name = short_name
        self.last_stop = last_stop
        self.next_stop = next_stop
        self.latitude = latitude
        self.longitude = longitude
        self.route_id = route_id
        self.route_name = route_name
        self.coords = {"lat":latitude, "long":longitude}
        self.service = service
        self.timings = None
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

        if do_next_stop:
            curr_route = routes.get(str(self.route_id))
            if not (curr_route is None):
                new_route = self.pivot_unwrap(curr_route, self.last_stop)
                self.next_stop = new_route[1]
                for stop in stops:
                    if stop.get("stop_id") == self.next_stop:
                        self.timings = self.time_to(stop.get("latitude"), stop.get("longitude"), self.latitude, self.longitude)
                        # print(self.timings)

    def to_json(self):
        return json.dumps(self.to_dict())
    
    def pivot_unwrap(self, route, stop):
        index = route.index(stop)
        return [*route[index:],*route[:index]]

    def time_to(self, lat1, lng1, lat2, lng2):
        #http://127.0.0.1:5000/route/v1/driving/${proj_long},${proj_lat};${lng},${lat}?overview=full
        query_str = f"http://127.0.0.1:5000/route/v1/driving/{str(lng1)},{str(lat1)};{str(lng2)},{str(lat2)}?overview=full"
        response = requests.get(query_str)

        if response.status_code != 200:
            response.raise_for_status()
        
        results = response.json() #let the caller handle exceptions
        possible_routes = results.get("routes")
        if possible_routes is None:
            return None
        
        route = possible_routes[0]
        time = route.get("duration")
        minutes = time // 60
        seconds = time % 60
        return {"minutes": minutes, "seconds": round(seconds, 2), "total_time": time}

    def to_dict(self):
        d = self.__dict__
        d.pop("cnx", None)
        d.pop("prepared_statement", None)
        d.pop("do_next_stop", None)
        return d

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
