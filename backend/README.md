# Backend

Sets up the routes the frontend uses to query the sql table containing the bus data. 

## Running the Backend

Run ssh forwarding shell script so jdbc can access the mysql table. This should run in the background continuously. 

    ./ssh_forwarding

Run following commands to build code and start server:

    mvn compile
    mvn exec:java

The server should now be running and can be accessed through localhost:4567

## TODO List

1. Finalize plan for the routes on the backend (Previously used [this spreadsheet](https://docs.google.com/spreadsheets/d/17lR5FlTsYbo87M1uTOx2IZoOEFg6FXfB-inhyK-SEQY/edit#gid=0) but it needs to be updated now that the bus data source is different)
2. Implement planned backend routes
3. Determine how to go about predicting bus arrival times
4. Implement bus arrival time prediction method (need to wait until enough data in table)
5. Setup backend on the machine that will host the rest of the website
