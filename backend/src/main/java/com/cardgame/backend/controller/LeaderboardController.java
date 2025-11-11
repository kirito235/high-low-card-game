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

@CrossOrigin(
        origins = { "http://localhost:3000", "https://higherlowercardgame.onrender.com" },
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserRepository userRepository;

    /**
     * ✅ UPDATED: Get global leaderboard with best score and longest streak
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

            // Get all non-guest users sorted by best score
            List<User> topUsers = userRepository.findAllByBestScoreGreaterThanEqualAndIsGuestFalseOrderByBestScoreDesc(0);

            // Limit results
            if (topUsers.size() > limit) {
                topUsers = topUsers.subList(0, limit);
            }

            List<LeaderboardEntry> leaderboard = new ArrayList<>();
            long rank = 1;

            for (User user : topUsers) {
                boolean isCurrentUser = currentUsername != null
                        && user.getUsername().equals(currentUsername);

                // ✅ UPDATED: Include score and longest streak instead of decks and date
                LeaderboardEntry entry = new LeaderboardEntry(
                        rank,
                        user.getUsername(),
                        user.getBestScore(),
                        user.getLongestWinStreak() != null ? user.getLongestWinStreak() : 0,
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

    @GetMapping("/top10")
    public ResponseEntity<?> getTop10() {
        return getLeaderboard(10);
    }
}