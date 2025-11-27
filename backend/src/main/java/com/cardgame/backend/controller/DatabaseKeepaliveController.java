package com.cardgame.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RestController
@RequestMapping("/api/db")
public class DatabaseKeepaliveController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Runs every 2 days at 3 AM
    @Scheduled(cron = "0 0 3 */2 * *")
    public void keepDatabaseAlive() {
        try {
            // Simple query to keep connection alive
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            System.out.println("✅ Database keepalive ping successful at " + LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("❌ Database keepalive failed: " + e.getMessage());
        }
    }

    // Manual endpoint to test
    @GetMapping("/ping")
    public Map<String, Object> pingDatabase() {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            response.put("status", "success");
            response.put("result", result);
            response.put("timestamp", LocalDateTime.now());
            return response;
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return response;
        }
    }
}