package com.cardgame.backend.controller;

import com.cardgame.backend.dto.GameHistoryResponse;
import com.cardgame.backend.dto.UserStatsResponse;
import com.cardgame.backend.model.GameHistory;
import com.cardgame.backend.model.User;
import com.cardgame.backend.repository.GameHistoryRepository;
import com.cardgame.backend.repository.UserRepository;
import com.cardgame.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://higherlowercardgame.onrender.com"
        },
        allowCredentials = "true"
)

public class StatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameHistoryRepository gameHistoryRepository;

    /**
     * Get current user's statistics
     * GET /api/stats/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyStats() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            long totalGames = gameHistoryRepository.countByUser(user);
            long gamesWon = gameHistoryRepository.countByUserAndWonTrue(user);
            double winRate = totalGames > 0 ? (double) gamesWon / totalGames * 100 : 0.0;

            Integer bestScore = user.getBestScore() != null ? user.getBestScore() : 0;
            Double averageScore = gameHistoryRepository.findAvgScoreByUser(user);

            Long userRank = userRepository.getUserRankByBestScore(bestScore);
            userRank = (userRank != null) ? userRank + 1 : null;

            UserStatsResponse stats = new UserStatsResponse(
                    user.getId(),
                    user.getUsername(),
                    totalGames,
                    gamesWon,
                    Math.round(winRate * 10.0) / 10.0,
                    bestScore,
                    averageScore != null ? Math.round(averageScore * 10.0) / 10.0 : 0.0,
                    userRank,
                    user.getCurrentWinStreak() != null ? user.getCurrentWinStreak() : 0,
                    user.getLongestWinStreak() != null ? user.getLongestWinStreak() : 0
            );

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get current user's game history
     * GET /api/stats/history
     */
    @GetMapping("/history")
    public ResponseEntity<?> getMyHistory() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<GameHistory> history = gameHistoryRepository.findByUserOrderByPlayedAtDesc(user);

            List<GameHistoryResponse> response = history.stream()
                    .map(game -> new GameHistoryResponse(
                            game.getId(),
                            game.getScore(),
                            game.getNumDecks(),
                            game.isWon(),
                            game.getPlayedAt(),
                            game.getDurationSeconds()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * ✅ UPDATED: Get stats for a specific user with privacy check
     * GET /api/stats/user/{username}
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserStats(@PathVariable String username) {
        try {
            User targetUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // ✅ Check if requesting user is authenticated
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = null;
            if (authentication != null && authentication.isAuthenticated()) {
                try {
                    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                    currentUsername = userDetails.getUsername();
                } catch (Exception e) {
                    // Not authenticated or error
                }
            }

            // ✅ Check if stats are private and viewer is not the owner
            boolean isOwnProfile = currentUsername != null && currentUsername.equals(username);
            boolean statsPublic = targetUser.getStatsPublic() != null ? targetUser.getStatsPublic() : true;

            if (!isOwnProfile && !statsPublic) {
                // ✅ Return 403 Forbidden for private profiles
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "STATS_PRIVATE");
                errorResponse.put("message", "This user's stats are private");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            long totalGames = gameHistoryRepository.countByUser(targetUser);
            long gamesWon = gameHistoryRepository.countByUserAndWonTrue(targetUser);
            double winRate = totalGames > 0 ? (double) gamesWon / totalGames * 100 : 0.0;

            Integer bestScore = targetUser.getBestScore() != null ? targetUser.getBestScore() : 0;
            Integer bestScoreDecks = targetUser.getBestScoreDecks() != null ? targetUser.getBestScoreDecks() : 0;

            Double averageScore = gameHistoryRepository.findAvgScoreByUser(targetUser);
            averageScore = averageScore != null ? Math.round(averageScore * 10.0) / 10.0 : 0.0;

            Long userRank = userRepository.getUserRankByBestScore(bestScore);
            userRank = (userRank != null) ? userRank + 1 : null;

            Integer currentStreak = targetUser.getCurrentWinStreak() != null ? targetUser.getCurrentWinStreak() : 0;
            Integer longestStreak = targetUser.getLongestWinStreak() != null ? targetUser.getLongestWinStreak() : 0;

            UserStatsResponse stats = new UserStatsResponse(
                    targetUser.getId(),
                    targetUser.getUsername(),
                    totalGames,
                    gamesWon,
                    Math.round(winRate * 10.0) / 10.0,
                    bestScore,
                    averageScore,
                    userRank,
                    currentStreak,
                    longestStreak
            );

            // ✅ Include statsPublic flag in response
            Map<String, Object> response = new HashMap<>();
            response.put("userId", stats.getUserId());
            response.put("username", stats.getUsername());
            response.put("totalGames", stats.getTotalGames());
            response.put("gamesWon", stats.getGamesWon());
            response.put("winRate", stats.getWinRate());
            response.put("bestScore", stats.getBestScore());
            response.put("averageScore", stats.getAverageScore());
            response.put("userRank", stats.getUserRank());
            response.put("currentWinStreak", stats.getCurrentWinStreak());
            response.put("longestWinStreak", stats.getLongestWinStreak());
            response.put("statsPublic", statsPublic);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}