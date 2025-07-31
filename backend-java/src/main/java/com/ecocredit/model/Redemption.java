package com.ecocredit.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "redemptions")
public class Redemption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_id", nullable = false)
    private RewardCatalog reward;
    
    @Column(name = "credit_cost", nullable = false)
    private Integer creditCost;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private RedemptionStatus status = RedemptionStatus.PENDING;
    
    @Column(name = "voucher_code")
    private String voucherCode;
    
    @Column(name = "qr_code_url")
    private String qrCodeUrl;
    
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    
    @Column(name = "used_date")
    private LocalDateTime usedDate;
    
    @Column(name = "failure_reason")
    private String failureReason;
    
    @Column(name = "partner_transaction_id")
    private String partnerTransactionId;
    
    @CreationTimestamp
    @Column(name = "redeemed_at", nullable = false, updatable = false)
    private LocalDateTime redeemedAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "redemption", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoucherCode> voucherCodes;
    
    // Enum for redemption status
    public enum RedemptionStatus {
        PENDING,    // Initial state when redemption is created
        PROCESSING, // When generating voucher code
        COMPLETED,  // Voucher code generated successfully
        USED,       // User has used the voucher
        EXPIRED,    // Voucher has expired
        FAILED,     // Failed to generate voucher
        CANCELLED   // Redemption was cancelled
    }
    
    // Constructors
    public Redemption() {}
    
    public Redemption(User user, RewardCatalog reward, Integer creditCost) {
        this.user = user;
        this.reward = reward;
        this.creditCost = creditCost;
        this.status = RedemptionStatus.PENDING;
    }
    
    // Business Logic Methods
    public boolean isActive() {
        return status == RedemptionStatus.COMPLETED && 
               (expiryDate == null || LocalDateTime.now().isBefore(expiryDate));
    }
    
    public boolean canBeUsed() {
        return isActive() && usedDate == null;
    }
    
    public void markAsUsed() {
        if (canBeUsed()) {
            this.status = RedemptionStatus.USED;
            this.usedDate = LocalDateTime.now();
        }
    }
    
    public void markAsCompleted(String voucherCode) {
        this.status = RedemptionStatus.COMPLETED;
        this.voucherCode = voucherCode;
    }
    
    public void markAsFailed(String reason) {
        this.status = RedemptionStatus.FAILED;
        this.failureReason = reason;
    }
    
    public boolean isExpired() {
        return expiryDate != null && LocalDateTime.now().isAfter(expiryDate);
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public RewardCatalog getReward() { return reward; }
    public void setReward(RewardCatalog reward) { this.reward = reward; }
    
    public Integer getCreditCost() { return creditCost; }
    public void setCreditCost(Integer creditCost) { this.creditCost = creditCost; }
    
    public RedemptionStatus getStatus() { return status; }
    public void setStatus(RedemptionStatus status) { this.status = status; }
    
    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
    
    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
    
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    
    public LocalDateTime getUsedDate() { return usedDate; }
    public void setUsedDate(LocalDateTime usedDate) { this.usedDate = usedDate; }
    
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    
    public String getPartnerTransactionId() { return partnerTransactionId; }
    public void setPartnerTransactionId(String partnerTransactionId) { this.partnerTransactionId = partnerTransactionId; }
    
    public LocalDateTime getRedeemedAt() { return redeemedAt; }
    public void setRedeemedAt(LocalDateTime redeemedAt) { this.redeemedAt = redeemedAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<VoucherCode> getVoucherCodes() { return voucherCodes; }
    public void setVoucherCodes(List<VoucherCode> voucherCodes) { this.voucherCodes = voucherCodes; }
} 