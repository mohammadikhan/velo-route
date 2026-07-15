package com.veloroute.analyzer;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double totalDistance;
    private double totalElevationGain;
    private double maxSpeed;
    private double avgSpeed;
    private long movingTime;
    private LocalDateTime uploadDateTime;

    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<GpsPoint> gpsPoints = new ArrayList<>();

    public Ride() {

    }

    public Ride(String name){
        this.name = name;
        this.uploadDateTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getTotalDistance() { return totalDistance; }
    public void setTotalDistance(double totalDistance) { this.totalDistance = totalDistance; }

    public double getTotalElevationGain() { return totalElevationGain; }
    public void setTotalElevationGain(double totalElevationGain) { this.totalElevationGain = totalElevationGain; }

    public double getMaxSpeed() { return maxSpeed; }
    public void setMaxSpeed(double maxSpeed) { this.maxSpeed = maxSpeed; }

    public double getAvgSpeed() { return avgSpeed; }
    public void setAvgSpeed(double avgSpeed) { this.avgSpeed = avgSpeed; }

    public long getMovingTime() { return movingTime; }
    public void setMovingTime(long movingTime) { this.movingTime = movingTime; }

    public LocalDateTime getUploadDateTime() { return uploadDateTime; }
    public void setUploadDateTime(LocalDateTime uploadDateTime) { this.uploadDateTime = uploadDateTime; }

    public List<GpsPoint> getGpsPoints() { return gpsPoints; }
    public void setGpsPoints(List<GpsPoint> gpsPoints) { this.gpsPoints = gpsPoints; }

}
