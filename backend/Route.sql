-- This is way overly complicated. Also won't currently work if a stop is visited twice in one route i.e. Goodman.
-- Also currently doesn't take into account that the route has to take place the previous day. 
-- Also vehicle_id is arbitrary right now (so is route_id)

-- SELECT route_id, vehicle_id, current_stop, retrieved, latitude, longitude
-- FROM (SELECT *
-- 	FROM lehighbusdata as main
	-- WHERE current_stop IS NOT NULL 
-- 	AND current_stop != "NULL" 
-- 	AND latitude IS NOT NULL 
-- 	AND longitude IS NOT NULL
--     AND vehicle_id = 35
--     AND NOT EXISTS (SELECT * 
-- 				FROM lehighbusdata as comp
--                 WHERE comp.retrieved < main.retrieved
--                 AND comp.vehicle_id = main.vehicle_id
--                 AND comp.current_stop = main.current_stop)) as final
-- WHERE route_id = 13
-- ORDER BY retrieved

-- SELECT * FROM lehighbusdata WHERE retrieved > '2020-03-06' AND retrieved < '2020-03-07' AND current_stop IS NOT NULL AND current_stop != "NULL" AND route_id = 13;

-- SELECT * 
-- FROM (SELECT route_id, last_stop, name, vehicle_id, current_stop, retrieved, latitude, longitude, LAST_VALUE(current_stop) OVER (ORDER BY retrieved ROWS BETWEEN 0 PRECEDING AND 1 FOLLOWING) as previous_current, LAST_VALUE(last_stop) OVER (ORDER BY retrieved ROWS BETWEEN 0 PRECEDING AND 1 FOLLOWING) as previous_last
-- 	  FROM lehighbusdata
-- 	  WHERE (current_stop IS NOT NULL 
-- 	  AND current_stop != "NULL")
--       OR (last_stop IS NOT NULL
--       AND last_stop != "NULL")
-- 	  AND latitude IS NOT NULL 
-- 	  AND longitude IS NOT NULL
-- 	  AND retrieved > '2020-03-06' 
-- 	  AND retrieved < '2020-03-07'
-- 	  AND route_id = 13
-- 	  AND vehicle_id = 35) as bus
-- WHERE (previous_current IS NOT NULL
-- AND (current_stop IS NOT NULL
-- AND previous_current != current_stop)
-- OR (last_stop IS NOT NULL
-- AND previous_current != last_stop))
-- OR (previous_last IS NOT NULL
-- AND (current_stop IS NOT NULL
-- AND previous_last != current_stop)
-- OR (last_stop IS NOT NULL
-- AND previous_last != last_stop))

SELECT *
FROM (SELECT *, LAST_VALUE(stop) OVER w AS next
FROM (SELECT name, vehicle_id, retrieved, latitude, longitude, IF(current_stop IS NULL OR current_stop = "NULL", last_stop, current_stop) as stop
FROM lehighbusdata
WHERE longitude IS NOT NULL
AND latitude IS NOT NULL
AND retrieved > '2020-03-20' AND retrieved < '2020-04-02' AND route_id = 13 AND vehicle_id = 28) as t1
WINDOW w AS (ORDER BY retrieved ROWS BETWEEN 0 PRECEDING AND 1 FOLLOWING)) as t2
WHERE next != stop
ORDER BY retrieved;

-- SELECT * FROM lehighbusdata WHERE vehicle_id = 33 AND name = "Campus Connector" ORDER BY retrieved;

-- SELECT * 
-- FROM (SELECT current_stop, route_id, vehicle_id, retrieved, latitude, longitude, LAST_VALUE(current_stop) OVER (ORDER BY retrieved ROWS BETWEEN 0 PRECEDING AND 1 FOLLOWING) as previous 
-- 	  FROM lehighbusdata 
--       WHERE current_stop IS NOT NULL 
--       AND current_stop != "NULL" 
--       AND latitude IS NOT NULL 
--       AND longitude IS NOT NULL 
--       AND retrieved > '2020-03-5' AND retrieved < '2020-03-6' AND route_id = 13 AND vehicle_id = 35) as bus


-- SELECT * 
-- FROM lehighbusdata as b1
-- WHERE NOT EXISTS (SELECT * 
-- 				  FROM (SELECT * 
-- 					    FROM lehighbusdata as b2
--                         WHERE b1.retrieved > b2.retrieved
--                         AND current_stop IS NOT NULL 
-- 						AND current_stop != "NULL" 
-- 						AND latitude IS NOT NULL 
-- 						AND longitude IS NOT NULL
--                         AND retrieved > '2020-03-06'
-- 						AND retrieved < '2020-03-07'
-- 						AND route_id = 13
-- 						ORDER BY b2.retrieved
--                         LIMIT 1) as previous
-- 				  WHERE b1.current_stop = previous.current_stop)
-- AND current_stop IS NOT NULL 
-- AND current_stop != "NULL" 
-- AND latitude IS NOT NULL 
-- AND longitude IS NOT NULL
-- AND retrieved > '2020-03-06' 
-- AND retrieved < '2020-03-07'
-- AND route_id = 13;