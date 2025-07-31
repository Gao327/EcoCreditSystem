package com.ecocredit.controller;

import com.ecocredit.model.*;
import com.ecocredit.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://localhost:8081"})
public class RewardsController {
    
    private final RewardsService rewardsService;
    private final RedemptionService redemptionService;
    private final AuthenticationService authenticationService;
    
    public RewardsController(RewardsService rewardsService, 
                           RedemptionService redemptionService,
                           AuthenticationService authenticationService) {
        this.rewardsService = rewardsService;
        this.redemptionService = redemptionService;
        this.authenticationService = authenticationService;
    }
    
    /**
     * Get all available rewards
     */
    @GetMapping
    public ResponseEntity<?> getAllRewards(@RequestParam(required = false) String category,
                                         @RequestParam(required = false) String search,
                                         @RequestParam(required = false) Integer maxCredits) {
        try {
            List<RewardCatalog> rewards;
            
            if (search != null && !search.trim().isEmpty()) {
                rewards = rewardsService.searchRewards(search.trim());
            } else if (category != null && !category.trim().isEmpty()) {
                rewards = rewardsService.getRewardsByCategory(category);
            } else if (maxCredits != null) {
                // Get affordable rewards based on max credits
                rewards = rewardsService.getAvailableRewards().stream()
                    .filter(r -> r.getCreditCost() <= maxCredits)
                    .toList();
            } else {
                rewards = rewardsService.getAvailableRewards();
            }
            
            List<Map<String, Object>> rewardResponses = rewards.stream()
                .map(this::createRewardResponse)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rewards", rewardResponses);
            response.put("total", rewardResponses.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get rewards: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get featured rewards
     */
    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedRewards() {
        try {
            List<RewardCatalog> rewards = rewardsService.getFeaturedRewards();
            
            List<Map<String, Object>> rewardResponses = rewards.stream()
                .map(this::createRewardResponse)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rewards", rewardResponses);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get featured rewards: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get rewards categories
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        try {
            List<String> categories = rewardsService.getAvailableCategories();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("categories", categories);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get categories: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get personalized recommendations for authenticated user
     */
    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(@RequestParam(defaultValue = "10") int limit) {
        try {
            User user = authenticationService.getCurrentUser();
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }
            
            List<RewardCatalog> recommendations = rewardsService.getPersonalizedRecommendations(user, limit);
            
            List<Map<String, Object>> rewardResponses = recommendations.stream()
                .map(this::createRewardResponse)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendations", rewardResponses);
            response.put("userCredits", user.getTotalCredits());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get recommendations: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get reward details by ID
     */
    @GetMapping("/{rewardId}")
    public ResponseEntity<?> getRewardById(@PathVariable Long rewardId) {
        try {
            Optional<RewardCatalog> rewardOpt = rewardsService.getAvailableReward(rewardId);
            
            if (rewardOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Reward not found or not available");
                return ResponseEntity.status(404).body(error);
            }
            
            RewardCatalog reward = rewardOpt.get();
            Map<String, Object> rewardResponse = createDetailedRewardResponse(reward);
            
            // Add eligibility check if user is authenticated
            User user = authenticationService.getCurrentUser();
            if (user != null) {
                RewardsService.RedemptionEligibility eligibility = 
                    rewardsService.checkRedemptionEligibility(user, rewardId);
                rewardResponse.put("eligible", eligibility.isEligible());
                rewardResponse.put("eligibilityMessage", eligibility.getMessage());
                rewardResponse.put("userCredits", user.getTotalCredits());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reward", rewardResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get reward details: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Redeem a reward
     */
    @PostMapping("/{rewardId}/redeem")
    public ResponseEntity<?> redeemReward(@PathVariable Long rewardId) {
        try {
            User user = authenticationService.getCurrentUser();
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }
            
            RedemptionService.RedemptionResult result = redemptionService.redeemReward(user, rewardId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", result.getMessage());
            
            if (result.isSuccess() && result.getRedemption() != null) {
                response.put("redemption", createRedemptionResponse(result.getRedemption()));
                response.put("newCreditBalance", user.getTotalCredits());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to redeem reward: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get reward statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getRewardStatistics() {
        try {
            Map<String, Object> stats = rewardsService.getRewardStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get statistics: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Helper methods to create response objects
    private Map<String, Object> createRewardResponse(RewardCatalog reward) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", reward.getId());
        response.put("name", reward.getName());
        response.put("description", reward.getDescription());
        response.put("creditCost", reward.getCreditCost());
        response.put("monetaryValue", reward.getMonetaryValue());
        response.put("category", reward.getCategory());
        response.put("imageUrl", reward.getImageUrl());
        response.put("isFeatured", reward.getIsFeatured());
        response.put("stockQuantity", reward.getStockQuantity());
        response.put("unlimitedStock", reward.getUnlimitedStock());
        
        // Partner information
        Partner partner = reward.getPartner();
        Map<String, Object> partnerInfo = new HashMap<>();
        partnerInfo.put("id", partner.getId());
        partnerInfo.put("name", partner.getName());
        partnerInfo.put("logoUrl", partner.getLogoUrl());
        partnerInfo.put("category", partner.getCategory());
        response.put("partner", partnerInfo);
        
        return response;
    }
    
    private Map<String, Object> createDetailedRewardResponse(RewardCatalog reward) {
        Map<String, Object> response = createRewardResponse(reward);
        
        // Add detailed information
        response.put("termsConditions", reward.getTermsConditions());
        response.put("validFrom", reward.getValidFrom());
        response.put("validUntil", reward.getValidUntil());
        response.put("dailyLimit", reward.getDailyLimit());
        response.put("totalLimit", reward.getTotalLimit());
        response.put("minCreditBalance", reward.getMinCreditBalance());
        
        return response;
    }
    
    private Map<String, Object> createRedemptionResponse(Redemption redemption) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", redemption.getId());
        response.put("creditCost", redemption.getCreditCost());
        response.put("status", redemption.getStatus());
        response.put("voucherCode", redemption.getVoucherCode());
        response.put("qrCodeUrl", redemption.getQrCodeUrl());
        response.put("expiryDate", redemption.getExpiryDate());
        response.put("redeemedAt", redemption.getRedeemedAt());
        response.put("reward", createRewardResponse(redemption.getReward()));
        
        return response;
    }
} 