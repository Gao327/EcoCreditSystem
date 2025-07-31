package com.ecocredit.service;

import com.ecocredit.model.*;
import com.ecocredit.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@Service
@Transactional
public class RedemptionService {
    
    private final RedemptionRepository redemptionRepository;
    private final VoucherCodeRepository voucherCodeRepository;
    private final RewardCatalogRepository rewardCatalogRepository;
    private final CreditRepository creditRepository;
    private final UserRepository userRepository;
    private final RewardsService rewardsService;
    private final VoucherGenerationService voucherGenerationService;
    
    public RedemptionService(RedemptionRepository redemptionRepository,
                           VoucherCodeRepository voucherCodeRepository,
                           RewardCatalogRepository rewardCatalogRepository,
                           CreditRepository creditRepository,
                           UserRepository userRepository,
                           RewardsService rewardsService,
                           VoucherGenerationService voucherGenerationService) {
        this.redemptionRepository = redemptionRepository;
        this.voucherCodeRepository = voucherCodeRepository;
        this.rewardCatalogRepository = rewardCatalogRepository;
        this.creditRepository = creditRepository;
        this.userRepository = userRepository;
        this.rewardsService = rewardsService;
        this.voucherGenerationService = voucherGenerationService;
    }
    
    /**
     * Redeem a reward using user's credits
     */
    @Transactional
    public RedemptionResult redeemReward(User user, Long rewardId) {
        try {
            // Check eligibility
            RewardsService.RedemptionEligibility eligibility = 
                rewardsService.checkRedemptionEligibility(user, rewardId);
            
            if (!eligibility.isEligible()) {
                return new RedemptionResult(false, eligibility.getMessage(), null);
            }
            
            // Get reward
            Optional<RewardCatalog> rewardOpt = rewardsService.getAvailableReward(rewardId);
            if (rewardOpt.isEmpty()) {
                return new RedemptionResult(false, "Reward not available", null);
            }
            
            RewardCatalog reward = rewardOpt.get();
            
            // Create redemption record
            Redemption redemption = new Redemption(user, reward, reward.getCreditCost());
            redemption = redemptionRepository.save(redemption);
            
            // Deduct credits from user
            boolean creditsDeducted = deductCreditsFromUser(user, reward.getCreditCost());
            if (!creditsDeducted) {
                redemption.markAsFailed("Failed to deduct credits");
                redemptionRepository.save(redemption);
                return new RedemptionResult(false, "Failed to deduct credits", null);
            }
            
            // Update stock
            reward.decrementStock();
            rewardCatalogRepository.save(reward);
            
            // Generate voucher code
            redemption.setStatus(Redemption.RedemptionStatus.PROCESSING);
            redemptionRepository.save(redemption);
            
            VoucherGenerationResult voucherResult = voucherGenerationService.generateVoucher(redemption);
            if (voucherResult.isSuccess()) {
                redemption.markAsCompleted(voucherResult.getVoucherCode());
                redemption.setQrCodeUrl(voucherResult.getQrCodeUrl());
                redemption.setExpiryDate(voucherResult.getExpiryDate());
                redemption.setPartnerTransactionId(voucherResult.getPartnerTransactionId());
                
                // Save voucher code
                VoucherCode voucherCode = new VoucherCode(redemption, voucherResult.getVoucherCode(), voucherResult.getExpiryDate());
                voucherCode.setQrCodeUrl(voucherResult.getQrCodeUrl());
                voucherCode.setPartnerReference(voucherResult.getPartnerTransactionId());
                voucherCodeRepository.save(voucherCode);
                
            } else {
                redemption.markAsFailed(voucherResult.getErrorMessage());
                // Refund credits
                refundCreditsToUser(user, reward.getCreditCost());
                // Restore stock
                if (!reward.getUnlimitedStock()) {
                    reward.setStockQuantity(reward.getStockQuantity() + 1);
                    rewardCatalogRepository.save(reward);
                }
            }
            
            redemption = redemptionRepository.save(redemption);
            
            return new RedemptionResult(
                voucherResult.isSuccess(),
                voucherResult.isSuccess() ? "Reward redeemed successfully!" : voucherResult.getErrorMessage(),
                redemption
            );
            
        } catch (Exception e) {
            return new RedemptionResult(false, "Failed to process redemption: " + e.getMessage(), null);
        }
    }
    
    /**
     * Get user's redemption history
     */
    @Transactional(readOnly = true)
    public List<Redemption> getUserRedemptionHistory(User user) {
        return redemptionRepository.findByUserOrderByRedeemedAtDesc(user);
    }
    
    /**
     * Get user's active vouchers (unused and not expired)
     */
    @Transactional(readOnly = true)
    public List<Redemption> getUserActiveVouchers(User user) {
        return redemptionRepository.findActiveRedemptionsByUser(user, LocalDateTime.now());
    }
    
    /**
     * Get redemption by ID with user verification
     */
    @Transactional(readOnly = true)
    public Optional<Redemption> getUserRedemption(User user, Long redemptionId) {
        Optional<Redemption> redemption = redemptionRepository.findById(redemptionId);
        return redemption.filter(r -> r.getUser().getId().equals(user.getId()));
    }
    
