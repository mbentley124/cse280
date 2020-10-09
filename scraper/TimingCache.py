import json
class TimingCache:
    #Stub in case we need to do some more modification
    def __init__(self):
        pass
    def cache(self):
        with open("cacheme.json") as cache:
            try:
                d = json.load(cache)
                # print(d)
                return d
            except:
                return {}