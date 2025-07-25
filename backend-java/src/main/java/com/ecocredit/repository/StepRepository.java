package com.ecocredit.repository;

import com.ecocredit.model.Step;
import com.ecocredit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StepRepository extends JpaRepository<Step, Long> {
    
    // Find steps by user
    List<Step> findByUserOrderByDateDesc(User user);
    
    // Find step by user and date
    Optional<Step> findByUserAndDate(User user, LocalDate date);
    
    // Get total steps for user
    @Query("SELECT COALESCE(SUM(s.steps), 0) FROM Step s WHERE s.user = :user")
    Integer getTotalStepsByUser(@Param("user") User user);
    
    // Get steps for a date range
    List<Step> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDate startDate, LocalDate endDate);
} 