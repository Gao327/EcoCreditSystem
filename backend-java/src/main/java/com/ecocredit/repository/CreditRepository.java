package com.ecocredit.repository;

import com.ecocredit.model.Credit;
import com.ecocredit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditRepository extends JpaRepository<Credit, Long> {
    
    // Find all credits for a user
    List<Credit> findByUserOrderByCreatedAtDesc(User user);
    
    // Find credits by user and type
    List<Credit> findByUserAndType(User user, String type);
    
    // Sum credits by user and type (for balance calculation)
    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM Credit c WHERE c.user = :user AND c.type = :type")
    Integer sumCreditsByUserAndType(@Param("user") User user, @Param("type") String type);
    
    // Get total credits earned by user
    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM Credit c WHERE c.user = :user AND c.type = 'earned'")
    Integer getTotalCreditsEarned(@Param("user") User user);
} 