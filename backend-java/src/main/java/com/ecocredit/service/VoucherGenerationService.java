package com.ecocredit.service;

import com.ecocredit.model.Redemption;
import com.ecocredit.model.Partner;
import com.ecocredit.model.RewardCatalog;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class VoucherGenerationService {
    
    private final Map<String, PartnerIntegration> partnerIntegrations;
    
    public VoucherGenerationService() {
        this.partnerIntegrations = new HashMap<>();
        // Initialize partner integrations
        this.partnerIntegrations.put("NTUC", new NTUCIntegration());
        this.partnerIntegrations.put("STARBUCKS", new StarbucksIntegration());
        this.partnerIntegrations.put("GRAB", new GrabIntegration());
        this.partnerIntegrations.put("DEFAULT", new DefaultIntegration());
    }
    
    /**
     * Generate voucher for a redemption
     */
    public RedemptionService.VoucherGenerationResult generateVoucher(Redemption redemption) {
        try {
            RewardCatalog reward = redemption.getReward();
            Partner partner = reward.getPartner();
            
            // Get appropriate integration
            PartnerIntegration integration = partnerIntegrations.getOrDefault(
                partner.getName().toUpperCase(), 
                partnerIntegrations.get("DEFAULT")
            );
            
            return integration.generateVoucher(redemption);
            
        } catch (Exception e) {
            return RedemptionService.VoucherGenerationResult.failure(
                "Failed to generate voucher: " + e.getMessage()
            );
        }
    }
    
    // Base interface for partner integrations
    interface PartnerIntegration {
        RedemptionService.VoucherGenerationResult generateVoucher(Redemption redemption);
    }
    
    // NTUC Integration
    static class NTUCIntegration implements PartnerIntegration {
        @Override
        public RedemptionService.VoucherGenerationResult generateVoucher(Redemption redemption) {
            // Mock NTUC API integration
            // In production, this would call NTUC's actual API
            
            try {
                RewardCatalog reward = redemption.getReward();
                
                // Generate voucher code in NTUC format
                String voucherCode = "NTUC" + System.currentTimeMillis() + 
                                   String.format("%04d", (int)(Math.random() * 10000));
                
                // Generate QR code URL (mock)
                String qrCodeUrl = "https://api.ntuc.com.sg/qr/" + voucherCode;
                
                // Set expiry date (30 days from now)
                LocalDateTime expiryDate = LocalDateTime.now().plusDays(30);
                
                // Mock partner transaction ID
                String partnerTransactionId = "NTUC-TXN-" + UUID.randomUUID().toString().substring(0, 8);
                
                // Simulate API call delay
                Thread.sleep(500);
                
                // Simulate 95% success rate
                if (Math.random() < 0.95) {
                    return RedemptionService.VoucherGenerationResult.success(
                        voucherCode, qrCodeUrl, expiryDate, partnerTransactionId
                    );
                } else {
                    return RedemptionService.VoucherGenerationResult.failure("NTUC API temporarily unavailable");
                }
                
            } catch (Exception e) {
                return RedemptionService.VoucherGenerationResult.failure("NTUC integration error: " + e.getMessage());
            }
        }
    }
    
    // Starbucks Integration
    static class StarbucksIntegration implements PartnerIntegration {
        @Override
        public RedemptionService.VoucherGenerationResult generateVoucher(Redemption redemption) {
            try {
                // Generate Starbucks voucher code
                String voucherCode = "SB" + System.currentTimeMillis() + 
                                   String.format("%06d", (int)(Math.random() * 1000000));
                
                String qrCodeUrl = "https://api.starbucks.com.sg/voucher/" + voucherCode;
                LocalDateTime expiryDate = LocalDateTime.now().plusDays(14); // 14 days for coffee
                String partnerTransactionId = "SB-" + UUID.randomUUID().toString().substring(0, 10);
                
                Thread.sleep(300);
                
                if (Math.random() < 0.98) {
                    return RedemptionService.VoucherGenerationResult.success(
                        voucherCode, qrCodeUrl, expiryDate, partnerTransactionId
                    );
                } else {
                    return RedemptionService.VoucherGenerationResult.failure("Starbucks system maintenance");
                }
                
            } catch (Exception e) {
                return RedemptionService.VoucherGenerationResult.failure("Starbucks integration error: " + e.getMessage());
            }
        }
    }
    
    // Grab Integration
    static class GrabIntegration implements PartnerIntegration {
        @Override
        public RedemptionService.VoucherGenerationResult generateVoucher(Redemption redemption) {
            try {
                // Generate Grab promo code
                String voucherCode = "GRAB" + String.format("%08d", (int)(Math.random() * 100000000));
                
                String qrCodeUrl = "https://grab.com/sg/promo/" + voucherCode;
                LocalDateTime expiryDate = LocalDateTime.now().plusDays(7); // 7 days for ride discount
                String partnerTransactionId = "GRAB-" + UUID.randomUUID().toString().substring(0, 12);
                
                Thread.sleep(200);
                
                if (Math.random() < 0.97) {
                    return RedemptionService.VoucherGenerationResult.success(
                        voucherCode, qrCodeUrl, expiryDate, partnerTransactionId
                    );
                } else {
                    return RedemptionService.VoucherGenerationResult.failure("Grab API rate limit exceeded");
                }
                
            } catch (Exception e) {
                return RedemptionService.VoucherGenerationResult.failure("Grab integration error: " + e.getMessage());
            }
        }
    }
    
    // Default Integration (for unknown partners)
    static class DefaultIntegration implements PartnerIntegration {
        @Override
        public RedemptionService.VoucherGenerationResult generateVoucher(Redemption redemption) {
            try {
                // Generate generic voucher code
                String voucherCode = "ECO" + System.currentTimeMillis() + 
                                   String.format("%04d", (int)(Math.random() * 10000));
                
                String qrCodeUrl = "https://ecocredit.com/voucher/" + voucherCode;
                LocalDateTime expiryDate = LocalDateTime.now().plusDays(30);
                String partnerTransactionId = "ECO-" + UUID.randomUUID().toString().substring(0, 8);
                
                return RedemptionService.VoucherGenerationResult.success(
                    voucherCode, qrCodeUrl, expiryDate, partnerTransactionId
                );
                
            } catch (Exception e) {
                return RedemptionService.VoucherGenerationResult.failure("Default integration error: " + e.getMessage());
            }
        }
    }
    
    /**
     * Validate voucher with partner (for verification at point of sale)
     */
    public VoucherValidationResult validateWithPartner(String voucherCode, String partnerName) {
        try {
            PartnerIntegration integration = partnerIntegrations.getOrDefault(
                partnerName.toUpperCase(), 
                partnerIntegrations.get("DEFAULT")
            );
            
            // For now, return mock validation
            // In production, this would call partner's validation API
            boolean isValid = voucherCode.startsWith(getPartnerPrefix(partnerName)) && 
                            Math.random() < 0.95; // 95% validation success rate
            
            return new VoucherValidationResult(
                isValid, 
                isValid ? "Voucher validated successfully" : "Invalid voucher code",
                partnerName
            );
            
        } catch (Exception e) {
            return new VoucherValidationResult(false, "Validation failed: " + e.getMessage(), partnerName);
        }
    }
    
    private String getPartnerPrefix(String partnerName) {
        return switch (partnerName.toUpperCase()) {
            case "NTUC" -> "NTUC";
            case "STARBUCKS" -> "SB";
            case "GRAB" -> "GRAB";
            default -> "ECO";
        };
    }
    
    // Result class for partner validation
    public static class VoucherValidationResult {
        private final boolean valid;
        private final String message;
        private final String partnerName;
        
        public VoucherValidationResult(boolean valid, String message, String partnerName) {
            this.valid = valid;
            this.message = message;
            this.partnerName = partnerName;
        }
        
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
        public String getPartnerName() { return partnerName; }
    }
} 