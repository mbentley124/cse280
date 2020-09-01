import json, requests
class BusStop:
    def __init__(self, stop_id, name, latitude, longitude):
        self.stop_id = stop_id
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.coords = {"lat":latitude, "long":longitude}

    def to_json(self):
        return json.dumps(self.__dict__)
    def to_dict(self):
        return self.__dict__
