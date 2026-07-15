package com.veloroute.analyzer;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.time.Duration;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class RideProcessingService {

    private final RideRepository rideRepository;
    private final GpsPointRepository gpsPointRepository;
    private final ObjectMapper objectMapper;
    private final JsonFactory jsonFactory;

    // Constant value of the Earth's radius to be used for the Haversine formula
    private static final double EARTH_RADIUS = 6371000;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    public RideProcessingService(RideRepository rideRepository, GpsPointRepository gpsPointRepository, ObjectMapper objectMapper){
        this.rideRepository = rideRepository;
        this.gpsPointRepository = gpsPointRepository;
        this.objectMapper = objectMapper;
        this.jsonFactory = objectMapper.getFactory();
    }

    // Create an initial placeholder record in the database to reserve Activity ID for tracking/polling purposes
    public Ride createPlaceholderRide(String originalFilename) {
        String name = (originalFilename != null) ? originalFilename.replace(".json", "") : "Unnamed Ride";
        Ride ride = new Ride(name);
        return rideRepository.save(ride);
    }

    // Offload processing to a background thread
    @Async
    @Transactional
    public void processFileAsync(Long rideId, byte[] fileBytes) {

        try {
            // Retrieve existing placeholder ride record from database
            Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new IllegalArgumentException("[ERROR]: Ride with ID " + rideId + " not found"));

            List<GpsPoint> entityPoints = new ArrayList<>();
            double totalDistance = 0.0;
            double totalElevationGain = 0.0;
            double maxSpeed = 0.0;
            long totalMovingTime = 0;

            // Keep track of previous coordinates for math calculations
            LocalTime previousTimestamp = null;
            double previousLatitude = 0.0;
            double previousLongitude = 0.0;
            double previousElevation = 0.0;
            boolean hasPrevious = false;

            // Open streaming parse over the byte stream
            try (JsonParser parser = jsonFactory.createParser(new ByteArrayInputStream(fileBytes))) {

                while (parser.nextToken() != null) {
                    JsonToken currentToken = parser.currentToken();

                    if (currentToken == JsonToken.FIELD_NAME) {
                        String fieldName = parser.currentName();
                        // Shift to the field's actual value
                        parser.nextToken();

                        if ("rideName".equals(fieldName) && ride.getName().equals("Unnamed Ride")) {
                            ride.setName(parser.getValueAsString());
                        } else if ("points".equals(fieldName)) {
                            // At the start of the coordiante list, need to parse each element inside the array
                            if (parser.currentToken() == JsonToken.START_ARRAY) {
                                while (parser.nextToken() != JsonToken.END_ARRAY) {

                                    // Make parser bind only the small current node object into a lightweight DTO
                                    RideUploadDto.GpsPointDto currentPoint = objectMapper.readValue(parser, RideUploadDto.GpsPointDto.class);

                                    GpsPoint gpsPoint = new GpsPoint();
                                    LocalTime currentTimeStamp = LocalTime.parse(currentPoint.timestamp(), TIME_FORMATTER);
                                    gpsPoint.setTimestamp(currentTimeStamp);
                                    gpsPoint.setLatitude(currentPoint.latitude());
                                    gpsPoint.setLongitude(currentPoint.longitude());
                                    gpsPoint.setElevation(currentPoint.elevation());
                                    gpsPoint.setRide(ride);

                                    entityPoints.add(gpsPoint);

                                    // Running math calculations
                                    if (hasPrevious) {
                                        double segmentDistance = calculateHaversineDistance(previousLatitude, previousLongitude,
                                                currentPoint.latitude(), currentPoint.longitude());
                                        totalDistance += segmentDistance;

                                        double elevationDifference = currentPoint.elevation() - previousElevation;
                                        if (elevationDifference > 0) {
                                            totalElevationGain += elevationDifference;
                                        }

                                        long segmentSeconds = Duration.between(previousTimestamp, currentTimeStamp).getSeconds();
                                        if (segmentSeconds > 0) {
                                            totalMovingTime += segmentSeconds;
                                            double segmentSpeed = segmentDistance / segmentSeconds;

                                            if (segmentSpeed > maxSpeed) {
                                                maxSpeed = segmentSpeed;
                                            }
                                        }
                                    }

                                    // Moving current node data into state to prepare for next interation
                                    previousTimestamp = currentTimeStamp;
                                    previousLatitude = currentPoint.latitude();
                                    previousLongitude = currentPoint.longitude();
                                    previousElevation = currentPoint.elevation();
                                    hasPrevious = true;

                                }
                            }
                        }
                    }
                }
            }

            // Save GPS point rows
            gpsPointRepository.saveAll(entityPoints);

            // Average Speed
            double averageSpeed = 0.0;
            if (totalMovingTime > 0) {
                averageSpeed = totalDistance / totalMovingTime;
            }

            // Update aggregates and finalize metrics on the saved entity record
            ride.setTotalDistance(Math.round(totalDistance * 100.0) / 100.0);
            ride.setTotalElevationGain(Math.round(totalElevationGain * 100.0) / 100.0);
            ride.setMaxSpeed(Math.round(maxSpeed * 100.0) / 100.0);
            ride.setAvgSpeed(Math.round(averageSpeed * 100.0) / 100.0);
            ride.setMovingTime(totalMovingTime);

            rideRepository.save(ride);
            System.out.println("[SUCCESS]: Finished background pipeline calculations for Ride ID: " + rideId);

        } catch (Exception e) {
            System.out.println("[ERROR]: Failed to process ride with ID " + rideId + "--> " + e.getMessage());
            e.printStackTrace();
        }
    }

    private double calculateHaversineDistance(double latitude1, double longitude1, double latitude2, double longitude2) {
        double deltaLatitude = Math.toRadians(latitude2 - latitude1);
        double deltaLongitude = Math.toRadians(longitude2 - longitude1);

        double a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
                Math.cos(Math.toRadians(latitude1)) * Math.cos(Math.toRadians(latitude2)) *
                Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    public java.util.Optional<Ride> getRideById(Long id){
        return rideRepository.findById(id);
    }

}
