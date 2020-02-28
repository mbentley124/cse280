#GOAL: 
# use glob to collect all files in the raw directory and package them into a single JSON daily.
from time import gmtime, strftime
import glob
import os
import json

today_time = strftime("%a%d%b%Y", gmtime())

organizations = [x for x in os.walk("data")]

potential_times = set()
# potential_file_name
# os.chdir("data")
for org in glob.glob("data/*/"):
    org_name = (org.replace("data/", "")).replace("/", "")
    for route in glob.glob(org+"raw/*/"):
        for scraped_data in glob.glob(route+"*.json"):
            file_temp_read_in = open(scraped_data, "r")
            file_temp_dict = json.loads(file_temp_read_in.read())
            print(file_temp_dict)
            
    # file_temp_read_in = open("")    

