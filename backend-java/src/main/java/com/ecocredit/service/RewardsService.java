package com.ecocredit.service;

import com.ecocredit.model.RewardCatalog;
import com.ecocredit.model.Partner;
import com.ecocredit.model.User;
import com.ecocredit.repository.RewardCatalogRepository;
import com.ecocredit.repository.PartnerRepository;
import com.ecocredit.repository.RedemptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class RewardsService {
    
    private final RewardCatalogRepository rewardCatalogRepository;
    private final PartnerRepository partnerRepository;
    private final RedemptionRepository redemptionRepository;
    
    public RewardsService(RewardCatalogRepository rewardCatalogRepository, 
                         PartnerRepository partnerRepository,
                         RedemptionRepository redemptionRepository) {
        this.rewardCatalogRepository = rewardCatalogRepository;
        this.partnerRepository = partnerRepository;
        this.redemptionRepository = redemptionRepository;
    }
    
    /**
     * Get all available rewards for browsing
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getAvailableRewards() {
        return rewardCatalogRepository.findAvailableRewards(LocalDateTime.now());
    }
    
    /**
     * Get featured rewards for homepage
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getFeaturedRewards() {
        return rewardCatalogRepository.findFeaturedRewards(LocalDateTime.now());
    }
    
    /**
     * Get rewards by category
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getRewardsByCategory(String category) {
        return rewardCatalogRepository.findByCategoryAndAvailable(category, LocalDateTime.now());
    }
    
    /**
     * Get rewards that user can afford with their current credits
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getAffordableRewards(User user) {
        Integer userCredits = user.getTotalCredits();
        return rewardCatalogRepository.findAffordableRewards(userCredits, LocalDateTime.now());
    }
    
    /**
     * Get rewards by partner
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getRewardsByPartner(Long partnerId) {
        return rewardCatalogRepository.findByPartnerIdAndIsAvailableTrue(partnerId);
    }
    
    /**
     * Get reward by ID with availability check
     */
    @Transactional(readOnly = true)
    public Optional<RewardCatalog> getAvailableReward(Long rewardId) {
        Optional<RewardCatalog> reward = rewardCatalogRepository.findById(rewardId);
        return reward.filter(r -> r.isCurrentlyAvailable());
    }
    
    /**
     * Check if user can redeem a specific reward
     */
    @Transactional(readOnly = true)
    public RedemptionEligibility checkRedemptionEligibility(User user, Long rewardId) {
        Optional<RewardCatalog> rewardOpt = getAvailableReward(rewardId);
        
        if (rewardOpt.isEmpty()) {
            return new RedemptionEligibility(false, "Reward not found or not available");
        }
        
        RewardCatalog reward = rewardOpt.get();
        
        // Check user's credit balance
        Integer userCredits = user.getTotalCredits();
        if (userCredits < reward.getCreditCost()) {
            return new RedemptionEligibility(false, 
                String.format("Insufficient credits. You have %d, need %d", userCredits, reward.getCreditCost()));
        }
        
        // Check daily limit
        if (reward.getDailyLimit() != null) {
            long todayRedemptions = redemptionRepository.countUserDailyRedemptions(
                user, reward, LocalDate.now());
            if (todayRedemptions >= reward.getDailyLimit()) {
                return new RedemptionEligibility(false, 
                    String.format("Daily limit reached (%d/%d)", todayRedemptions, reward.getDailyLimit()));
            }
        }
        
        // Check total limit
        if (reward.getTotalLimit() != null) {
            long totalRedemptions = redemptionRepository.countByUserAndReward(user, reward);
            if (totalRedemptions >= reward.getTotalLimit()) {
                return new RedemptionEligibility(false, 
                    String.format("Total limit reached (%d/%d)", totalRedemptions, reward.getTotalLimit()));
            }
        }
        
        // Check minimum credit balance requirement
        if (reward.getMinCreditBalance() != null && userCredits < reward.getMinCreditBalance()) {
            return new RedemptionEligibility(false, 
                String.format("Minimum credit balance required: %d", reward.getMinCreditBalance()));
        }
        
        return new RedemptionEligibility(true, "Eligible for redemption");
    }
    
    /**
     * Get all available reward categories
     */
    @Transactional(readOnly = true)
    public List<String> getAvailableCategories() {
        return rewardCatalogRepository.findDistinctCategories();
    }
    
    /**
     * Get cheapest rewards for recommendations
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getCheapestRewards(int limit) {
        List<RewardCatalog> rewards = rewardCatalogRepository.findCheapestRewards(LocalDateTime.now());
        return rewards.stream().limit(limit).toList();
    }
    
    /**
     * Get most popular rewards
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getMostPopularRewards(int limit) {
        List<RewardCatalog> rewards = rewardCatalogRepository.findMostPopularRewards(LocalDateTime.now());
        return rewards.stream().limit(limit).toList();
    }
    
    /**
     * Get expiring soon rewards
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getExpiringSoonRewards() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryThreshold = now.plusDays(7); // Expiring within 7 days
        return rewardCatalogRepository.findExpiringSoonRewards(now, expiryThreshold);
    }
    
    /**
     * Get reward statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRewardStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        long totalRewards = rewardCatalogRepository.countAvailableRewards(now);
        long totalPartners = partnerRepository.countByIsActiveTrue();
        List<String> categories = getAvailableCategories();
        
        stats.put("totalRewards", totalRewards);
        stats.put("totalPartners", totalPartners);
        stats.put("totalCategories", categories.size());
        stats.put("categories", categories);
        
        return stats;
    }
    
    /**
     * Get personalized reward recommendations for user
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> getPersonalizedRecommendations(User user, int limit) {
        // Simple recommendation: affordable rewards sorted by popularity
        Integer userCredits = user.getTotalCredits();
        List<RewardCatalog> affordableRewards = rewardCatalogRepository.findAffordableRewards(userCredits, LocalDateTime.now());
        
        // You can enhance this with ML algorithms based on user's past redemptions
        return affordableRewards.stream().limit(limit).toList();
    }
    
    /**
     * Search rewards by name or description
     */
    @Transactional(readOnly = true)
    public List<RewardCatalog> searchRewards(String query) {
        // This would benefit from full-text search in production
        return rewardCatalogRepository.findAvailableRewards(LocalDateTime.now())
            .stream()
            .filter(reward -> 
                reward.getName().toLowerCase().contains(query.toLowerCase()) ||
                (reward.getDescription() != null && reward.getDescription().toLowerCase().contains(query.toLowerCase())) ||
                reward.getPartner().getName().toLowerCase().contains(query.toLowerCase())
            )
            .toList();
    }
    
    // Helper class for redemption eligibility check
    public static class RedemptionEligibility {
        private final boolean eligible;
        private final String message;
        
        public RedemptionEligibility(boolean eligible, String message) {
            this.eligible = eligible;
            this.message = message;
        }
        
        public boolean isEligible() { return eligible; }
        public String getMessage() { return message; }
    }
} 