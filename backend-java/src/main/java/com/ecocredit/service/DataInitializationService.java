package com.ecocredit.service;

import com.ecocredit.model.*;
import com.ecocredit.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class DataInitializationService {
    
    private final PartnerRepository partnerRepository;
    private final RewardCatalogRepository rewardCatalogRepository;
    
    public DataInitializationService(PartnerRepository partnerRepository,
                                   RewardCatalogRepository rewardCatalogRepository) {
        this.partnerRepository = partnerRepository;
        this.rewardCatalogRepository = rewardCatalogRepository;
    }
    
    @PostConstruct
    public void initializeData() {
        if (partnerRepository.count() == 0) {
            System.out.println("Initializing sample data...");
            createSamplePartnersAndRewards();
            System.out.println("Sample data initialization completed!");
        }
    }
    
    private void createSamplePartnersAndRewards() {
        // Create NTUC Partner
        Partner ntuc = new Partner(
            "NTUC FairPrice",
            "Singapore's largest grocery retailer committed to sustainable shopping",
            "GROCERY",
            "https://logo.clearbit.com/fairprice.com.sg",
            "https://www.fairprice.com.sg"
        );
        ntuc = partnerRepository.save(ntuc);
        
        // NTUC Rewards
        createReward(ntuc, "NTUC $5 Voucher", "Get $5 off your grocery shopping at any NTUC FairPrice outlet", 
                    100, BigDecimal.valueOf(5.00), "VOUCHER", true);
        createReward(ntuc, "NTUC $10 Voucher", "Get $10 off your grocery shopping at any NTUC FairPrice outlet", 
                    200, BigDecimal.valueOf(10.00), "VOUCHER", false);
        createReward(ntuc, "NTUC Organic Produce 20% Off", "20% discount on organic fruits and vegetables", 
                    80, BigDecimal.valueOf(3.00), "DISCOUNT", false);
        
        // Create Starbucks Partner
        Partner starbucks = new Partner(
            "Starbucks",
            "World's leading coffeehouse chain with eco-friendly initiatives",
            "FOOD_BEVERAGE",
            "https://logo.clearbit.com/starbucks.com",
            "https://www.starbucks.com.sg"
        );
        starbucks = partnerRepository.save(starbucks);
        
        // Starbucks Rewards
        createReward(starbucks, "Free Tall Coffee", "Redeem a free tall-sized coffee of your choice", 
                    150, BigDecimal.valueOf(6.50), "VOUCHER", true);
        createReward(starbucks, "Grande Drink Upgrade", "Upgrade any tall drink to grande size for free", 
                    50, BigDecimal.valueOf(1.50), "VOUCHER", false);
        createReward(starbucks, "Buy 1 Get 1 Pastry", "Buy any pastry and get another one free", 
                    120, BigDecimal.valueOf(5.00), "VOUCHER", false);
        
        // Create Grab Partner
        Partner grab = new Partner(
            "Grab",
            "Southeast Asia's leading ride-hailing and delivery platform promoting green transport",
            "TRANSPORT",
            "https://logo.clearbit.com/grab.com",
            "https://www.grab.com/sg"
        );
        grab = partnerRepository.save(grab);
        
        // Grab Rewards
        createReward(grab, "$3 Ride Credit", "Get $3 off your next GrabCar or GrabTaxi ride", 
                    90, BigDecimal.valueOf(3.00), "VOUCHER", true);
        createReward(grab, "$5 GrabFood Voucher", "Enjoy $5 off your food delivery order", 
                    100, BigDecimal.valueOf(5.00), "VOUCHER", false);
        createReward(grab, "Free Delivery on GrabMart", "Free delivery for your next grocery order", 
                    60, BigDecimal.valueOf(2.50), "VOUCHER", false);
        
        // Create H&M Partner
        Partner hm = new Partner(
            "H&M",
            "Fashion retailer committed to sustainable and conscious fashion",
            "RETAIL",
            "https://logo.clearbit.com/hm.com",
            "https://www2.hm.com/en_sg"
        );
        hm = partnerRepository.save(hm);
        
        // H&M Rewards
        createReward(hm, "$10 H&M Voucher", "Shop sustainable fashion with $10 off", 
                    200, BigDecimal.valueOf(10.00), "VOUCHER", false);
        createReward(hm, "20% Off Conscious Collection", "20% discount on eco-friendly clothing line", 
                    150, BigDecimal.valueOf(8.00), "DISCOUNT", true);
        
        // Create Patagonia Partner
        Partner patagonia = new Partner(
            "Patagonia",
            "Outdoor clothing company dedicated to environmental activism",
            "RETAIL",
            "https://logo.clearbit.com/patagonia.com",
            "https://www.patagonia.com"
        );
        patagonia = partnerRepository.save(patagonia);
        
        // Patagonia Rewards
        createReward(patagonia, "$15 Outdoor Gear Voucher", "Gear up for eco-adventures with $15 off", 
                    300, BigDecimal.valueOf(15.00), "VOUCHER", false);
        createReward(patagonia, "Free Worn Wear Repair", "Free repair service for your Patagonia gear", 
                    100, BigDecimal.valueOf(20.00), "SERVICE", false);
        
        // Create EcoLife Partner (Generic green lifestyle brand)
        Partner ecolife = new Partner(
            "EcoLife Store",
            "Your one-stop shop for sustainable living products",
            "RETAIL",
            "https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=EcoLife",
            "https://ecolife.example.com"
        );
        ecolife = partnerRepository.save(ecolife);
        
        // EcoLife Rewards
        createReward(ecolife, "Reusable Water Bottle", "Premium stainless steel water bottle", 
                    120, BigDecimal.valueOf(25.00), "PHYSICAL_GOOD", true);
        createReward(ecolife, "Bamboo Utensil Set", "Complete set of bamboo eating utensils", 
                    80, BigDecimal.valueOf(15.00), "PHYSICAL_GOOD", false);
        createReward(ecolife, "Organic Cotton Tote Bag", "Eco-friendly shopping bag made from organic cotton", 
                    60, BigDecimal.valueOf(12.00), "PHYSICAL_GOOD", false);
    }
    
    private void createReward(Partner partner, String name, String description, 
                             Integer creditCost, BigDecimal monetaryValue, String category, boolean featured) {
        RewardCatalog reward = new RewardCatalog(partner, name, description, creditCost, monetaryValue);
        reward.setCategory(category);
        reward.setIsFeatured(featured);
        reward.setUnlimitedStock(true); // For demo purposes
        reward.setValidFrom(LocalDateTime.now());
        reward.setValidUntil(LocalDateTime.now().plusMonths(6)); // Valid for 6 months
        
        // Set some limits for demonstration
        if (creditCost > 200) {
            reward.setDailyLimit(1); // Expensive items limited to 1 per day
            reward.setTotalLimit(5); // Max 5 per user total
        } else if (creditCost > 100) {
            reward.setDailyLimit(2); // Mid-range items limited to 2 per day
        }
        
        // Add terms and conditions
        reward.setTermsConditions(
            String.format("Valid for 6 months from redemption. Cannot be combined with other offers. " +
                         "Redeemable at %s outlets. Non-transferable and non-refundable.", partner.getName())
        );
        
        // Set mock image URLs
        String imageUrl = generateImageUrl(category, name);
        reward.setImageUrl(imageUrl);
        
        rewardCatalogRepository.save(reward);
    }
    
    private String generateImageUrl(String category, String name) {
        // Generate placeholder images based on category
        String baseUrl = "https://via.placeholder.com/300x200";
        String color = switch (category) {
            case "VOUCHER" -> "4CAF50"; // Green
            case "DISCOUNT" -> "FF9800"; // Orange
            case "PHYSICAL_GOOD" -> "2196F3"; // Blue
            case "SERVICE" -> "9C27B0"; // Purple
            default -> "757575"; // Grey
        };
        
        String text = name.replaceAll(" ", "+").substring(0, Math.min(name.length(), 20));
        return String.format("%s/%s/FFFFFF?text=%s", baseUrl, color, text);
    }
} 