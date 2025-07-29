package com.ecocredit.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Collections;
import java.util.Map;
import java.util.HashMap;

@Service
public class GoogleOAuthService {
    
    @Value("${google.client.id}")
    private String googleClientId;
    
    private GoogleIdTokenVerifier verifier;
    
    @PostConstruct
    public void init() {
        // Initialize verifier only if we have a real Google Client ID
        if (googleClientId != null && !googleClientId.contains("placeholder") && !googleClientId.contains("your-google-client-id")) {
            this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
            System.out.println("Google OAuth verifier initialized with client ID: " + googleClientId);
        } else {
            System.err.println("Google OAuth not properly configured. Client ID: " + googleClientId);
        }
    }
    
    /**
     * Verify Google ID token and extract user information
     * @param idTokenString The Google ID token from frontend
     * @return User information if valid, null if invalid
     */
    public Map<String, Object> verifyGoogleToken(String idTokenString) {
        try {
            // If verifier is not initialized (no real Google Client ID), return null
            if (verifier == null) {
                System.err.println("Google OAuth not configured. Please set google.client.id in application.properties");
                return null;
            }
            
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                Payload payload = idToken.getPayload();
                
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("googleId", payload.getSubject());
                userInfo.put("email", payload.getEmail());
                userInfo.put("name", (String) payload.get("name"));
                userInfo.put("picture", (String) payload.get("picture"));
                userInfo.put("emailVerified", payload.getEmailVerified());
                
                return userInfo;
            }
        } catch (Exception e) {
            System.err.println("Error verifying Google token: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Generate JWT token for authenticated user
     * @param userInfo User information from Google
     * @return JWT token
     */
    public String generateJwtToken(Map<String, Object> userInfo) {
        // In a real implementation, you would use a proper JWT library
        // For now, we'll create a simple token
        String googleId = (String) userInfo.get("googleId");
        String email = (String) userInfo.get("email");
        
        // Create a simple token (replace with proper JWT implementation)
        return "google-jwt-" + googleId + "-" + System.currentTimeMillis();
    }
} 