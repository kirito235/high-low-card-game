package com.cardgame.backend.controller;

import com.cardgame.backend.model.GameState;
import com.cardgame.backend.model.GuessRequest;
import com.cardgame.backend.model.ProbabilityInfo;
import com.cardgame.backend.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.cardgame.backend.model.GameHistory;
import com.cardgame.backend.model.User;
import com.cardgame.backend.repository.GameHistoryRepository;
import com.cardgame.backend.repository.UserRepository;
import com.cardgame.backend.security.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(
        origins = { "http://localhost:3000", "https://higherlowercardgame.onrender.com" },
        allowCredentials = "true"
)
public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameHistoryRepository gameHistoryRepository;

    @PostMapping("/start")
    public ResponseEntity<GameState> startGame(@RequestBody Map<String, Integer> request) {
        try {
            int numDecks = request.get("numDecks");
            GameState gameState = gameService.startNewGame(numDecks);
            return ResponseEntity.ok(gameState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/guess")
    public ResponseEntity<GameState> makeGuess(@RequestBody GuessRequest request) {
        try {
            GameState gameState = gameService.processGuess(
                    request.getDeckNumber(),
                    request.getGuess()
            );
            return ResponseEntity.ok(gameState);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/state")
    public ResponseEntity<GameState> getGameState() {
        GameState gameState = gameService.getCurrentGame();
        if (gameState == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(gameState);
    }

    @GetMapping("/probability/{deckIndex}")
    public ResponseEntity<ProbabilityInfo> getProbability(@PathVariable int deckIndex) {
        try {
            ProbabilityInfo probability = gameService.calculateProbability(deckIndex);
            return ResponseEntity.ok(probability);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/probabilities")
    public ResponseEntity<Map<Integer, ProbabilityInfo>> getAllProbabilities() {
        GameState gameState = gameService.getCurrentGame();
        if (gameState == null) {
            return ResponseEntity.notFound().build();
        }

        Map<Integer, ProbabilityInfo> probabilities = new HashMap<>();
        for (int i = 0; i < gameState.getDeckValues().size(); i++) {
            ProbabilityInfo prob = gameService.calculateProbability(i);
            probabilities.put(i, prob);
        }

        return ResponseEntity.ok(probabilities);
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetGame() {
        gameService.resetGame();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Card Game API is running");
        return ResponseEntity.ok(response);
    }

    /**
     * ✅ FIXED: Save game result - ALWAYS updates points (win or loss)
     * Best score is updated regardless of win/loss if current score is higher
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveGameResult(@RequestBody Map<String, Object> gameResult) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            int score = (Integer) gameResult.get("score");
            int numDecks = (Integer) gameResult.get("numDecks");
            boolean won = (Boolean) gameResult.get("won");

            // ✅ Save to game history (keep full history)
            GameHistory history = new GameHistory(user, score, numDecks, won);
            gameHistoryRepository.save(history);

            // ✅ ALWAYS add current game score to total points (win or loss)
            int currentBest = user.getBestScore() != null ? user.getBestScore() : 0;
            user.setBestScore(currentBest + score);

            // ✅ Update win streak (only for wins)
            if (won) {
                user.setCurrentWinStreak(user.getCurrentWinStreak() + 1);

                // Update longest streak if current exceeds it
                if (user.getCurrentWinStreak() > user.getLongestWinStreak()) {
                    user.setLongestWinStreak(user.getCurrentWinStreak());
                }

                // Update deck count for wins
                if (currentBest == 0) {
                    user.setBestScoreDecks(numDecks);
                }
            } else {
                user.setCurrentWinStreak(0); // Reset streak on loss

                // ✅ Update deck count even on loss if first game or better score
                if (currentBest == 0 || score > (currentBest - score)) {
                    user.setBestScoreDecks(numDecks);
                }
            }

            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Game saved successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}