# TODO: don't output JSON files for lehigh and lanta individually


import json
import requests
import os
import random as rand
import time as t
import datetime
import mysql.connector


def log_error(e):
    curr_time = str(datetime.datetime.now())
    print(curr_time+"\t"+e)

def make_directory_structure(lehigh, lanta):
    for v in lehigh:
        path = "data/lehigh/raw/"+v
        if not os.path.isdir(path):
            os.mkdir(path)

    for v in lanta:
        path = "data/lanta/raw/"+v
        if not os.path.isdir(path):
            os.mkdir(path)

def get_lanta_stops(route_id):
    no_cache = str(rand.randrange(87900687908975685))
    #https://realtimelanta.availtec.com/InfoPoint/rest/RouteDetails/Get/104
    #https://realtimelanta.availtec.com/InfoPoint/Resources/Traces/Route_104.kml
    # print("making req")
    result_json = requests.get("https://realtimelanta.availtec.com/InfoPoint/rest/RouteDetails/Get/"+route_id+"?_="+no_cache)
    stop_list = []
    try:
        data = result_json.json()
        #print(result_json)
        for stop in data.get("Stops"):
            stop_list.append(stop)
        return stop_list
    except:
        log_error("error getting LANTA routes (probs malformed JSON)")
        return []


def get_lehigh_stops():
    stop_url = "https://bus.lehigh.edu/scripts/stopdata.php?format=json"
    temp = requests.get(stop_url)
    try:
        return temp.json()
    except:
        log_error("failed to scrape Lehigh.")
        return {}

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
        return res_json
    except:
    	log_error("LANTA Backend submitted malformed JSON (probs)")


def make_request_to_lehigh(meta): #due to how Lehigh works, we're just gonna scrape the bus endpoint and loop through that to save it
    bus_url = "https://bus.lehigh.edu/scripts/busdata.php?format=json"
    temp = requests.get(bus_url)
    try:
        data = temp.json()
    except:
        log_error("failed to scrape Lehigh.")
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
        return data
    

# open and load in routes for lehigh and lants from files
file_lanta_routes_in = open("routes/lanta/routes.json", "r")
file_lehigh_routes_in = open("routes/lehigh/routes.json", "r")

# put them in a hashmap
lanta_routes = json.loads(file_lanta_routes_in.read())
lehigh_routes = json.loads(file_lehigh_routes_in.read())

# close the files
file_lanta_routes_in.close()
file_lehigh_routes_in.close()

# makes a new dir for each route
# JSON files will be stored in these
make_directory_structure(lehigh_routes, lanta_routes)

# holds JSON data that was scraped and that will be output into a JSON file for the frontend to use.
all_dict = {}
all_dict['lehigh'] = []
all_dict['lanta'] = []

time_prev = t.strftime("%a%d%b%Y", t.gmtime())

stop_dict = {}
stop_dict['lehigh'] = []
stop_dict['lanta'] = []

while True:
    t.sleep(4)
    time_scraped_str = t.strftime("%a%d%b%Y", t.gmtime())
    time_scraped_unix = str(t.time())

    meta = (time_scraped_str, time_scraped_unix)
    for lanta_rid in lanta_routes:
        all_dict['lanta'].append(make_request_to_lanta(lanta_rid, meta))
        stop_dict['lanta'].append(get_lanta_stops(lanta_rid))

    i = 0
    try:
        cnx = mysql.connector.connect(  user='busapp',
                                        password='busapp',
                                        host='localhost',
                                        database='busapp',
                                        auth_plugin='mysql_native_password')
        cursor = cnx.cursor(prepared=True)
        insert_lanta_data = """ INSERT INTO lantabusdata (vehicle_id,name,latitude,longitude,route_id,heading,speed,last_stop,destination,op_status,date_retrieved)
                            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,FROM_UNIXTIME(%s))"""
        for x in all_dict['lanta']:
            for y in x:
                values = (y['VehicleId'], y['Name'], y['Latitude'], y['Longitude'], y['RouteId'], y['Heading'], y['Speed'], y['LastStop'], y['Destination'], y['OpStatus'], y['unix_scrape_time'])
                cursor.execute(insert_lanta_data, values)
        cnx.commit()
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
    finally:
        if (cnx.is_connected()):
            cursor.close()
            cnx.close()
            print("Data was inserted.")

# gets lehigh bus data and puts it in JSON file
    all_dict['lehigh'] = None #make_request_to_lehigh(meta)
    time_prev = time_scraped_str
    file_all_times_out = open("data/all/bus_data.json", "w+") # open file IMMEDIATELY before writing
    file_all_times_out.write(json.dumps(all_dict))
    file_all_times_out.close()
    all_dict['lehigh'] = all_dict['lanta'] = []

# gets Lehigh stop data and puts it in JSON file
    stop_dict['lehigh'] = None #get_lehigh_stops()
    file_all_stops_out = open("data/all/stops.json", "w+")
    file_all_stops_out.write("var stops = "+json.dumps(stop_dict)) #need to do this since we load this on page load in a simple way.
    file_all_times_out.close()
    stop_dict['lehigh'] = stop_dict['lanta'] = []
