import json
import requests
import os
import random as rand
import time as t
import datetime
from LehighScraper import LehighScraper
from LANTAScraper import LANTAScraper
import mysql.connector

def write_to_db(data, service, cnx):
    # print(data)
    cursor = cnx.cursor(prepared=True)
    prepared_statement = """INSERT INTO transient_bus (bus_id,short_name, last_stop, next_stop, latitude, longitude, route_id, route_name, bus_service)
                                                VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    for bus in data:
        bus_id, short_name, last_stop, next_stop, latitude, longitude, route_id, route_name, _,__ = bus.values()
        # print((bus_id, short_name, last_stop, next_stop, latitude, longitude, route_id, route_name, service)) 
        cursor.execute(prepared_statement, (bus_id, short_name, last_stop, next_stop, latitude, longitude, route_id, route_name, service))
    
    cnx.commit()


def log_error(e):
    curr_time = str(datetime.datetime.now())
    print(curr_time+"\t"+str(e))

lehigh = LehighScraper()
lanta = LANTAScraper()

while True:
    cnx = mysql.connector.connect(  user='busapp',
                                        password='busapp',
                                        host='localhost',
                                        database='busapp',
                                        auth_plugin='mysql_native_password')
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
        stops = {"lanta": lanta.get_stops(), "lehigh": lehigh.get_stops()}
        buses = {"lanta": lanta.get_buses(cnx), "lehigh": lehigh.get_buses(cnx)}
        cnx.commit()
        routes = {"lanta": [], "lehigh": lehigh.request_routes(return_data=True)}
        write_to_db(buses['lehigh'], "Lehigh", cnx)
        write_to_db(buses['lanta'], "LANTA", cnx)
        cnx.close()
        dict_end = t.time()
        with open("data/all/stops.json", "w+") as st:
            st.write("const stops = "+json.dumps(stops)+";")
        with open("data/all/bus_data.json", "w+") as bu:
            json.dump(fp=bu, obj=buses)
        with open("data/all/routes.json", "w+") as ro:
            ro.write("const routes = "+json.dumps(routes)+";")
    except Exception as e:
        dict_end = -1
        log_error(e)
        t.sleep(10)
    end = t.time()
    print("sleeping...")
    print("Completed in: {} seconds".format(str(end - begin)))
    print("LANTA:  {}".format(str(lanta_time)))
    print("Lehigh: {}".format(str(lu_time)))
    print("Dict:   {}".format(str(dict_end - dict_begin)))
    t.sleep(4)


# lanta.request_routes()
# print(lanta.get_routes())

# # lanta.request_buses()
# # print(lanta.get_buses())

# lanta.request_stops()
# print(lanta.get_stops())
