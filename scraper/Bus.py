import json, mysql.connector
class Bus:

    def __init__(self, bus_id, short_name, latitude, longitude, route_id, route_name=None, last_stop=None, next_stop=None, do_projection=False):
        self.bus_id = bus_id
        self.short_name = short_name
        self.last_stop = last_stop
        self.next_stop = next_stop
        self.latitude = latitude
        self.longitude = longitude
        self.route_id = route_id
        self.route_name = route_name
        self.coords = {"lat":latitude, "long":longitude}
        if do_projection:
            self.cnx = mysql.connector.connect(  user='busapp',
                                        password='busapp',
                                        host='localhost',
                                        database='busapp',
                                        auth_plugin='mysql_native_password')
            self.prepared_statement = """select bus_id as b, route_id as ro, insertion_time as r, (SELECT CONCAT(latitude,",",longitude) FROM transient_bus as l WHERE UNIX_TIMESTAMP(l.insertion_time) BETWEEN UNIX_TIMESTAMP(r) +5 AND UNIX_TIMESTAMP(r)+20 AND l.route_id = ro AND l.bus_id = b ORDER BY UNIX_TIMESTAMP(l.insertion_time) LIMIT 1) as projected_point, ST_Distance_Sphere(point(latitude, longitude), point(%s,%s)) as D FROM transient_bus ORDER BY D ASC LIMIT 1"""
            self.projected_coords = self.compute_projection()
        else:
            self.projected_coords = {"lat":None, "long":None}

    def to_json(self):
        return json.dumps(self.__dict__)
    
    def to_dict(self):
        return self.__dict__

    def compute_projection(self):
        cursor = self.cnx.cursor(prepared=True)
        cursor.execute(self.prepared_statement, (self.latitude, self.longitude))
        res = cursor.fetchone()
        self.cnx.commit()
        projection = res[3]
        if projection is None:
            return {"lat": None, "long": None}
        lat, lng = projection.split(",")
        return {"lat": float(lat), "long":float(lng)}
