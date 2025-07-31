package com.ecocredit.repository;

import com.ecocredit.model.RewardCatalog;
import com.ecocredit.model.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RewardCatalogRepository extends JpaRepository<RewardCatalog, Long> {
    
    // Find available rewards
    @Query("SELECT r FROM RewardCatalog r WHERE r.isAvailable = true " +
           "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
           "AND (r.validUntil IS NULL OR r.validUntil >= :now) " +
           "AND (r.unlimitedStock = true OR r.stockQuantity > 0)")
    List<RewardCatalog> findAvailableRewards(@Param("now") LocalDateTime now);
    
    // Find featured rewards
    @Query("SELECT r FROM RewardCatalog r WHERE r.isAvailable = true " +
           "AND r.isFeatured = true " +
           "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
           "AND (r.validUntil IS NULL OR r.validUntil >= :now) " +
           "AND (r.unlimitedStock = true OR r.stockQuantity > 0)")
    List<RewardCatalog> findFeaturedRewards(@Param("now") LocalDateTime now);
    
    // Find rewards by partner
    List<RewardCatalog> findByPartnerAndIsAvailableTrue(Partner partner);
    
    // Find rewards by category
    @Query("SELECT r FROM RewardCatalog r WHERE r.category = :category " +
           "AND r.isAvailable = true " +
           "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
           "AND (r.validUntil IS NULL OR r.validUntil >= :now) " +
           "AND (r.unlimitedStock = true OR r.stockQuantity > 0)")
    List<RewardCatalog> findByCategoryAndAvailable(@Param("category") String category, @Param("now") LocalDateTime now);
    
    // Find rewards within credit range
    @Query("SELECT r FROM RewardCatalog r WHERE r.creditCost <= :maxCredits " +
           "AND r.isAvailable = true " +
           "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
           "AND (r.validUntil IS NULL OR r.validUntil >= :now) " +
           "AND (r.unlimitedStock = true OR r.stockQuantity > 0)")
    List<RewardCatalog> findAffordableRewards(@Param("maxCredits") Integer maxCredits, @Param("now") LocalDateTime now);
    
    // Get all available categories
    @Query("SELECT DISTINCT r.category FROM RewardCatalog r WHERE r.isAvailable = true AND r.category IS NOT NULL")
    List<String> findDistinctCategories();
    
    // Find rewards by partner ID
    List<RewardCatalog> findByPartnerIdAndIsAvailableTrue(Long partnerId);
    
    // Find cheapest rewards (for recommendations)
    @Query("SELECT r FROM RewardCatalog r WHERE r.isAvailable = true " +
           "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
           "AND (r.validUntil IS NULL OR r.validUntil >= :now) " +
           "AND (r.unlimitedStock = true OR r.stockQuantity > 0) " +
           "ORDER BY r.creditCost ASC")
    List<RewardCatalog> findCheapestRewards(@Param("now") LocalDateTime now);
    
    // Find most popular rewards (by redemption count)
    @Query("SELECT r FROM RewardCatalog r " +
           "LEFT JOIN r.redemptions redemption " +
           "WHERE r.isAvailable = true " +
           "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
           "AND (r.validUntil IS NULL OR r.validUntil >= :now) " +
           "AND (r.unlimitedStock = true OR r.stockQuantity > 0) " +
           "GROUP BY r " +
           "ORDER BY COUNT(redemption) DESC")
    List<RewardCatalog> findMostPopularRewards(@Param("now") LocalDateTime now);
    
    // Count available rewards
    @Query("SELECT COUNT(r) FROM RewardCatalog r WHERE r.isAvailable = true " +
           "AND (r.validFrom IS NULL OR r.validFrom <= :now) " +
           "AND (r.validUntil IS NULL OR r.validUntil >= :now) " +
           "AND (r.unlimitedStock = true OR r.stockQuantity > 0)")
    long countAvailableRewards(@Param("now") LocalDateTime now);
    
    // Find expiring soon rewards
    @Query("SELECT r FROM RewardCatalog r WHERE r.isAvailable = true " +
           "AND r.validUntil IS NOT NULL " +
           "AND r.validUntil BETWEEN :now AND :expiryThreshold " +
           "AND (r.unlimitedStock = true OR r.stockQuantity > 0)")
    List<RewardCatalog> findExpiringSoonRewards(@Param("now") LocalDateTime now, 
                                              @Param("expiryThreshold") LocalDateTime expiryThreshold);
} 