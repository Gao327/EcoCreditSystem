package com.ecocredit.repository;

import com.ecocredit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by email
    Optional<User> findByEmail(String email);
    
    // Find user by Google ID
    Optional<User> findByGoogleId(String googleId);
    
    // Check if user exists by email
    boolean existsByEmail(String email);
    
    // Check if user exists by Google ID
    boolean existsByGoogleId(String googleId);
    
    // Get user stats (equivalent to Node.js profile queries)
    @Query("SELECT " +
           "COALESCE(SUM(s.steps), 0) as totalSteps, " +
           "COUNT(DISTINCT s.date) as daysTracked, " +
           "COALESCE(MAX(s.steps), 0) as maxDailySteps " +
           "FROM Step s WHERE s.user = :user")
    UserStatsProjection getUserStats(@Param("user") User user);
    
    // Interface for stats projection
    interface UserStatsProjection {
        Long getTotalSteps();
        Long getDaysTracked();
        Integer getMaxDailySteps();
    }
} 