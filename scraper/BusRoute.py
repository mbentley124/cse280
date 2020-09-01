import json
class BusRoute:
    def __init__(self, route_id, short_name, long_name, polyline = []):
        self.route_id = route_id
        self.short_name = short_name
        self.long_name = long_name
        self.polyline = polyline
    
    def to_json(self):
        return json.dumps(self.__dict__)
    def to_dict(self):
        return self.__dict__