package com.ecocredit.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reward_catalog")
public class RewardCatalog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "credit_cost", nullable = false)
    private Integer creditCost;
    
    @Column(name = "monetary_value", precision = 10, scale = 2)
    private BigDecimal monetaryValue; // e.g., $5.00 for NTUC voucher
    
    @Column(name = "category")
    private String category; // VOUCHER, DISCOUNT, PHYSICAL_GOOD, SERVICE
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "terms_conditions", columnDefinition = "TEXT")
    private String termsConditions;
    
    @Column(name = "stock_quantity")
    private Integer stockQuantity;
    
    @Column(name = "unlimited_stock")
    private Boolean unlimitedStock = false;
    
    @Column(name = "is_available")
    private Boolean isAvailable = true;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "valid_from")
    private LocalDateTime validFrom;
    
    @Column(name = "valid_until")
    private LocalDateTime validUntil;
    
    @Column(name = "min_credit_balance")
    private Integer minCreditBalance; // Minimum credit balance required to redeem
    
    @Column(name = "daily_limit")
    private Integer dailyLimit; // Max redemptions per user per day
    
    @Column(name = "total_limit")
    private Integer totalLimit; // Max redemptions per user total
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "reward", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Redemption> redemptions;
    
    // Constructors
    public RewardCatalog() {}
    
    public RewardCatalog(Partner partner, String name, String description, Integer creditCost, BigDecimal monetaryValue) {
        this.partner = partner;
        this.name = name;
        this.description = description;
        this.creditCost = creditCost;
        this.monetaryValue = monetaryValue;
    }
    
    // Business Logic Methods
    public boolean isCurrentlyAvailable() {
        if (!isAvailable) return false;
        if (!unlimitedStock && (stockQuantity == null || stockQuantity <= 0)) return false;
        
        LocalDateTime now = LocalDateTime.now();
        if (validFrom != null && now.isBefore(validFrom)) return false;
        if (validUntil != null && now.isAfter(validUntil)) return false;
        
        return true;
    }
    
    public boolean canUserRedeem(User user, int userDailyRedemptions, int userTotalRedemptions) {
        if (!isCurrentlyAvailable()) return false;
        if (minCreditBalance != null && user.getTotalCredits() < minCreditBalance) return false;
        if (dailyLimit != null && userDailyRedemptions >= dailyLimit) return false;
        if (totalLimit != null && userTotalRedemptions >= totalLimit) return false;
        
        return true;
    }
    
    public void decrementStock() {
        if (!unlimitedStock && stockQuantity != null && stockQuantity > 0) {
            stockQuantity--;
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Partner getPartner() { return partner; }
    public void setPartner(Partner partner) { this.partner = partner; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getCreditCost() { return creditCost; }
    public void setCreditCost(Integer creditCost) { this.creditCost = creditCost; }
    
    public BigDecimal getMonetaryValue() { return monetaryValue; }
    public void setMonetaryValue(BigDecimal monetaryValue) { this.monetaryValue = monetaryValue; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public String getTermsConditions() { return termsConditions; }
    public void setTermsConditions(String termsConditions) { this.termsConditions = termsConditions; }
    
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    
    public Boolean getUnlimitedStock() { return unlimitedStock; }
    public void setUnlimitedStock(Boolean unlimitedStock) { this.unlimitedStock = unlimitedStock; }
    
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    
    public LocalDateTime getValidFrom() { return validFrom; }
    public void setValidFrom(LocalDateTime validFrom) { this.validFrom = validFrom; }
    
    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }
    
    public Integer getMinCreditBalance() { return minCreditBalance; }
    public void setMinCreditBalance(Integer minCreditBalance) { this.minCreditBalance = minCreditBalance; }
    
    public Integer getDailyLimit() { return dailyLimit; }
    public void setDailyLimit(Integer dailyLimit) { this.dailyLimit = dailyLimit; }
    
    public Integer getTotalLimit() { return totalLimit; }
    public void setTotalLimit(Integer totalLimit) { this.totalLimit = totalLimit; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<Redemption> getRedemptions() { return redemptions; }
    public void setRedemptions(List<Redemption> redemptions) { this.redemptions = redemptions; }
} 