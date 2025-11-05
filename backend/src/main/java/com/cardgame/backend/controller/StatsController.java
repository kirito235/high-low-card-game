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

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/stats")
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

            // Calculate statistics
            long totalGames = gameHistoryRepository.countByUser(user);
            long gamesWon = gameHistoryRepository.countByUserAndWonTrue(user);
            double winRate = totalGames > 0 ? (double) gamesWon / totalGames * 100 : 0.0;
            Integer bestScore = gameHistoryRepository.findMaxScoreByUser(user);
            Double averageScore = gameHistoryRepository.findAvgScoreByUser(user);
            Long userRank = gameHistoryRepository.getUserRank(user);

            // Adjust rank (0 means #1)
            userRank = userRank != null ? userRank + 1 : null;

            UserStatsResponse stats = new UserStatsResponse(
                    user.getId(),
                    user.getUsername(),
                    totalGames,
                    gamesWon,
                    Math.round(winRate * 10.0) / 10.0, // Round to 1 decimal
                    bestScore != null ? bestScore : 0,
                    averageScore != null ? Math.round(averageScore * 10.0) / 10.0 : 0.0,
                    userRank
            );

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
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
     * Get stats for a specific user (by username)
     * GET /api/stats/user/{username}
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserStats(@PathVariable String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            long totalGames = gameHistoryRepository.countByUser(user);
            long gamesWon = gameHistoryRepository.countByUserAndWonTrue(user);
            double winRate = totalGames > 0 ? (double) gamesWon / totalGames * 100 : 0.0;
            Integer bestScore = gameHistoryRepository.findMaxScoreByUser(user);
            Double averageScore = gameHistoryRepository.findAvgScoreByUser(user);
            Long userRank = gameHistoryRepository.getUserRank(user);
            userRank = userRank != null ? userRank + 1 : null;

            UserStatsResponse stats = new UserStatsResponse(
                    user.getId(),
                    user.getUsername(),
                    totalGames,
                    gamesWon,
                    Math.round(winRate * 10.0) / 10.0,
                    bestScore != null ? bestScore : 0,
                    averageScore != null ? Math.round(averageScore * 10.0) / 10.0 : 0.0,
                    userRank
            );

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}