# CSE280 Final Report

## Overview
The goal of this project is to integrate the bus tracking system of Lehigh University and LANTA into a single, user friendly system. Additionally, we plan on pursuing a way to link the two systems together and provide a seamless way for students/faculty/staff to transition from one system to another.

## Team member contributions

### Hansen Lukman
This semester, I acquired a machine for our group to use. The machine was graciously offered to me by Todd George, the Systems Manager. Hopefully, the machine will be up and running through the summer and throughout the next semester. Additionally, I set up the database for our webscraper which allowed the team to stop storing bus data in JSON files. The webscraper itself was written by Cody, but I had to make some modifications to insert the data into the database instead of into JSON files. In addition, the webscraper would occasionally crash, so I wrote a small Python script to automatically re-run the scraper upon a crash. I also moved the accumulated JSON files from the machine to the database, using parallel processing through Python's multiprocessing library.

Other than that, I performed a lot of work in developing the user interface. We had imported a template for an interface with a side menu from pure-css, but it didn't really look good at all, so I did a lot of refactoring in the last few weeks of the semester to make it look more asthetically appealing and for the layout to actually be functioning and responsive. The side-menu options are currently hard coded, so this needs to be fixed next semeseter to incorporate a route from the backend that will return the values currently hardcoded on the front-end.
### Joseph Malisov

### Michael Bentley
Most of this semester was spent setting up the backend for the website to use. Currently the website uses the backend directly from lehigh and lanta. The backend, which I am currently in the process of creating, will replace this. It is setup using Maven, with all the depency's managed within that. These depencies include jdbc, which is used to make the database queries, and spark, which is used to manage the backend routes (both of which were used in CSE 216). There is an intial route setup on the backend which retreives the routes that a bus travels. There is a minor issue with the campus connector route since sometimes stops are missing from the data (should be able to fix it once buses are back up and running). The specifics of the route determination code was written by Cody and Joe. 

In order to run the code on one's own machine there is a script called ssh_forwarding.sh. This forwards the proper port to the database so that jdbc is able to connect to the mysql database properly. This script should not be required for running backend on the server, but only on your personal device. In terms of future plans there are list of backend routes (in the team drive) which are planned to be setup. There are some routes in that list which are stretch goals (i.e. route highlighting file). In the future in addition to setting up these planned routes the backend needs to be integrated with the frontend and the backend needs to be setup on the server. 

### Cody Benkoski
Overall this semester I spent a lot of time on getting our tileservers and doing a lot of behind the scenes devops work. Despite taking a bit of time, it was a great learning experience to stand everything up from nothing. Currently, we have a few VCLs to handle expiring tiles, along with handling some relatively static routes. 

Outside of dev ops work, I spent the rest of my time optimizing the front end. This proved to be a pretty big challenge, since we have roughly ~1000 stops/buses on the map at a time. To remedy this, I moved to using Canvas markers on the map, which are much more efficient in rendering. Additionally, I fixed a nasty memory bug which would cause the map to lock up and freeze after about an hour. Outside of optimization, I was able to include a much requested feature from people -- the ability to find the nearest bus stop based on your location. Moving forward, I intend to make use of JS workers to handle any location/distance calculations. 

## Summary
