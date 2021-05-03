# Set the source directory
srclib = src/lib/
srcalgo = src/algorithms/
# Create the list of modules
core = ${srclib}graph.js
modules = ${srcalgo}traversal.js\
		  ${srcalgo}heap.js\
		  ${srcalgo}minPriorityQueue.js\
		  ${srcalgo}shortest_path.js\
		  ${srcalgo}msp.js		  		
# Build full list of files
files = ${core} ${modules}

all: build/graph.js
build/graph.js: ${files}
	cat > $@ $^
