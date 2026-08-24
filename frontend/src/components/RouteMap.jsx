import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Add Bike Icon to map to show where we are
const bikeIcon = L.divIcon({
  html: '<img src="/biking.gif" style="width: 48px; height: 48px;" />',
  className: "",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

const AdjustMap = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    if (coords.length > 0) map.fitBounds(coords)
  }, [map, coords])

  return null
}

const RouteMap = ({ gpsPoints, onIndexChange, mapHeight }) => {
  const coords = gpsPoints.map(p => [p.latitude, p.longitude])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const markerRef = useRef(null)
  const intervalRef = useRef(null)
  const indexRef = useRef(0)

  useEffect( () => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        indexRef.current += 1
        if (indexRef.current >= coords.length) {
          indexRef.current = coords.length - 1
          clearInterval(intervalRef.current)
          setPlaying(false)
        }

        setIndex(indexRef.current)
        onIndexChange?.(indexRef.current)
        if (markerRef.current) {
          markerRef.current.setLatLng(coords[indexRef.current])
        }
      }, 1000 / speed)

    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, speed])

  const handleReset = () => {
    clearInterval(intervalRef.current)
    setPlaying(false)
    indexRef.current = 0
    setIndex(0)
    onIndexChange?.(0)
    if (markerRef.current) markerRef.current.setLatLng(coords[0])
  }

  if (coords.length === 0) {
    return <p style={{color: "#FFFFFF"}}> No GPS data available</p>
  }

  return (
      <>
        <div>

          {/*Create Controls above the map*/}
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px"}}>

            {/*On the left side, add the play and reset button*/}
            <div style={{ display: "flex", gap: "12px"}}>
              <button onClick={() => setPlaying(prev => !prev)}
                      style={{padding: "10px 24px", backgroundColor: "var(--text-h)", color: "#3c1313", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 500, fontFamily: "monospace", cursor: "pointer"}}>

                    {playing ? "Pause" : "Play"}

              </button>

              <button onClick={handleReset}
                      style={{padding: "10px 24px", backgroundColor: "var(--text-h)", color: "#3c1313", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 500, fontFamily: "monospace", cursor: "pointer"}}>

                Reset

              </button>
            </div>

            {/*On the right side, add the speed meter to change the speed of the animation*/}
            <label style={{display: "flex", alignItems: "center", gap: "8px", color: "#FFFFFF", fontSize: "18px"}}>
              Speed: <strong>{speed}x</strong>
              <input
                type="range" min={1} max={10} value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                style={{cursor: "pointer"}}
              />
            </label>
          </div>

          <MapContainer center={coords[0]} zoom={14} style={{height: mapHeight ?? "480px", borderRadius: "8px", border: "1px solid var(--border)"}}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <AdjustMap coords={coords}/>
            <Polyline positions={coords} color="#aa3bff" weight={3}/>
            <Marker position={coords[index]} icon={bikeIcon} ref={markerRef}/>

          </MapContainer>

        </div>
      </>
  )



}

export default RouteMap

