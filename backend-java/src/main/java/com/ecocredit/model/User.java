package com.ecocredit.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "google_id", unique = true)
    private String googleId;
    
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "is_guest")
    private Boolean isGuest = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Step> steps;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Credit> credits;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Achievement> achievements;
    
    // Default constructor
    public User() {}
    
    // Constructor for guest users
    public User(String email, String name, Boolean isGuest) {
        this.email = email;
        this.name = name;
        this.isGuest = isGuest;
    }
    
    // Constructor for Google OAuth users
    public User(String googleId, String email, String name, String avatarUrl) {
        this.googleId = googleId;
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.isGuest = false;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    
    public Boolean getIsGuest() { return isGuest; }
    public void setIsGuest(Boolean isGuest) { this.isGuest = isGuest; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    
    public List<Step> getSteps() { return steps; }
    public void setSteps(List<Step> steps) { this.steps = steps; }
    
    public List<Credit> getCredits() { return credits; }
    public void setCredits(List<Credit> credits) { this.credits = credits; }
    
    public List<Achievement> getAchievements() { return achievements; }
    public void setAchievements(List<Achievement> achievements) { this.achievements = achievements; }
} 