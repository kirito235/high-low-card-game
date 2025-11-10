package com.cardgame.backend.controller;

import com.cardgame.backend.dto.LeaderboardEntry;
import com.cardgame.backend.model.User;
import com.cardgame.backend.repository.UserRepository;
import com.cardgame.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get global leaderboard - top players by best score
     * GET /api/leaderboard
     */
    @GetMapping
    public ResponseEntity<?> getLeaderboard(@RequestParam(defaultValue = "100") int limit) {
        try {
            // Get current username if authenticated
            String currentUsername = null;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                currentUsername = userDetails.getUsername();
            }

            // ✅ Get users sorted by best score (descending)
            List<User> topUsers = userRepository.findAllByBestScoreGreaterThanOrderByBestScoreDesc(0);

            // Limit results
            if (topUsers.size() > limit) {
                topUsers = topUsers.subList(0, limit);
            }

            List<LeaderboardEntry> leaderboard = new ArrayList<>();
            long rank = 1;

            for (User user : topUsers) {
                boolean isCurrentUser = currentUsername != null
                        && user.getUsername().equals(currentUsername);

                LeaderboardEntry entry = new LeaderboardEntry(
                        rank,
                        user.getUsername(),
                        user.getBestScore(),
                        user.getBestScoreDecks(),
                        user.getCreatedAt(), // Use account creation date
                        isCurrentUser
                );

                leaderboard.add(entry);
                rank++;
            }

            return ResponseEntity.ok(leaderboard);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get top 10 for quick display
     * GET /api/leaderboard/top10
     */
    @GetMapping("/top10")
    public ResponseEntity<?> getTop10() {
        return getLeaderboard(10);
    }
}