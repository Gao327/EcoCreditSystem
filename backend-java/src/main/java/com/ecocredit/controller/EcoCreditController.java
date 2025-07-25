package com.ecocredit.controller;

import com.ecocredit.model.User;
import com.ecocredit.model.Step;
import com.ecocredit.model.Credit;
import com.ecocredit.model.Achievement;
import com.ecocredit.service.CreditService;
import com.ecocredit.service.AchievementService;
import com.ecocredit.repository.UserRepository;
import com.ecocredit.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class EcoCreditController {
    
    private final UserRepository userRepository;
    private final StepRepository stepRepository;
    private final CreditService creditService;
    private final AchievementService achievementService;
    
    // Constructor injection
    public EcoCreditController(UserRepository userRepository, 
                             StepRepository stepRepository,
                             CreditService creditService,
                             AchievementService achievementService) {
        this.userRepository = userRepository;
        this.stepRepository = stepRepository;
        this.creditService = creditService;
        this.achievementService = achievementService;
    }
    
    /**
     * Health check endpoint (equivalent to GET /health in Node.js)
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("timestamp", LocalDateTime.now());
        response.put("database", "connected");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Guest login endpoint (equivalent to POST /api/auth/guest in Node.js)
     */
    @PostMapping("/auth/guest")
    public ResponseEntity<?> guestLogin(@RequestBody Map<String, String> request) {
        try {
            String deviceId = request.get("deviceId");
            if (deviceId == null) {
                deviceId = UUID.randomUUID().toString();
            }
            
            long timestamp = System.currentTimeMillis();
            String guestEmail = String.format("guest_%d@stepcredit.com", timestamp);
            String guestName = String.format("Guest %d", timestamp);
            
            User user = new User(guestEmail, guestName, true);
            // Note: lastLogin is automatically updated by JPA
            User savedUser = userRepository.save(user);
            
            // Generate JWT token (you'll need to implement JWT service)
            String token = generateJwtToken(savedUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("user", createUserResponse(savedUser));
            response.put("isGuest", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to create guest account");
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Submit steps endpoint (equivalent to POST /api/steps in Node.js)
     */
    @PostMapping("/steps")
    public ResponseEntity<?> submitSteps(@RequestBody Map<String, Object> request) {
        try {
            Integer steps = (Integer) request.get("steps");
            String dateStr = (String) request.get("date");
            
            if (steps == null || steps < 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Invalid steps count");
                return ResponseEntity.badRequest().body(error);
            }
            
            LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();
            
            // For testing, create a guest user
            String guestEmail = "test-guest@stepcredit.com";
            String guestName = "Test Guest";
            User user = userRepository.findByEmail(guestEmail)
                .orElseGet(() -> {
                    User newUser = new User(guestEmail, guestName, true);
                    return userRepository.save(newUser);
                });
            
            // Save or update steps for the day
            Step stepRecord = stepRepository.findByUserAndDate(user, date)
                .orElse(new Step(user, steps, date));
            // Create new step record with updated steps
            stepRecord = new Step(user, steps, date);
            stepRepository.save(stepRecord);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "steps", steps,
                "date", date.toString(),
                "userId", user.getId() != null ? user.getId() : "unknown"
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Convert steps to credits endpoint (equivalent to POST /api/credits/convert in Node.js)
     */
    @PostMapping("/credits/convert")
    public ResponseEntity<?> convertStepsToCredits(@RequestBody Map<String, Object> request) {
        try {
            Integer steps = (Integer) request.get("steps");
            
            if (steps == null || steps < 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Invalid steps count");
                return ResponseEntity.badRequest().body(error);
            }
            
            // For testing, use the same guest user
            String guestEmail = "test-guest@stepcredit.com";
            User user = userRepository.findByEmail(guestEmail)
                .orElseGet(() -> {
                    User newUser = new User(guestEmail, "Test Guest", true);
                    return userRepository.save(newUser);
                });
            
            // Calculate eco-credits
            CreditService.CreditCalculationResult calculation = creditService.calculateEcoCredits(steps);
            
            // Award credits to user
            creditService.awardCredits(user, calculation.totalCredits, 
                String.format("Converted %d steps of sustainable transportation", steps));
            
            // Check for new achievements
            List<Achievement> newAchievements = achievementService.checkAndUnlockAchievements(
                user, steps, calculation.totalCredits);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", calculation.toMap());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get credit balance endpoint (equivalent to GET /api/credits/balance in Node.js)
     */
    @GetMapping("/credits/balance")
    public ResponseEntity<?> getCreditBalance(@AuthenticationPrincipal User user) {
        try {
            CreditService.CreditBalance balance = creditService.getCreditBalance(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("balance", balance.toMap());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Database error");
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get user profile endpoint (equivalent to GET /api/user/profile in Node.js)
     */
    @GetMapping("/user/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal User user) {
        try {
            // Get user stats
            UserRepository.UserStatsProjection stats = userRepository.getUserStats(user);
            
            // Get total credits
            Integer totalCredits = creditService.getCreditBalance(user).earned;
            
            Map<String, Object> userWithStats = createUserResponse(user);
            userWithStats.put("stats", Map.of(
                "totalSteps", stats.getTotalSteps(),
                "daysTracked", stats.getDaysTracked(),
                "maxDailySteps", stats.getMaxDailySteps(),
                "totalCredits", totalCredits
            ));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", userWithStats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Database error");
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get achievements endpoint (equivalent to GET /api/achievements in Node.js)
     */
    @GetMapping("/achievements")
    public ResponseEntity<?> getAchievements(@AuthenticationPrincipal User user) {
        try {
            List<Achievement> achievements = achievementService.getUserAchievements(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("achievements", achievements);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Database error");
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Helper methods
    private String generateJwtToken(User user) {
        // TODO: Implement JWT token generation
        // This would use the JWT service to create a token
        return "dummy-jwt-token-" + user.getId();
    }
    
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId() != null ? user.getId() : "unknown");
        userResponse.put("name", user.getName() != null ? user.getName() : "Unknown User");
        userResponse.put("email", user.getEmail() != null ? user.getEmail() : "unknown@example.com");
        userResponse.put("picture", user.getAvatarUrl() != null ? 
            user.getAvatarUrl() : "https://via.placeholder.com/120/667eea/ffffff?text=G");
        return userResponse;
    }
} 