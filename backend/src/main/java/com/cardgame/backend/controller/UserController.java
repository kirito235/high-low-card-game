package com.cardgame.backend.controller;

import com.cardgame.backend.model.User;
import com.cardgame.backend.repository.UserRepository;
import com.cardgame.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(
        origins = { "http://localhost:3000", "https://higherlowercardgame.onrender.com" },
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ✅ Get all user settings
    @GetMapping("/settings")
    public ResponseEntity<?> getAllSettings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("avatar", user.getAvatar() != null ? user.getAvatar() : "🎴");
            response.put("theme", user.getTheme() != null ? user.getTheme() : "default");
            response.put("cardBack", user.getCardBack() != null ? user.getCardBack() : "default");
            response.put("statsPublic", user.getStatsPublic() != null ? user.getStatsPublic() : true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ Save all user settings at once
    @PostMapping("/settings")
    public ResponseEntity<?> updateAllSettings(@RequestBody Map<String, Object> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update avatar if provided
            if (request.containsKey("avatar")) {
                String avatar = (String) request.get("avatar");
                user.setAvatar(avatar);
            }

            // Update theme if provided
            if (request.containsKey("theme")) {
                String theme = (String) request.get("theme");
                user.setTheme(theme);
            }

            // Update card back if provided
            if (request.containsKey("cardBack")) {
                String cardBack = (String) request.get("cardBack");
                user.setCardBack(cardBack);
            }

            // Update privacy setting if provided
            if (request.containsKey("statsPublic")) {
                Boolean statsPublic = (Boolean) request.get("statsPublic");
                user.setStatsPublic(statsPublic);
            }

            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Settings updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ Keep old endpoint for backwards compatibility
    @GetMapping("/privacy")
    public ResponseEntity<?> getPrivacySettings() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("statsPublic", user.getStatsPublic() != null ? user.getStatsPublic() : true);
            response.put("avatar", user.getAvatar() != null ? user.getAvatar() : "🎴");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ Keep old endpoint for backwards compatibility
    @PostMapping("/privacy")
    public ResponseEntity<?> updatePrivacySettings(@RequestBody Map<String, Object> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (request.containsKey("statsPublic")) {
                Boolean statsPublic = (Boolean) request.get("statsPublic");
                user.setStatsPublic(statsPublic);
            }

            if (request.containsKey("avatar")) {
                String avatar = (String) request.get("avatar");
                user.setAvatar(avatar);
            }

            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Settings updated");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/avatar/{username}")
    public ResponseEntity<?> getUserAvatar(@PathVariable String username) {
        try {
            User user = userRepository.findByUsername(username).orElse(null);

            Map<String, String> response = new HashMap<>();
            if (user != null) {
                response.put("avatar", user.getAvatar() != null ? user.getAvatar() : "🎴");
            } else {
                response.put("avatar", "🎴");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}