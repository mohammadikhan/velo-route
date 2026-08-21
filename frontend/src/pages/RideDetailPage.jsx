import MetricCard from "../components/MetricCard.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {getRideByID} from "../api/rideApi.js";
import {useEffect, useMemo, useState} from "react";
import RouteMap from "../components/RouteMap.jsx";

// Helper to parse to seconds since JavaScripts built-in new Date() can't parse either the array formate or string
// formats (these are the formats Jackson serializes to the frontend)
const parseTimeToSeconds = (ts) => {

  if (!ts) return null

  if (Array.isArray(ts)) {
    return ts[0] * 3600 + ts[1] * 60 + (ts[2] || 0)
  }

  if (typeof ts === "string") {
    const [h, m, s] = ts.split(":")
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s || 0)
  }

  return null
}

// Helper to calculate haversine formula in real time. While final value is calculated in the backend
// to update this value in real time for each point on the route, we calculate the distance each time
const haversine = (latitude1, longitude1, latitude2, longitude2) => {
  const RADIUS = 6371000
  const toRad = d => d * Math.PI / 180
  const latitude1Rad = toRad(latitude1)
  const latitude2Rad = toRad(latitude2)

  const deltaLatitude = toRad(latitude2 - latitude1)
  const deltaLongitude = toRad(longitude2 - longitude1)

  const a = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(latitude1Rad) * Math.cos(latitude2Rad) * Math.sin(deltaLongitude / 2) ** 2

  return RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

}

// Helper function to format the parsed seconds to the string: "00:00:00"
const formatTime = (seconds) => {

  const hour = Math.floor(seconds / 3600)
  const minute = Math.floor((seconds % 3600) / 60)
  const second = seconds % 60

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`

}

const RideDetailPage = () => {

  const { id } = useParams()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    getRideByID(id)
        .then(setRide)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
  }, [id])

  // Pre-compute cumulative metrics at each GPS point so we can look them up instantly during the visualization
  const cumulative = useMemo(() => {
    if (!ride) return null

    const points = ride.gpsPoints
    const distance = [0]
    const elevationGain = [0]
    const movingTime = [0]
    const maxSpeed = [0]

    for (let i = 1; i < points.length; i++) {
      const d = haversine(points[i - 1].latitude, points[i - 1].longitude, points[i].latitude, points[i].longitude)
      const t1 = parseTimeToSeconds(points[i - 1].timestamp)
      const t2 = parseTimeToSeconds(points[i].timestamp)
      const td = t1 != null && t2 != null ? t2 - t1 : 0
      const speed = td > 0 ? d / td : 0
      const elev = points[i].elevation != null && points[i - 1].elevation != null ? Math.max(0, points[i].elevation - points[i - 1].elevation) : 0

      distance.push(distance[i - 1] + d)
      elevationGain.push(elevationGain[i - 1] + elev)
      movingTime.push(movingTime[i - 1] + (td > 0 ? td : 0))
      maxSpeed.push(Math.max(maxSpeed[i - 1], speed))

    }

    return { distance, elevationGain, movingTime, maxSpeed}
    }, [ride])

  if (loading) {
    return <p style={{padding: "32px"}}>Loading Ride...</p>
  }

  if (error) {
    return <p style={{padding: "32px", color: "#df0d0d"}}>Error: {error}</p>
  }

  const live = currentIndex > 0 && cumulative
  const metrics = {
    distance: live ? cumulative.distance[currentIndex] : ride.totalDistance,
    elevationGain: live ? cumulative.elevationGain[currentIndex] : ride.totalElevationGain,
    avgSpeed: live ? (cumulative.movingTime[currentIndex] > 0 ? cumulative.distance[currentIndex] / cumulative.movingTime[currentIndex]: 0) : ride.avgSpeed,
    maxSpeed: live ? cumulative.maxSpeed[currentIndex] : ride.maxSpeed,
    movingTime: live ? Math.round(cumulative.movingTime[currentIndex]) : ride.movingTime
  }

  return (

      <>
        <div style={{ position: "fixed", inset: 0, display: "flex"}}>

          {/*Home Button*/}
          <button onClick={() => navigate("/")} style={{position: "absolute", top: "24px", left: "24px", padding: "10px 24px",
            backgroundColor: "var(--text-h)", color: "#3c1313", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 500, fontFamily: "monospace", cursor: "pointer", zIndex: 10}}>
            Home
          </button>

          {/*All Rides Button*/}
          <button onClick={() => navigate("/all-rides")} style={{position: "absolute", top: "24px", right: "24px", padding: "10px 24px",
            backgroundColor: "var(--text-h)", color: "#3c1313", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 500, fontFamily: "monospace", cursor: "pointer", zIndex: 10}}>
            All Rides
          </button>

          {/*Left Side showing Ride Details and Metrics retrieved from backend*/}
          <div style={{ flex: 1, padding: "48px", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h1 style={{margin: "0 0 30px", textAlign: "center"}}>{ride.name}</h1>
            <p style={{margin: "0 0 100px", fontSize: "16px", color: "#FFFFFF", textAlign: "center"}}>
              {new Date(ride.uploadDateTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric"})}
            </p>

            {/*Add Metric Cards*/}
            <div style={{width: "80%", display: "flex", flexDirection: "column", gap: "12px"}}>
              <div style={{display: "flex", gap: "12px"}}>
                <MetricCard style={{ flex: 1}} label="Distance" value={(metrics.distance / 1000).toFixed(2)} unit={"km"}/>
                <MetricCard style={{ flex: 1}} label="Elevation Gain" value={(metrics.elevationGain).toFixed(1)} unit={"m"}/>
                <MetricCard style={{ flex: 1}} label="Avg. Speed" value={(metrics.avgSpeed * 3.6).toFixed(1)} unit={"km/h"}/>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center"}}>
                <MetricCard style={{ width: "calc((100% - 24px) / 3)"}} label={"Max Speed"} value={(metrics.maxSpeed * 3.6).toFixed(1)} unit={"km/h"}/>
                <MetricCard style={{ width: "calc((100% - 24px) / 3)"}} label={"Moving Time"} value={formatTime(metrics.movingTime)} unit={""}/>

              </div>
            </div>

            {/* Biking gif */}
            <img src="/biking.gif" alt="biking" style={{ width: "200px", marginTop: "48px", opacity: 0.85 }} />

          </div>

          {/*Create a divider to split the metrics on one side and the map on the other*/}
          <div style={{width: "1px", backgroundColor: "#FFFFFF", flexShrink: 0}}/>

          {/*Add Map to the right side*/}
          <div style={{flex: 1, padding: "48px", display: "flex", flexDirection: "column", alignItems: "center"}}>

            <h1 style={{margin: "0 0 60px", textAlign: "center"}}>Route Visualizer</h1>

            <div style={{width: "100%"}}>
              <RouteMap gpsPoints={ride.gpsPoints} onIndexChange={setCurrentIndex} mapHeight="calc(100vh - 300px)"/>
            </div>

          </div>

        </div>
      </>
  )
}

export default RideDetailPage;
