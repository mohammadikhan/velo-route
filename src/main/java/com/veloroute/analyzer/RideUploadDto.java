package com.veloroute.analyzer;

import java.util.List;

public record RideUploadDto(String rideName, List<GpsPointDto> points) {

    public record GpsPointDto(
            String timestamp,
            double latitude,
            double longitude,
            double elevation
    ) {}
}
