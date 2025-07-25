package com.ecocredit.service;

import com.ecocredit.model.User;
import com.ecocredit.model.Credit;
import com.ecocredit.repository.CreditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.HashMap;

@Service
public class CreditService {
    
    private final CreditRepository creditRepository;
    
    // Constructor injection
    public CreditService(CreditRepository creditRepository) {
        this.creditRepository = creditRepository;
    }
    
    /**
     * Convert steps to eco-credits (equivalent to calculateEcoCredits in Node.js)
     * @param steps Number of steps
     * @return Credit calculation details
     */
    public CreditCalculationResult calculateEcoCredits(int steps) {
        // Base credits: 1 eco-credit per 100 steps
        int baseCredits = steps / 100;
        
        // Bonus eco-credits for sustainable living milestones
        int bonusCredits = 0;
        if (steps >= 10000) {
            bonusCredits = 50;  // Daily sustainable transportation goal
        } else if (steps >= 5000) {
            bonusCredits = 25;  // Halfway to sustainable daily goal
        } else if (steps >= 1000) {
            bonusCredits = 10;  // Getting started with green living
        }
        
        int totalCredits = baseCredits + bonusCredits;
        double sustainableGoalProgress = Math.min(steps / 10000.0, 1.0) * 100;
        
        return new CreditCalculationResult(
            baseCredits,
            bonusCredits,
            totalCredits,
            sustainableGoalProgress,
            String.format("Converted %d steps of sustainable transportation into %d eco-credits!", 
                         steps, totalCredits)
        );
    }
    
    /**
     * Award credits to user
     * @param user User to award credits to
     * @param amount Number of credits to award
     * @param source Description of how credits were earned
     * @return Created credit record
     */
    @Transactional
    public Credit awardCredits(User user, int amount, String source) {
        Credit credit = new Credit(user, amount, "earned", source);
        return creditRepository.save(credit);
    }
    
    /**
     * Get user's total credit balance
     * @param user User to get balance for
     * @return Credit balance details
     */
    public CreditBalance getCreditBalance(User user) {
        Integer earned = creditRepository.sumCreditsByUserAndType(user, "earned");
        Integer spent = creditRepository.sumCreditsByUserAndType(user, "spent");
        
        earned = earned != null ? earned : 0;
        spent = spent != null ? spent : 0;
        
        int available = earned - spent;
        
        return new CreditBalance(available, earned, spent);
    }
    
    // Inner classes for return types
    public static class CreditCalculationResult {
        public final int baseCredits;
        public final int bonusCredits;
        public final int totalCredits;
        public final double sustainableGoalProgress;
        public final String message;
        
        public CreditCalculationResult(int baseCredits, int bonusCredits, int totalCredits,
                                     double sustainableGoalProgress, String message) {
            this.baseCredits = baseCredits;
            this.bonusCredits = bonusCredits;
            this.totalCredits = totalCredits;
            this.sustainableGoalProgress = sustainableGoalProgress;
            this.message = message;
        }
        
        public Map<String, Object> toMap() {
            Map<String, Object> result = new HashMap<>();
            result.put("baseCredits", baseCredits);
            result.put("bonusCredits", bonusCredits);
            result.put("totalCredits", totalCredits);
            result.put("sustainableGoalProgress", sustainableGoalProgress);
            result.put("message", message);
            return result;
        }
    }
    
    public static class CreditBalance {
        public final int available;
        public final int earned;
        public final int spent;
        
        public CreditBalance(int available, int earned, int spent) {
            this.available = available;
            this.earned = earned;
            this.spent = spent;
        }
        
        public Map<String, Integer> toMap() {
            Map<String, Integer> result = new HashMap<>();
            result.put("available", available);
            result.put("earned", earned);
            result.put("spent", spent);
            return result;
        }
    }
} 