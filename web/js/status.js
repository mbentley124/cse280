service_status = {"tileserver":false, "routeserver":false};
const ez_error = function (xhr, textStatus, errorThrown) {
	console.error(textStatus);
}


function populate_true(service) {
	service_status[service] = true;
}

function check_tileserver() {
	$.ajax({
	  url: "https://tiles.codyben.me",
	  success: function() {
	  	populate_true('tileserver');
	  },
	  error: ez_error,
	});
}

function check_routeserver() {
	$.ajax({
	  url: "https://routeserver.codyben.me/route/v1/driving/-75.374375,40.607656;-75.375347,40.603158",
	  success: function() {
	  	populate_true('tileserver');
	  },
	  error: ez_error,
	});
}

function check_all() {
	
	$.each(service_status, function(k,v) {
	if(!v) {
		console.warn("Service "+k+" appears to be down.");
	}
});
}

check_routeserver();
check_tileserver();
