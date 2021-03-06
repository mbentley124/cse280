import json, argparse, sys
import requests
import os
import random as rand
import time as t
import datetime
from LehighScraper import LehighScraper
from LANTAScraper import LANTAScraper
import mysql.connector
from multiprocessing import Pool
def return_cnx():
    try:
        cnx = mysql.connector.connect(  user=os.environ.get("DB_USER", "busapp"),
                                        password=os.environ.get("DB_PASS", "busapp"),
                                        host=os.environ.get("DB_HOST", "localhost"),
                                        database='busapp',
                                        auth_plugin='mysql_native_password')
    except Exception as e:
        print("Ex1")
        log_error(e)
        cnx = None
    return cnx
    

def write_to_db(data):
    try:
        cnx = return_cnx()
        cursor = cnx.cursor(prepared=True)
        prepared_statement = """INSERT INTO transient_bus (bus_id,short_name, last_stop, next_stop, latitude, longitude, route_id, route_name, bus_service)
                                                    VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        for bus in data:
            if "timings" in bus:
                bus.pop("timings", None)
            if "projected_coords" in bus:
                bus.pop("projected_coords", None)
            # print(bus)
            bus_id, short_name, last_stop, next_stop, latitude, longitude, route_id, route_name, _, service = bus.values()
            # print(bus.values())
            # print((bus_id, short_name, last_stop, next_stop, latitude, longitude, route_id, route_name, service)) 
            cursor.execute(prepared_statement, (bus_id, short_name, last_stop, next_stop, latitude, longitude, route_id, route_name, service))
        cnx.commit()
        cnx.close()
    except Exception as e:
        print("ex2")
        log_error(e)
        raise e


def log_error(e):
    curr_time = str(datetime.datetime.now())
    print(curr_time+"\t"+str(e))

parser = argparse.ArgumentParser("Scrape Lehigh University & LANTA Bus Trackers")
parser.add_argument("-p", "--prediction", nargs='?', type=bool, const=True, default=False)
parser.add_argument("-wf", "--write-file", nargs='?', type=bool, const=True, default=True)
parser.add_argument("-wd", "--write-db", nargs='?', type=bool, const=True, default=True)
parser.add_argument("-nt", "--threads", nargs='?', type=bool, const=False, default=True)
args = parser.parse_args()

preds = args.prediction
write_files = args.write_file
write_db = args.write_db
th = args.threads

lehigh = LehighScraper(next_stop=True, threading=th)
lanta = LANTAScraper()

while True:
    total_buses = -1
    projection_total = -1
    historical_total = -1
    begin = t.time()
    begin_lanta = t.time()
    lanta.request_routes()
    lanta.get_routes()
    lanta.request_stops()
    lanta.request_buses()
    end_lanta = t.time()
    lanta_time = end_lanta - begin_lanta
    begin_lu = t.time()
    lehigh.request_stops()
    lehigh.request_buses()
    end_lu = t.time()
    lu_time = end_lu - begin_lu
    dict_begin = t.time()
    try:
        projection_begin = t.time()
        stops = {"lanta": lanta.get_stops(), "lehigh": lehigh.get_stops()}
        buses = {"lanta": lanta.get_buses(projection=preds), "lehigh": lehigh.get_buses(projection=preds)}
        projection_end = t.time()
        projection_total = projection_end - projection_begin
        routes = {"lanta": [], "lehigh": lehigh.request_routes(return_data=True)}
        historical_begin = t.time()
        total_buses = len(buses['lehigh']) + len(buses['lanta'])
        historical_end = t.time()
        historical_total = historical_end - historical_begin
        dict_end = t.time()
        if write_files:
            with open("data/all/stops.json", "w+") as st:
                # print(stops)
                st.write("const stops = "+json.dumps(stops)+";")
            with open("stops.json", "w+") as st2:
                json.dump(fp=st2, obj=stops)
            with open("data/all/bus_data.json", "w+") as bu:
                json.dump(fp=bu, obj=buses)
            with open("data/all/routes.json", "w+") as ro:
                ro.write("const routes = "+json.dumps(routes)+";")
        
        if write_db:
            write_to_db(buses['lehigh'])
            write_to_db(buses['lanta'])
    except Exception as e:
        dict_end = -1
        log_error(e)
        t.sleep(10)
    end = t.time()
    print()
    print("Completed in: {} seconds".format(str(end - begin)))
    print("Total Buses: {}".format(str(total_buses)))
    print("Retrieve Data: {}".format(str(lanta_time + lu_time)))
    print("\tLANTA:  {}".format(str(lanta_time)))
    print("\tLehigh: {}".format(str(lu_time)))
    print("Data Parsing: {}".format(str(dict_end - dict_begin)))
    print("\tBus Projections: {}".format(str(projection_total)))
    print("\t\tSeconds per bus: {}".format(
            str(round(projection_total/total_buses, 2))
        )
    )
    print("\tStoring Data:    {}".format(str(historical_total)))
    t.sleep(2)


# lanta.request_routes()
# print(lanta.get_routes())

# # lanta.request_buses()
# # print(lanta.get_buses())

# lanta.request_stops()
# print(lanta.get_stops())
