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

def make_request_to_lanta(route_id, meta):
    human,unix = meta
    no_cache = str(rand.randrange(87900687908975685))
    path = "data/lanta/raw/"+route_id+"/_"+no_cache+".json"
    file_request_out = open(path,"w+")

    result_xml = requests.get("https://realtimelanta.availtec.com/InfoPoint/rest/Vehicles/GetAllVehiclesForRoute?routeID="+route_id+"&_="+no_cache)
    try:
	    res_json = result_xml.json()
	    for bus in res_json:
	        bus["human_scrape_time"] = human
	        bus["unix_scrape_time"] = unix 
	    # print(res_json)
	    file_request_out.write(json.dumps(res_json))
	    file_request_out.close()
    except:
    	print("LANTA Backend submitted malformed JSON (probs)")


def make_request_to_lehigh(meta): #due to how Lehigh works, we're just gonna scrape the bus endpoint and loop through that to save it
    bus_url = "https://bus.lehigh.edu/scripts/busdata.php?format=json"
    
    temp = requests.get(bus_url)
    try:
        data = temp.json()
    except:
        print("failed to scrape Lehigh.")
        return
    human,unix = meta
    for bus in data.values():
        bus_type = bus.get("key")
        route_id = bus.get("rid")
        if bus_type == "LU" or bus_type == "CH" or route_id == "6": #don't attempt to get AccessLU or Charter Bus
            continue
        bus["human_scrape_time"] = human
        bus["unix_scrape_time"] = unix
        no_cache = str(rand.randrange(879008975686587697085))
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

day_dict = {}
time_prev = t.strftime("%a%d%b%Y", t.gmtime())
while True:
    t.sleep(4)
    time_scraped_str = t.strftime("%a%d%b%Y", t.gmtime())
    time_scraped_unix = str(t.time())

    meta = (time_scraped_str, time_scraped_unix)
    for lanta_rid in lanta_routes:
        make_request_to_lanta(lanta_rid, meta)

    make_request_to_lehigh(meta)
    time_prev = time_scraped_str
