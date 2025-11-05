package com.cardgame.backend.controller;

import com.cardgame.backend.dto.LeaderboardEntry;
import com.cardgame.backend.model.GameHistory;
import com.cardgame.backend.repository.GameHistoryRepository;
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
    private GameHistoryRepository gameHistoryRepository;

    /**
     * Get global leaderboard - top 100 scores
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

            List<GameHistory> topGames = gameHistoryRepository.findTopScores();

            // Limit results
            if (topGames.size() > limit) {
                topGames = topGames.subList(0, limit);
            }

            List<LeaderboardEntry> leaderboard = new ArrayList<>();
            long rank = 1;

            for (GameHistory game : topGames) {
                boolean isCurrentUser = currentUsername != null
                        && game.getUser().getUsername().equals(currentUsername);

                LeaderboardEntry entry = new LeaderboardEntry(
                        rank,
                        game.getUser().getUsername(),
                        game.getScore(),
                        game.getNumDecks(),
                        game.getPlayedAt(),
                        isCurrentUser
                );

                leaderboard.add(entry);
                rank++;
            }

            return ResponseEntity.ok(leaderboard);

        } catch (Exception e) {
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