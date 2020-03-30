import mysql.connector
import sys,os
import json
import glob
import multiprocessing
import time
from mysql.connector import errorcode

#All code is specifically tailored for lantabusdata
def parallelize(which):
	try:
		cnx = mysql.connector.connect(	user='busapp', 
						password='busapp', 
						host='localhost', 
						database='busapp',
						auth_plugin='mysql_native_password')
		cursor = cnx.cursor()
		root = '/home/jsa/cse280/scraper/data/lanta/raw/' + str(which)
		query = ("INSERT IGNORE INTO lantabusdata (vehicle_id, name, latitude, longitude, route_id, heading, speed, last_stop, destination, op_status, date_retrieved) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FROM_UNIXTIME(%s))")
		print("Inserting data from " + root + "...")
		data_to_be_inserted = False
		for path, subdirs, files in os.walk(root):
			for name in files:
				full_path = os.path.join(path,name)
				with open (full_path, 'r') as f:
					if(os.path.getsize(full_path) > 0): #check for empty file
						jsonfile = json.load(f)
						data_to_be_inserted = True
						for data in jsonfile:
							values = (data['VehicleId'], data['Name'], data['Latitude'], data['Longitude'], data['RouteId'], data['Heading'], data['Speed'], data['LastStop'], data['Destination'], data['OpStatus'], data['unix_scrape_time'])
							cursor.execute(query,values)
		if(data_to_be_inserted == True):
			cnx.commit()
	except mysql.connector.Error as err:
		if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
			print("Something is wrong with your user name or password")
		elif err.errno == errorcode.ER_BAD_DB_ERROR:
			print("Database does not exist")
		else:
			print(err)
	finally:
		cursor.close()
		cnx.close()
		print("Closed database connection for " + root)

if __name__ == '__main__':
	start_time = time.time()
	processes = []
	for i in range (1,9): #For the 100's directories in lanta
		p = multiprocessing.Process(target=parallelize, args=(100 + i,))
		processes.append(p)
		p.start()
	for process in processes:
		process.join()
	print('That took {} seconds'.format(time.time() - start_time))
	start_time = time.time()
	processes = []
	for i in range (9,21): #For the 200's directories in lanta
		if(i != 19):
			p = multiprocessing.Process(target=parallelize, args=(200 + i,))
			processes.append(p)
			p.start()
	for process in processes:
		process.join()
	print('That took {} seconds'.format(time.time() - start_time))
	start_time = time.time()
	processes = []
	for i in range (19,26): #For the 300's directories in lanta
		if(i != 20 & i != 21):
			p = multiprocessing.Process(target=parallelize, args=(300 + i,))
			processes.append(p)
			p.start()
	for process in processes:
		process.join()
	print('That took {} seconds'.format(time.time() - start_time))
	start_time = time.time()
	processes = []
	for i in range (0,8): #For the 400's and 500's directories in lanta
		if(i == 0):
			p = multiprocessing.Process(target=parallelize, args=(400 + i,))
			processes.append(p)
			p.start()
		else:
			p = multiprocessing.Process(target=parallelize, args=(500 + i,))
			processes.append(p)
			p.start()
	for process in processes:
		process.join()
	print('That took {} seconds'.format(time.time() - start_time))
	for i in range (2,6): #For the 600's directories in lanta
		if(i != 4):
			p = multiprocessing.Process(target=parallelize, args=(600 + i,))
			processes.append(p)
			p.start()
	for process in processes:
		process.join()
	print('That took {} seconds'.format(time.time() - start_time))
