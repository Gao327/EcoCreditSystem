package com.ecocredit.controller;

import com.ecocredit.model.User;
import com.ecocredit.model.Step;
import com.ecocredit.model.Credit;
import com.ecocredit.model.Achievement;
import com.ecocredit.service.CreditService;
import com.ecocredit.service.AchievementService;
import com.ecocredit.service.AuthenticationService;
import com.ecocredit.repository.UserRepository;
import com.ecocredit.repository.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import com.ecocredit.service.FileUploadService;
import com.ecocredit.service.NotificationService;
import com.ecocredit.service.GoogleOAuthService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://localhost:8081"})
public class EcoCreditController {
    
    private final UserRepository userRepository;
    private final StepRepository stepRepository;
    private final CreditService creditService;
    private final AchievementService achievementService;
    private final FileUploadService fileUploadService;
    private final NotificationService notificationService;
    private final GoogleOAuthService googleOAuthService;
    private final AuthenticationService authenticationService;
    
    // Constructor injection
    public EcoCreditController(UserRepository userRepository, 
                             StepRepository stepRepository,
                             CreditService creditService,
                             AchievementService achievementService,
                             FileUploadService fileUploadService,
                             NotificationService notificationService,
                             GoogleOAuthService googleOAuthService,
                             AuthenticationService authenticationService) {
        this.userRepository = userRepository;
        this.stepRepository = stepRepository;
        this.creditService = creditService;
        this.achievementService = achievementService;
        this.fileUploadService = fileUploadService;
        this.notificationService = notificationService;
        this.googleOAuthService = googleOAuthService;
        this.authenticationService = authenticationService;
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
            
            // Generate token using authentication service
            String token = authenticationService.generateToken(savedUser);
            
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
     * Google OAuth sign-in endpoint
     */
    @PostMapping("/auth/google")
    public ResponseEntity<?> googleSignIn(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            if (idToken == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "No ID token provided");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Verify Google ID token
            Map<String, Object> userInfo = googleOAuthService.verifyGoogleToken(idToken);
            if (userInfo == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Invalid Google ID token");
                return ResponseEntity.badRequest().body(error);
            }
            
            String googleId = (String) userInfo.get("googleId");
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String picture = (String) userInfo.get("picture");
            
            // Check if user already exists
            User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    // Create new user
                    User newUser = new User(googleId, email, name, picture);
                    return userRepository.save(newUser);
                });
            
            // Update last login
            user.setLastLogin(LocalDateTime.now());
            User savedUser = userRepository.save(user);
            
            // Generate token using authentication service
            String token = authenticationService.generateToken(savedUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("user", createUserResponse(savedUser));
            response.put("isGuest", false);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Google sign-in failed: " + e.getMessage());
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
    public ResponseEntity<?> getCreditBalance() {
        try {
            User user = authenticationService.getCurrentUser();
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
    public ResponseEntity<?> getUserProfile() {
        try {
            User user = authenticationService.getCurrentUser();
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
    public ResponseEntity<?> getAchievements() {
        try {
            User user = authenticationService.getCurrentUser();
            List<Achievement> achievements = achievementService.getUserAchievements(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("achievements", achievements);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Upload avatar endpoint
     */
    @PostMapping("/upload/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "No file uploaded");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Upload file to local storage
            String fileUrl = fileUploadService.uploadFile(file, "avatars");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fileUrl);
            response.put("message", "Avatar uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Upload achievement badge endpoint
     */
    @PostMapping("/upload/achievement-badge")
    public ResponseEntity<?> uploadAchievementBadge(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "No file uploaded");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Upload file to local storage
            String fileUrl = fileUploadService.uploadFile(file, "achievements");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fileUrl);
            response.put("message", "Achievement badge uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get notifications for user
     */
    @GetMapping("/notifications")
    public ResponseEntity<?> getUserNotifications() {
        try {
            User user = authenticationService.getCurrentUser();
            // For testing, use a guest user ID
            Long userId = user.getId(); // In real app, get from authentication
            
            List<Map<String, Object>> notifications = notificationService.getUserNotifications(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", notifications);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get notifications: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Mark notification as read
     */
    @PostMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            User user = authenticationService.getCurrentUser();
            // For testing, use a guest user ID
            Long userId = user.getId(); // In real app, get from authentication
            
            boolean success = notificationService.markNotificationAsRead(userId, notificationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", "Notification marked as read");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to mark notification as read: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Helper methods
    
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