# Progress Report 10

## Summary of Work Completed
- Used CSS styling to eliminate a redundant tile layer.
- Configured NGINX to proxy requests to new backend.
- Connected the Java backend to the database.
- Took first steps on determining a route.
  - Wrote SQL query to group all stops by a common route_id.

### Goals completed this week
- Added css overlay for dark mode instead of loading new tiles
- Created initial sql query for route determination

### Goals not met this week
- menubar not finished

### Challenges faced this week


### Goals for next week
- Work on UX for front end.
- Figure out a way to move bus data from database to front-end efficiently.
- Finish route determination for backend.
- Start determining plans for backend routes.

## Individual Member Contributions

For each group member, list the individual contributions, and a link to proof in the form of a commit to your group repository. At the end, provide an estimate for how many hours these contributions took to complete.

### Michael Bentley
- Connected backend to database from remote machine [proof](https://github.com/mbentley124/cse280/commit/82ad24caa6d3db187c328fcfc35117656f097ba4)
- Created initial sql query to determine routes programmaticaly. Minor bugs with it still [proof](https://github.com/mbentley124/cse280/commit/801382f7a4630b857b5073d1c5b05cc07bfa2ce5)

Estimated time allocated this week: 3.5 hours.

### Cody Benkoski
- Did research on best way to render all points on the map.
- Modified Varnish to almost indefinitely cache a tile layer.
  - Planning on using CSS to stile the dark mode tiles instead of relying on a seperate raster.
  - Around a 30% decrease in time-to-first-byte.
  - Better CSS dark mode transition.
- Beginning of a front-end way to check status of required services.
- Setup NGINX to allow connections to the new backend.

Estimated time allocated this week: 5.

### Hansen Lukman
- Cleaned up User Interface.
- Fixed overlapping menu and map.
- Added responsiveness based on window size.

Estimated time allocated this week: 3 hours.

### Joe Malisov
- Work on user-interface (mostly menu-bar)
- look into "purecss" and tring to features to app.
Estimated time allocated this week: 1.5.
