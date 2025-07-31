package com.ecocredit.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "credits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Credit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "amount", nullable = false)
    private Integer amount;
    
    @Column(name = "type", nullable = false)
    private String type; // 'earned' or 'spent'
    
    @Column(name = "source")
    private String source; // Description of how credits were earned/spent
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructor
    public Credit(User user, Integer amount, String type, String source) {
        this.user = user;
        this.amount = amount;
        this.type = type;
        this.source = source;
    }
    
    // Explicit getter for amount (in case Lombok doesn't work properly)
    public Integer getAmount() {
        return amount;
    }
} 