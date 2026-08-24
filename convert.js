const fs = require("fs")
const path = require("path")

const inputFile = process.argv[2]

if (!inputFile) {
  console.error("Usage: node convert.js <file.gpx>")
  process.exit(1)
}

// Store content of .gpx file and name
const content = fs.readFileSync(inputFile, "utf8")
const rideName = path.basename(inputFile, ".gpx")

// Extracting track points from gpx
const trackPointRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/g

// Extracting elevation inside track point
const elevationRegex = /<ele>([^<]+)<\/ele>/

// Extracting timestamp inside track point
const timeRegex = /<time>([^<]+)<\/time>/


const rawPoints = []
let match

while ((match = trackPointRegex.exec(content)) !== null) {
  const latitude = parseFloat(match[1])
  const longitude = parseFloat(match[2])
  const inner = match[3]
  const elevationMatch = elevationRegex.exec(inner)
  const timeMatch = timeRegex.exec(inner)

  rawPoints.push({
    latitude: latitude,
    longitude: longitude,
    elevation: elevationMatch ? parseFloat(elevationMatch[1]) : 0,
    isoTime: timeMatch ? timeMatch[1] : null,
  })
}

const haversine = (latitude1, longitude1, latitude2, longitude2) => {
  const RADIUS = 6371000
  const deltaLatitude = (latitude2 - latitude1) * Math.PI / 180
  const deltaLongitude = (longitude2 - longitude1) * Math.PI / 180
  const a = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(latitude1 * Math.PI / 180) * Math.cos(latitude2 * Math.PI / 180) * Math.sin(deltaLongitude / 2) ** 2
  return RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const formatTime = (totalSeconds) => {
  const hour = Math.floor(totalSeconds / 3600)
  const minute = Math.floor((totalSeconds % 3600) / 60)
  const second = Math.floor(totalSeconds % 60)
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`
}

// If real timestamps exist, we can use them, otherwise we generate them based on a 20 km/h average
const hasTimeStamps = rawPoints.every(p => p.isoTime !== null)
const startSeconds = 8 * 3600
const averageSpeedMs = 20 / 3.6

const points = rawPoints.map((p, i) => {
  let timeStamp

  if (hasTimeStamps) {
    const date = new Date(p.isoTime)
    timeStamp = date.toTimeString().slice(0, 8)
  } else {
    if (i === 0) {
      timeStamp = formatTime(startSeconds)
    } else {
      const distance = haversine(rawPoints[i - 1].latitude, rawPoints[i - 1].longitude, p.latitude, p.longitude)
      const elapsed = distance / averageSpeedMs
      const prevSeconds = rawPoints[i - 1]._seconds
      p._seconds = prevSeconds + elapsed
      timeStamp = formatTime(startSeconds + p._seconds)
    }
    if (i === 0) rawPoints[0]._seconds = 0
  }

  return { timestamp: timeStamp, latitude: p.latitude, longitude: p.longitude, elevation: p.elevation}
})

const output = { rideName, points}
const outputFile = path.join(path.dirname(inputFile), path.basename(inputFile, ".gpx") + ".json")
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2))
console.log(`[SUCCESS]: ${points.length} points written to ${outputFile}`)
