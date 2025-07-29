package com.ecocredit.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@Service
public class NotificationService {
    
    /**
     * Send achievement notification (stores in database for in-app display)
     * @param userId User ID
     * @param achievementTitle Achievement title
     * @param achievementDescription Achievement description
     * @return Notification details
     */
    public Map<String, Object> sendAchievementNotification(Long userId, String achievementTitle, String achievementDescription) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("userId", userId);
        notification.put("type", "achievement");
        notification.put("title", "🏆 Achievement Unlocked!");
        notification.put("message", achievementTitle + " - " + achievementDescription);
        notification.put("timestamp", LocalDateTime.now());
        notification.put("read", false);
        
        // In a real implementation, you would save this to a notifications table
        // For now, we'll just return the notification data
        System.out.println("🎉 Achievement notification for user " + userId + ": " + achievementTitle);
        
        return notification;
    }
    
    /**
     * Send daily reminder notification
     * @param userId User ID
     * @param stepsToday Steps taken today
     * @param goalSteps Goal steps for the day
     * @return Notification details
     */
    public Map<String, Object> sendDailyReminder(Long userId, int stepsToday, int goalSteps) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("userId", userId);
        notification.put("type", "reminder");
        notification.put("title", "🌱 Daily Green Living Reminder");
        
        int remainingSteps = goalSteps - stepsToday;
        if (remainingSteps > 0) {
            notification.put("message", "You've taken " + stepsToday + " steps today. " + 
                          remainingSteps + " more steps to reach your daily goal!");
        } else {
            notification.put("message", "Congratulations! You've exceeded your daily goal with " + 
                          stepsToday + " steps!");
        }
        
        notification.put("timestamp", LocalDateTime.now());
        notification.put("read", false);
        
        System.out.println("📱 Daily reminder for user " + userId + ": " + notification.get("message"));
        
        return notification;
    }
    
    /**
     * Send credit milestone notification
     * @param userId User ID
     * @param creditsEarned Credits earned
     * @param totalCredits Total credits
     * @return Notification details
     */
    public Map<String, Object> sendCreditMilestoneNotification(Long userId, int creditsEarned, int totalCredits) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("userId", userId);
        notification.put("type", "milestone");
        notification.put("title", "💚 Eco-Credit Milestone!");
        notification.put("message", "You earned " + creditsEarned + " eco-credits! " +
                      "Total balance: " + totalCredits + " credits");
        notification.put("timestamp", LocalDateTime.now());
        notification.put("read", false);
        
        System.out.println("💚 Credit milestone for user " + userId + ": " + creditsEarned + " credits earned");
        
        return notification;
    }
    
    /**
     * Get notifications for a user (simulated - in real app, would query database)
     * @param userId User ID
     * @return List of notifications
     */
    public List<Map<String, Object>> getUserNotifications(Long userId) {
        // In a real implementation, this would query a notifications table
        // For now, return empty list
        return new ArrayList<>();
    }
    
    /**
     * Mark notification as read
     * @param userId User ID
     * @param notificationId Notification ID
     * @return Success status
     */
    public boolean markNotificationAsRead(Long userId, Long notificationId) {
        // In a real implementation, this would update the database
        System.out.println("📖 Marked notification " + notificationId + " as read for user " + userId);
        return true;
    }
} 