    /**
     * Mark voucher as used (called when voucher is scanned at partner)
     */
    @Transactional
    public boolean markVoucherAsUsed(String voucherCode, String partnerReference) {
        Optional<VoucherCode> voucherOpt = voucherCodeRepository.findByCode(voucherCode);
        
        if (voucherOpt.isEmpty()) {
            return false;
        }
        
        VoucherCode voucher = voucherOpt.get();
        if (!voucher.isValid()) {
            return false;
        }
        
        voucher.markAsUsed();
        voucher.getRedemption().markAsUsed();
        
        voucherCodeRepository.save(voucher);
        redemptionRepository.save(voucher.getRedemption());
        
        return true;
    }
    
    /**
     * Validate voucher code
     */
    @Transactional(readOnly = true)
    public VoucherValidationResult validateVoucherCode(String voucherCode) {
        Optional<VoucherCode> voucherOpt = voucherCodeRepository.findByCode(voucherCode);
        
        if (voucherOpt.isEmpty()) {
            return new VoucherValidationResult(false, "Voucher code not found", null);
        }
        
        VoucherCode voucher = voucherOpt.get();
        Redemption redemption = voucher.getRedemption();
        
        if (voucher.getIsUsed()) {
            return new VoucherValidationResult(false, "Voucher already used on " + voucher.getUsedAt(), redemption);
        }
        
        if (voucher.isExpired()) {
            return new VoucherValidationResult(false, "Voucher expired on " + voucher.getExpiryDate(), redemption);
        }
        
        return new VoucherValidationResult(true, "Voucher is valid", redemption);
    }
    
    /**
     * Get user's redemption statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserRedemptionStats(User user) {
        RedemptionRepository.UserRedemptionStats stats = redemptionRepository.getUserRedemptionStats(user);
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalRedemptions", stats.getTotalRedemptions());
        result.put("totalCreditsSpent", stats.getTotalCreditsSpent());
        result.put("successfulRedemptions", stats.getSuccessfulRedemptions());
        result.put("usedRedemptions", stats.getUsedRedemptions());
        result.put("activeVouchers", getUserActiveVouchers(user).size());
        
        return result;
    }
    
    /**
     * Get expiring vouchers for user notifications
     */
    @Transactional(readOnly = true)
    public List<Redemption> getExpiringVouchers(User user, int daysAhead) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(daysAhead);
        
        return redemptionRepository.findExpiringRedemptions(now, threshold)
            .stream()
            .filter(r -> r.getUser().getId().equals(user.getId()))
            .toList();
    }
    
    /**
     * Deduct credits from user
     */
    private boolean deductCreditsFromUser(User user, Integer amount) {
        try {
            // Create a negative credit record for redemption
            Credit deduction = new Credit(user, -amount, "REDEMPTION", "Reward redemption");
            creditRepository.save(deduction);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Refund credits to user (in case of failed redemption)
     */
    private void refundCreditsToUser(User user, Integer amount) {
        Credit refund = new Credit(user, amount, "REFUND", "Failed redemption refund");
        creditRepository.save(refund);
    }
    
    // Result classes
    public static class RedemptionResult {
        private final boolean success;
        private final String message;
        private final Redemption redemption;
        
        public RedemptionResult(boolean success, String message, Redemption redemption) {
            this.success = success;
            this.message = message;
            this.redemption = redemption;
        }
        
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public Redemption getRedemption() { return redemption; }
    }
    
    public static class VoucherValidationResult {
        private final boolean valid;
        private final String message;
        private final Redemption redemption;
        
        public VoucherValidationResult(boolean valid, String message, Redemption redemption) {
            this.valid = valid;
            this.message = message;
            this.redemption = redemption;
        }
        
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
        public Redemption getRedemption() { return redemption; }
    }
    
    public static class VoucherGenerationResult {
        private final boolean success;
        private final String voucherCode;
        private final String qrCodeUrl;
        private final LocalDateTime expiryDate;
        private final String partnerTransactionId;
        private final String errorMessage;
        
        public VoucherGenerationResult(boolean success, String voucherCode, String qrCodeUrl, 
                                     LocalDateTime expiryDate, String partnerTransactionId, String errorMessage) {
            this.success = success;
            this.voucherCode = voucherCode;
            this.qrCodeUrl = qrCodeUrl;
            this.expiryDate = expiryDate;
            this.partnerTransactionId = partnerTransactionId;
            this.errorMessage = errorMessage;
        }
        
        public static VoucherGenerationResult success(String voucherCode, String qrCodeUrl, 
                                                    LocalDateTime expiryDate, String partnerTransactionId) {
            return new VoucherGenerationResult(true, voucherCode, qrCodeUrl, expiryDate, partnerTransactionId, null);
        }
        
        public static VoucherGenerationResult failure(String errorMessage) {
            return new VoucherGenerationResult(false, null, null, null, null, errorMessage);
        }
        
        public boolean isSuccess() { return success; }
        public String getVoucherCode() { return voucherCode; }
        public String getQrCodeUrl() { return qrCodeUrl; }
        public LocalDateTime getExpiryDate() { return expiryDate; }
        public String getPartnerTransactionId() { return partnerTransactionId; }
        public String getErrorMessage() { return errorMessage; }
    }
} 