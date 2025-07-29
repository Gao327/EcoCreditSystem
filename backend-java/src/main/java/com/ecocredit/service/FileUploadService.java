package com.ecocredit.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {
    
    private static final String UPLOAD_DIR = "uploads";
    private static final String STATIC_DIR = "src/main/resources/static";
    
    public FileUploadService() {
        // Create upload directories if they don't exist
        createDirectories();
    }
    
    private void createDirectories() {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Path staticPath = Paths.get(STATIC_DIR);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            if (!Files.exists(staticPath)) {
                Files.createDirectories(staticPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directories", e);
        }
    }
    
    /**
     * Upload a file and return the URL
     * @param file The file to upload
     * @param category The category (avatars, achievements, etc.)
     * @return The URL to access the file
     */
    public String uploadFile(MultipartFile file, String category) {
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + "." + extension;
            
            // Create category directory
            Path categoryPath = Paths.get(UPLOAD_DIR, category);
            if (!Files.exists(categoryPath)) {
                Files.createDirectories(categoryPath);
            }
            
            // Save file
            Path filePath = categoryPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            // Return URL (accessible via /uploads/category/filename)
            return "/uploads/" + category + "/" + filename;
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }
    
    /**
     * Delete a file
     * @param fileUrl The URL of the file to delete
     */
    public void deleteFile(String fileUrl) {
        try {
            // Remove leading slash and get file path
            String filePath = fileUrl.substring(1); // Remove leading "/"
            Path path = Paths.get(filePath);
            
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }
    
    /**
     * Check if file exists
     * @param fileUrl The URL of the file
     * @return true if file exists
     */
    public boolean fileExists(String fileUrl) {
        try {
            String filePath = fileUrl.substring(1);
            Path path = Paths.get(filePath);
            return Files.exists(path);
        } catch (Exception e) {
            return false;
        }
    }
} 