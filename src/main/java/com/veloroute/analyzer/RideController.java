package com.veloroute.analyzer;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideProcessingService rideProcessingService;

    public RideController(RideProcessingService rideProcessingService) {
        this.rideProcessingService = rideProcessingService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadRideFile(@RequestParam("file") MultipartFile file){

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("[ERROR]: Please upload a valid JSON Ride File");
        }

        try {
            // Create a placeholder ride entry to reserve Activity ID
            Ride placeholderRide = rideProcessingService.createPlaceholderRide(file.getOriginalFilename());

            // Offloading the heavy file bytes and math to a background thread
            // Pass the bytes because MultipartFile objects can expire aafter the HTTP request
            byte[] fileBytes = file.getBytes();
            rideProcessingService.processFileAsync(placeholderRide.getId(), fileBytes);

            // Immediately return HTTP 202 Accepted with the tracking details
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("status", "Processing started...");
            response.put("activityId", placeholderRide.getId());
            response.put("message", "Ride file being processed asynchronously in the background");

            return ResponseEntity.accepted().body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("[ERROR]: Background processing could not be initiated: " + e.getMessage());
        }
    }

    @GetMapping("")
    public ResponseEntity<List<Ride>> getAllRides() {
        return ResponseEntity.ok(rideProcessingService.getAllRides());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRideById(@PathVariable Long id) {
        return rideProcessingService.getRideById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("[ERROR]: Ride with ID: " + id + " was not found."));
    }
}