package com.veloroute.analyzer;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "gps_points")
public class GpsPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalTime timestamp;
    private double latitude;
    private double longitude;
    private double elevation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id")
    @JsonIgnore
    private Ride ride;

    public GpsPoint() {

    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalTime timestamp) { this.timestamp = timestamp; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public double getElevation() { return elevation; }
    public void setElevation(double elevation) { this.elevation = elevation; }

    public Ride getRide() { return ride; }
    public void setRide(Ride ride) { this.ride = ride; }
}
