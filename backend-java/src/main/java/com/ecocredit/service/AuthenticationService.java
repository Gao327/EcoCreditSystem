package com.ecocredit.service;

import com.ecocredit.model.User;
import com.ecocredit.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthenticationService {
    
    private final UserRepository userRepository;
    
    // Simple in-memory token storage (in production, use Redis or database)
    private final Map<String, Long> tokenToUserId = new ConcurrentHashMap<>();
    private final Map<Long, String> userIdToToken = new ConcurrentHashMap<>();
    
    public AuthenticationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Generate a simple token for a user
     */
    public String generateToken(User user) {
        String token = "token-" + user.getId() + "-" + System.currentTimeMillis();
        tokenToUserId.put(token, user.getId());
        userIdToToken.put(user.getId(), token);
        return token;
    }
    
    /**
     * Get user from token
     */
    public User getUserFromToken(String token) {
        if (token == null || !token.startsWith("token-")) {
            return null;
        }
        
        Long userId = tokenToUserId.get(token);
        if (userId == null) {
            return null;
        }
        
        return userRepository.findById(userId).orElse(null);
    }
    
    /**
     * Get current user from Authorization header
     */
    public User getCurrentUser() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return null;
            }
            
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            return getUserFromToken(token);
            
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Validate token and return user
     */
    public User validateToken(String token) {
        return getUserFromToken(token);
    }
    
    /**
     * Invalidate token
     */
    public void invalidateToken(String token) {
        Long userId = tokenToUserId.remove(token);
        if (userId != null) {
            userIdToToken.remove(userId);
        }
    }
} 