package com.ecocredit.repository;

import com.ecocredit.model.VoucherCode;
import com.ecocredit.model.Redemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherCodeRepository extends JpaRepository<VoucherCode, Long> {
    
    // Find voucher code by code value
    Optional<VoucherCode> findByCode(String code);
    
    // Find voucher codes by redemption
    List<VoucherCode> findByRedemption(Redemption redemption);
    
    // Find unused voucher codes
    List<VoucherCode> findByIsUsedFalse();
    
    // Find expired voucher codes
    @Query("SELECT v FROM VoucherCode v WHERE v.expiryDate IS NOT NULL AND v.expiryDate < :now")
    List<VoucherCode> findExpiredVoucherCodes(@Param("now") LocalDateTime now);
    
    // Find expiring voucher codes (within threshold)
    @Query("SELECT v FROM VoucherCode v WHERE v.isUsed = false " +
           "AND v.expiryDate IS NOT NULL " +
           "AND v.expiryDate BETWEEN :now AND :expiryThreshold")
    List<VoucherCode> findExpiringVoucherCodes(@Param("now") LocalDateTime now, 
                                             @Param("expiryThreshold") LocalDateTime expiryThreshold);
    
    // Find valid unused voucher codes
    @Query("SELECT v FROM VoucherCode v WHERE v.isUsed = false " +
           "AND (v.expiryDate IS NULL OR v.expiryDate > :now)")
    List<VoucherCode> findValidUnusedVoucherCodes(@Param("now") LocalDateTime now);
    
    // Check if voucher code exists and is valid
    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM VoucherCode v " +
           "WHERE v.code = :code AND v.isUsed = false " +
           "AND (v.expiryDate IS NULL OR v.expiryDate > :now)")
    boolean isVoucherCodeValid(@Param("code") String code, @Param("now") LocalDateTime now);
    
    // Find voucher codes by partner reference
    List<VoucherCode> findByPartnerReference(String partnerReference);
    
    // Count unused voucher codes
    long countByIsUsedFalse();
    
    // Count expired voucher codes
    @Query("SELECT COUNT(v) FROM VoucherCode v WHERE v.expiryDate IS NOT NULL AND v.expiryDate < :now")
    long countExpiredVoucherCodes(@Param("now") LocalDateTime now);
    
    // Find voucher codes created within date range
    @Query("SELECT v FROM VoucherCode v WHERE v.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY v.createdAt DESC")
    List<VoucherCode> findByCreatedAtRange(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    // Find recently used voucher codes
    @Query("SELECT v FROM VoucherCode v WHERE v.isUsed = true " +
           "AND v.usedAt >= :recentThreshold " +
           "ORDER BY v.usedAt DESC")
    List<VoucherCode> findRecentlyUsedVoucherCodes(@Param("recentThreshold") LocalDateTime recentThreshold);
} 