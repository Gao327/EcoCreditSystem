package com.ecocredit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EcoCreditApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcoCreditApplication.class, args);
        System.out.println("🌱 EcoCredit System - Green Living Platform running!");
        System.out.println("📊 Health check: http://localhost:8080/health");
        System.out.println("🔐 Authentication endpoints available");
        System.out.println("🌍 Promoting sustainable living through gamification!");
    }
} 