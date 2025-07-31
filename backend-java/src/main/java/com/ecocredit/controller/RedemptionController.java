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
@RequestMapping("/api/redemptions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://localhost:8081"})
public class RedemptionController {
    
    private final RedemptionService redemptionService;
    private final AuthenticationService authenticationService;
    private final VoucherGenerationService voucherGenerationService;
    
    public RedemptionController(RedemptionService redemptionService,
                              AuthenticationService authenticationService,
                              VoucherGenerationService voucherGenerationService) {
        this.redemptionService = redemptionService;
        this.authenticationService = authenticationService;
        this.voucherGenerationService = voucherGenerationService;
    }
    
    /**
     * Get user's redemption history
     */
    @GetMapping("/history")
    public ResponseEntity<?> getRedemptionHistory() {
        try {
            User user = authenticationService.getCurrentUser();
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }
            
            List<Redemption> redemptions = redemptionService.getUserRedemptionHistory(user);
            
            List<Map<String, Object>> redemptionResponses = redemptions.stream()
                .map(this::createRedemptionResponse)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("redemptions", redemptionResponses);
            response.put("total", redemptionResponses.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get redemption history: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get user's active vouchers (unused and not expired)
     */
    @GetMapping("/vouchers")
    public ResponseEntity<?> getActiveVouchers() {
        try {
            User user = authenticationService.getCurrentUser();
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }
            
            List<Redemption> activeVouchers = redemptionService.getUserActiveVouchers(user);
            
            List<Map<String, Object>> voucherResponses = activeVouchers.stream()
                .map(this::createVoucherResponse)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("vouchers", voucherResponses);
            response.put("total", voucherResponses.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get active vouchers: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get specific redemption details
     */
    @GetMapping("/{redemptionId}")
    public ResponseEntity<?> getRedemptionDetails(@PathVariable Long redemptionId) {
        try {
            User user = authenticationService.getCurrentUser();
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }
            
            Optional<Redemption> redemptionOpt = redemptionService.getUserRedemption(user, redemptionId);
            
            if (redemptionOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Redemption not found or access denied");
                return ResponseEntity.status(404).body(error);
            }
            
            Redemption redemption = redemptionOpt.get();
            Map<String, Object> redemptionResponse = createDetailedRedemptionResponse(redemption);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("redemption", redemptionResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get redemption details: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get user's redemption statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getRedemptionStats() {
        try {
            User user = authenticationService.getCurrentUser();
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }
            
            Map<String, Object> stats = redemptionService.getUserRedemptionStats(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get redemption statistics: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Validate voucher code (for partners or customer verification)
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateVoucherCode(@RequestBody Map<String, String> request) {
        try {
            String voucherCode = request.get("voucherCode");
            if (voucherCode == null || voucherCode.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Voucher code is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            RedemptionService.VoucherValidationResult validationResult = 
                redemptionService.validateVoucherCode(voucherCode.trim());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("valid", validationResult.isValid());
            response.put("message", validationResult.getMessage());
            
            if (validationResult.getRedemption() != null) {
                response.put("redemption", createRedemptionResponse(validationResult.getRedemption()));
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to validate voucher: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Mark voucher as used (for partner integration)
     */
    @PostMapping("/use")
    public ResponseEntity<?> useVoucher(@RequestBody Map<String, String> request) {
        try {
            String voucherCode = request.get("voucherCode");
            String partnerReference = request.get("partnerReference");
            
            if (voucherCode == null || voucherCode.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Voucher code is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            boolean success = redemptionService.markVoucherAsUsed(voucherCode.trim(), partnerReference);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Voucher marked as used successfully" : "Invalid or expired voucher code");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to use voucher: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get expiring vouchers notification
     */
    @GetMapping("/expiring")
    public ResponseEntity<?> getExpiringVouchers(@RequestParam(defaultValue = "7") int daysAhead) {
        try {
            User user = authenticationService.getCurrentUser();
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Authentication required");
                return ResponseEntity.status(401).body(error);
            }
            
            List<Redemption> expiringVouchers = redemptionService.getExpiringVouchers(user, daysAhead);
            
            List<Map<String, Object>> voucherResponses = expiringVouchers.stream()
                .map(this::createVoucherResponse)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("expiringVouchers", voucherResponses);
            response.put("total", voucherResponses.size());
            response.put("daysAhead", daysAhead);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get expiring vouchers: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Helper methods to create response objects
    private Map<String, Object> createRedemptionResponse(Redemption redemption) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", redemption.getId());
        response.put("creditCost", redemption.getCreditCost());
        response.put("status", redemption.getStatus());
        response.put("redeemedAt", redemption.getRedeemedAt());
        response.put("expiryDate", redemption.getExpiryDate());
        
        // Basic reward information
        RewardCatalog reward = redemption.getReward();
        Map<String, Object> rewardInfo = new HashMap<>();
        rewardInfo.put("id", reward.getId());
        rewardInfo.put("name", reward.getName());
        rewardInfo.put("category", reward.getCategory());
        rewardInfo.put("monetaryValue", reward.getMonetaryValue());
        
        // Partner information
        Map<String, Object> partnerInfo = new HashMap<>();
        partnerInfo.put("name", reward.getPartner().getName());
        partnerInfo.put("logoUrl", reward.getPartner().getLogoUrl());
        rewardInfo.put("partner", partnerInfo);
        
        response.put("reward", rewardInfo);
        
        return response;
    }
    
    private Map<String, Object> createVoucherResponse(Redemption redemption) {
        Map<String, Object> response = createRedemptionResponse(redemption);
        
        // Add voucher-specific information
        response.put("voucherCode", redemption.getVoucherCode());
        response.put("qrCodeUrl", redemption.getQrCodeUrl());
        response.put("canBeUsed", redemption.canBeUsed());
        response.put("isActive", redemption.isActive());
        response.put("isExpired", redemption.isExpired());
        response.put("usedDate", redemption.getUsedDate());
        
        return response;
    }
    
    private Map<String, Object> createDetailedRedemptionResponse(Redemption redemption) {
        Map<String, Object> response = createVoucherResponse(redemption);
        
        // Add detailed information
        response.put("partnerTransactionId", redemption.getPartnerTransactionId());
        response.put("failureReason", redemption.getFailureReason());
        response.put("updatedAt", redemption.getUpdatedAt());
        
        // Full reward details
        RewardCatalog reward = redemption.getReward();
        Map<String, Object> fullRewardInfo = new HashMap<>();
        fullRewardInfo.put("id", reward.getId());
        fullRewardInfo.put("name", reward.getName());
        fullRewardInfo.put("description", reward.getDescription());
        fullRewardInfo.put("category", reward.getCategory());
        fullRewardInfo.put("monetaryValue", reward.getMonetaryValue());
        fullRewardInfo.put("imageUrl", reward.getImageUrl());
        fullRewardInfo.put("termsConditions", reward.getTermsConditions());
        
        // Full partner details
        Partner partner = reward.getPartner();
        Map<String, Object> fullPartnerInfo = new HashMap<>();
        fullPartnerInfo.put("id", partner.getId());
        fullPartnerInfo.put("name", partner.getName());
        fullPartnerInfo.put("logoUrl", partner.getLogoUrl());
        fullPartnerInfo.put("description", partner.getDescription());
        fullPartnerInfo.put("websiteUrl", partner.getWebsiteUrl());
        fullPartnerInfo.put("category", partner.getCategory());
        fullRewardInfo.put("partner", fullPartnerInfo);
        
        response.put("reward", fullRewardInfo);
        
        return response;
    }
} 