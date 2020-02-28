import json
import requests
import os
import random as rand
import time as t

def make_directory_structure(lehigh, lanta):
    for v in lehigh:
        path = "data/lehigh/raw/"+v
        if not os.path.isdir(path):
            os.mkdir(path)

    for v in lanta:
        path = "data/lanta/raw/"+v
        if not os.path.isdir(path):
            os.mkdir(path)

def make_request_to_lanta(route_id):
    no_cache = str(rand.randrange(879008975685))
    path = "data/lanta/raw/"+route_id+"/_"+no_cache+".json"
    file_request_out = open(path,"w+")

    result_xml = requests.get("https://realtimelanta.availtec.com/InfoPoint/rest/Vehicles/GetAllVehiclesForRoute?routeID="+route_id+"&_="+no_cache)
    res_json = result_xml.json()
    file_request_out.write(json.dumps(res_json))
    file_request_out.close()


def make_request_to_lehigh(): #due to how Lehigh works, we're just gonna scrape the bus endpoint and loop through that to save it
    bus_url = "https://bus.lehigh.edu/scripts/busdata.php?format=json"
    
    temp = requests.get(bus_url)
    data = temp.json()

    for bus in data.values():
        bus_type = bus.get("key")
        if bus_type == "LU" or bus_type == "CH": #don't attempt to get AccessLU or Charter Bus
            continue
        route_id = bus.get("rid")
        no_cache = str(rand.randrange(879008975685))
        path = "data/lehigh/raw/"+route_id+"/_"+no_cache+".json"
        file_request_out = open(path,"w+")
        file_request_out.write(json.dumps(bus))
        file_request_out.close()


file_lanta_routes_in = open("routes/lanta/routes.json", "r")
file_lehigh_routes_in = open("routes/lehigh/routes.json", "r")

lanta_routes = json.loads(file_lanta_routes_in.read())
lehigh_routes = json.loads(file_lehigh_routes_in.read())

file_lanta_routes_in.close()
file_lehigh_routes_in.close()

make_directory_structure(lehigh_routes, lanta_routes)

while True:
    t.sleep(4)
    for lanta_rid in lanta_routes:
        make_request_to_lanta(lanta_rid)

    make_request_to_lehigh()
