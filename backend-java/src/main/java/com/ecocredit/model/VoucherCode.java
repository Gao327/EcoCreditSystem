package com.ecocredit.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "voucher_codes")
public class VoucherCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "redemption_id", nullable = false)
    private Redemption redemption;
    
    @Column(name = "code", unique = true, nullable = false)
    private String code;
    
    @Column(name = "qr_code_url")
    private String qrCodeUrl;
    
    @Column(name = "is_used")
    private Boolean isUsed = false;
    
    @Column(name = "used_at")
    private LocalDateTime usedAt;
    
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    
    @Column(name = "partner_reference")
    private String partnerReference; // Partner's internal reference for this code
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public VoucherCode() {}
    
    public VoucherCode(Redemption redemption, String code) {
        this.redemption = redemption;
        this.code = code;
    }
    
    public VoucherCode(Redemption redemption, String code, LocalDateTime expiryDate) {
        this.redemption = redemption;
        this.code = code;
        this.expiryDate = expiryDate;
    }
    
    // Business Logic Methods
    public boolean isValid() {
        return !isUsed && (expiryDate == null || LocalDateTime.now().isBefore(expiryDate));
    }
    
    public boolean isExpired() {
        return expiryDate != null && LocalDateTime.now().isAfter(expiryDate);
    }
    
    public void markAsUsed() {
        this.isUsed = true;
        this.usedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Redemption getRedemption() { return redemption; }
    public void setRedemption(Redemption redemption) { this.redemption = redemption; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
    
    public Boolean getIsUsed() { return isUsed; }
    public void setIsUsed(Boolean isUsed) { this.isUsed = isUsed; }
    
    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
    
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    
    public String getPartnerReference() { return partnerReference; }
    public void setPartnerReference(String partnerReference) { this.partnerReference = partnerReference; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 