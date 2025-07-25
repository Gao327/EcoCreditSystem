package com.ecocredit.service;

import com.ecocredit.model.User;
import com.ecocredit.model.Achievement;
import com.ecocredit.repository.AchievementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;

@Service
public class AchievementService {
    
    private final AchievementRepository achievementRepository;
    
    // Constructor injection
    public AchievementService(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }
    
    /**
     * Check and unlock green living achievements (equivalent to checkAchievements in Node.js)
     * @param user User to check achievements for
     * @param steps Number of steps taken
     * @param credits Number of credits earned
     * @return List of newly unlocked achievements
     */
    @Transactional
    public List<Achievement> checkAndUnlockAchievements(User user, int steps, int credits) {
        List<Achievement> newAchievements = new ArrayList<>();
        
        // Define achievement criteria (same as Node.js version)
        List<AchievementCriteria> criteriaList = List.of(
            new AchievementCriteria("first_steps", steps >= 100, 
                "🌱 First Steps", 
                "Complete your first 100 steps of sustainable transportation"),
            new AchievementCriteria("walker", steps >= 1000, 
                "🚶‍♂️ Green Walker", 
                "Walk 1,000 steps in a day (reducing carbon footprint)"),
            new AchievementCriteria("stepper", steps >= 5000, 
                "🏃‍♀️ Eco Stepper", 
                "Walk 5,000 steps in a day (halfway to sustainable goal)"),
            new AchievementCriteria("goal_crusher", steps >= 10000, 
                "🏆 Sustainable Champion", 
                "Reach the daily sustainable transportation goal of 10,000 steps")
        );
        
        // Check each achievement criteria
        for (AchievementCriteria criteria : criteriaList) {
            if (criteria.condition) {
                // Check if user already has this achievement
                boolean alreadyHas = achievementRepository.existsByUserAndType(user, criteria.type);
                
                if (!alreadyHas) {
                    // Unlock new achievement
                    Achievement achievement = new Achievement(
                        user, 
                        criteria.type, 
                        criteria.name, 
                        criteria.description
                    );
                    
                    Achievement savedAchievement = achievementRepository.save(achievement);
                    newAchievements.add(savedAchievement);
                    
                    System.out.printf("🏆 Achievement unlocked for user %s: %s%n", 
                                    user.getId() != null ? user.getId().toString() : "unknown", criteria.name);
                }
            }
        }
        
        return newAchievements;
    }
    
    /**
     * Get all achievements for a user
     * @param user User to get achievements for
     * @return List of user's achievements
     */
    public List<Achievement> getUserAchievements(User user) {
        return achievementRepository.findByUserOrderByEarnedAtDesc(user);
    }
    
    /**
     * Get total number of achievements unlocked by user
     * @param user User to count achievements for
     * @return Number of achievements
     */
    public long getAchievementCount(User user) {
        return achievementRepository.countByUser(user);
    }
    
    // Inner class for achievement criteria
    private static class AchievementCriteria {
        public final String type;
        public final boolean condition;
        public final String name;
        public final String description;
        
        public AchievementCriteria(String type, boolean condition, String name, String description) {
            this.type = type;
            this.condition = condition;
            this.name = name;
            this.description = description;
        }
    }
} 