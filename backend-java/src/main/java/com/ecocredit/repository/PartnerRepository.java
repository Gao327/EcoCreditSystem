package com.ecocredit.repository;

import com.ecocredit.model.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {
    
    // Find active partners
    List<Partner> findByIsActiveTrue();
    
    // Find partners by category
    List<Partner> findByCategoryAndIsActiveTrue(String category);
    
    // Find partner by name
    Optional<Partner> findByNameIgnoreCase(String name);
    
    // Check if partner exists by name
    boolean existsByNameIgnoreCase(String name);
    
    // Get all available categories
    @Query("SELECT DISTINCT p.category FROM Partner p WHERE p.isActive = true AND p.category IS NOT NULL")
    List<String> findDistinctCategories();
    
    // Get partners with available rewards
    @Query("SELECT DISTINCT p FROM Partner p " +
           "JOIN p.rewards r " +
           "WHERE p.isActive = true AND r.isAvailable = true")
    List<Partner> findPartnersWithAvailableRewards();
    
    // Count active partners
    long countByIsActiveTrue();
} 