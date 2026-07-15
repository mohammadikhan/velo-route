package com.veloroute.analyzer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GpsPointRepository extends JpaRepository<GpsPoint, Long> {
}
