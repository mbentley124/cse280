# CSE280 Final Report

## Overview
The goal of this project is to integrate the bus tracking system of Lehigh University and LANTA into a single, user friendly system. Additionally, we plan on pursuing a way to link the two systems together and provide a seamless way for students/faculty/staff to transition from one system to another.

## Team member contributions

### Hansen Lukman

### Joseph Malisov

### Michael Bentley

### Cody Benkoski
Overall this semester I spent a lot of time on getting our tileservers and doing a lot of behind the scenes devops work. Despite taking a bit of time, it was a great learning experience to stand everything up from nothing. Currently, we have a few VCLs to handle expiring tiles, along with handling some relatively static routes. 

Outside of dev ops work, I spent the rest of my time optimizing the front end. This proved to be a pretty big challenge, since we have roughly ~1000 stops/buses on the map at a time. To remedy this, I moved to using Canvas markers on the map, which are much more efficient in rendering. Additionally, I fixed a nasty memory bug which would cause the map to lock up and freeze after about an hour. Outside of optimization, I was able to include a much requested feature from people -- the ability to find the nearest bus stop based on your location. Moving forward, I intend to make use of JS workers to handle any location/distance calculations. 

## Summary