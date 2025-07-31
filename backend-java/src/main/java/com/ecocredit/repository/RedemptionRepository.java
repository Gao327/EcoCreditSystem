package com.ecocredit.repository;

import com.ecocredit.model.Redemption;
import com.ecocredit.model.User;
import com.ecocredit.model.RewardCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RedemptionRepository extends JpaRepository<Redemption, Long> {
    
    // Find user's redemptions
    List<Redemption> findByUserOrderByRedeemedAtDesc(User user);
    
    // Find user's redemptions by status
    List<Redemption> findByUserAndStatusOrderByRedeemedAtDesc(User user, Redemption.RedemptionStatus status);
    
    // Find active redemptions for user
    @Query("SELECT r FROM Redemption r WHERE r.user = :user " +
           "AND r.status = 'COMPLETED' " +
           "AND (r.expiryDate IS NULL OR r.expiryDate > :now) " +
           "ORDER BY r.redeemedAt DESC")
    List<Redemption> findActiveRedemptionsByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    // Find user's daily redemptions count for a specific reward
    @Query("SELECT COUNT(r) FROM Redemption r WHERE r.user = :user " +
           "AND r.reward = :reward " +
           "AND DATE(r.redeemedAt) = :date")
    long countUserDailyRedemptions(@Param("user") User user, 
                                 @Param("reward") RewardCatalog reward, 
                                 @Param("date") LocalDate date);
    
    // Find user's total redemptions count for a specific reward
    long countByUserAndReward(User user, RewardCatalog reward);
    
    // Find redemptions by reward
    List<Redemption> findByRewardOrderByRedeemedAtDesc(RewardCatalog reward);
    
    // Find redemptions by voucher code
    Optional<Redemption> findByVoucherCode(String voucherCode);
    
    // Find expiring redemptions
    @Query("SELECT r FROM Redemption r WHERE r.status = 'COMPLETED' " +
           "AND r.expiryDate IS NOT NULL " +
           "AND r.expiryDate BETWEEN :now AND :expiryThreshold")
    List<Redemption> findExpiringRedemptions(@Param("now") LocalDateTime now, 
                                           @Param("expiryThreshold") LocalDateTime expiryThreshold);
    
    // Find redemptions that need processing
    List<Redemption> findByStatusOrderByRedeemedAtAsc(Redemption.RedemptionStatus status);
    
    // Get user's total redeemed credits
    @Query("SELECT COALESCE(SUM(r.creditCost), 0) FROM Redemption r WHERE r.user = :user")
    Integer getTotalRedeemedCreditsByUser(@Param("user") User user);
    
    // Get user's redemption statistics
    @Query("SELECT " +
           "COUNT(r) as totalRedemptions, " +
           "COALESCE(SUM(r.creditCost), 0) as totalCreditsSpent, " +
           "COUNT(CASE WHEN r.status = 'COMPLETED' THEN 1 END) as successfulRedemptions, " +
           "COUNT(CASE WHEN r.status = 'USED' THEN 1 END) as usedRedemptions " +
           "FROM Redemption r WHERE r.user = :user")
    UserRedemptionStats getUserRedemptionStats(@Param("user") User user);
    
    // Find most popular rewards (by redemption count)
    @Query("SELECT r.reward, COUNT(r) as redemptionCount FROM Redemption r " +
           "WHERE r.redeemedAt >= :startDate " +
           "GROUP BY r.reward " +
           "ORDER BY COUNT(r) DESC")
    List<Object[]> findMostPopularRewards(@Param("startDate") LocalDateTime startDate);
    
    // Find redemptions by date range
    @Query("SELECT r FROM Redemption r WHERE r.redeemedAt BETWEEN :startDate AND :endDate " +
           "ORDER BY r.redeemedAt DESC")
    List<Redemption> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);
    
    // Count redemptions by status
    long countByStatus(Redemption.RedemptionStatus status);
    
    // Find recent redemptions for user (last 30 days)
    @Query("SELECT r FROM Redemption r WHERE r.user = :user " +
           "AND r.redeemedAt >= :thirtyDaysAgo " +
           "ORDER BY r.redeemedAt DESC")
    List<Redemption> findRecentRedemptions(@Param("user") User user, 
                                         @Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    // Interface for user redemption statistics projection
    interface UserRedemptionStats {
        Long getTotalRedemptions();
        Integer getTotalCreditsSpent();
        Long getSuccessfulRedemptions();
        Long getUsedRedemptions();
    }
} 