SELECT *, insertion_time - prev_insertion_time AS duration
FROM (
	SELECT *,
	LAG(insertion_time, 1) OVER (PARTITION BY bus_id, route_id ORDER BY insertion_time) AS prev_insertion_time 
	FROM (
		SELECT *, 
		LAG(last_stop, 1) OVER (PARTITION BY bus_id, route_id ORDER BY insertion_time) AS prev_last_stop 
		FROM transient_bus
		WHERE bus_service = "Lehigh"
		-- AND insertion_time > now() - interval 20 day
	) s
	WHERE prev_last_stop != last_stop
) s2
-- WHERE prev_last_stop = "EMRICK&BAGLYSs"
-- AND last_stop = "EMRICK&DEALTREYs";