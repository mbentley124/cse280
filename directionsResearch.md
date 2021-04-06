Joseph Malisov
CSE 392

# Sources

## https://stackoverflow.com/questions/430142/what-algorithms-compute-directions-from-point-a-to-point-b-on-a-map
Dijstra’s, starting at the 2 ends.

“The main idea is to do preprocessing on the graph once, to speed up all following queries. With this additional information itineraries can be computed very fast. Still, Dijkstra's Algorithm is the basis for all optimisations.”
Maybe I can do preprocessing of major routes?
(Do I do that already?)

## http://algo2.iti.kit.edu/documents/routeplanning/weaOverview.pdf
Multiple ideas on different implementations. Look into further

## https://en.wikipedia.org/wiki/Rapidly-exploring_random_tree
A tree that is formed from nodes being randomly explored. This sounds like something that would work best pre-processed, but I could try both.

# Timeline

### FEB 23 - MARCH 09

DONE:

- organizing research notes
- updated current directions functions to accept input for lehigh OR lanta
- updated current directions functions to return pointers to stop objects instead of strings, so no longer need to convert between stopid and name. (led to deleting 2 functions running in O(n).

TO-DO

- Now I need routes.lanta... once I have that, I believe lanta directions should work.
- walking routes?

### MARCH 09 - MARCH 23

DONE:

- Can now get directions cross-service. Always tranfers at Farrington/New st.
- Formatting data into graph

TO-DO:

- Update html. Only need one button and cross-service output needs to be formatted correctly

### MARCH 23 - APRIL 6

DONE:

- Update html to understand transfers
- Timed first algorithm [NOTE: this includes html rendering] (Lehigh-only stops: ~3.7 millisec; Lanta-only stops millisec: ~3.7; Cross-platform: 12.7 millisec)
- Continued to work on putting data into graph format

TODO: 

- Finish putting data into graph format
- Begin next algorithm
