-- This is way overly complicated. Also won't currently work if a stop is visited twice in one route i.e. Goodman.
-- Also currently doesn't take into account that the route has to take place the previous day. 
-- Also vehicle_id is arbitrary right now (so is route_id)
SELECT route_id, vehicle_id, current_stop, retrieved, latitude, longitude
FROM (SELECT *
	FROM lehighbusdata as main
    WHERE current_stop IS NOT NULL 
	AND current_stop != "NULL" 
	AND latitude IS NOT NULL 
	AND longitude IS NOT NULL
    AND vehicle_id = 35
    AND NOT EXISTS (SELECT * 
				FROM lehighbusdata as comp
                WHERE comp.retrieved < main.retrieved
                AND comp.vehicle_id = main.vehicle_id
                AND comp.current_stop = main.current_stop)) as final
WHERE route_id = 13
ORDER BY retrieved