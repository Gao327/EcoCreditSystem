package com.ecocredit.repository;

import com.ecocredit.model.Achievement;
import com.ecocredit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    
    // Find achievements by user
    List<Achievement> findByUserOrderByEarnedAtDesc(User user);
    
    // Check if user has specific achievement type
    boolean existsByUserAndType(User user, String type);
    
    // Count achievements by user
    long countByUser(User user);
    
    // Find achievement by user and type
    Achievement findByUserAndType(User user, String type);
} 