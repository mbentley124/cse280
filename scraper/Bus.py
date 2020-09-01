import json
class Bus:
    def __init__(self, bus_id, short_name, latitude, longitude, route_id, route_name=None, last_stop=None, next_stop=None):
        self.bus_id = bus_id
        self.short_name = short_name
        self.last_stop = last_stop
        self.next_stop = next_stop
        self.latitude = latitude
        self.longitude = longitude
        self.route_id = route_id
        self.route_name = route_name
        self.coords = {"lat":latitude, "long":longitude}

    def to_json(self):
        return json.dumps(self.__dict__)
    
    def to_dict(self):
        return self.__dict__
