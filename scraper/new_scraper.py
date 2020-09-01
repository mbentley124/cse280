import json
import requests
import os
import random as rand
import time as t
import datetime
from LehighScraper import LehighScraper
from LANTAScraper import LANTAScraper

lehigh = LehighScraper()
lanta = LANTAScraper()

while True:
    lanta.request_routes()
    lanta.get_routes()
    lanta.request_stops()
    lehigh.request_stops()
    lehigh.request_buses()
    lanta.request_buses()
    stops = {"lanta": lanta.get_stops(), "lehigh": lehigh.get_stops()}
    buses = {"lanta": lanta.get_buses(), "lehigh": lehigh.get_buses()}
    with open("stops.json", "w") as st:
        json.dump(fp=st, obj=stops)
    with open("buses.json", "w") as bu:
        json.dump(fp=bu, obj=buses)
    print("sleeping...")
    t.sleep(1)


# lanta.request_routes()
# print(lanta.get_routes())

# # lanta.request_buses()
# # print(lanta.get_buses())

# lanta.request_stops()
# print(lanta.get_stops())