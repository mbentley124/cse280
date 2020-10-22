SELECT *, insertion_time - last_insert_time as DURATION
FROM (
	SELECT *, 
    LAG(latitude, 1) OVER w AS last_lat,
    LAG(longitude, 1) OVER w AS last_long,
    LAG(insertion_time, 1) OVER w AS last_insert_time
	FROM transient_bus
	WHERE bus_service = "Lehigh"
	-- AND insertion_time > now() - interval 20 day
    WINDOW w AS (PARTITION BY bus_id, route_id ORDER BY insertion_time)
) s
