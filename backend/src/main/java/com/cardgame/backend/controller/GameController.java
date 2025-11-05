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
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})

public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameHistoryRepository gameHistoryRepository;

    /**
     * Start a new game
     * POST /api/game/start
     * Body: { "numDecks": 6 }
     */
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

    /**
     * Make a guess
     * POST /api/game/guess
     * Body: { "deckNumber": 1, "guess": "h" }
     */
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

    /**
     * Get current game state
     * GET /api/game/state
     */
    @GetMapping("/state")
    public ResponseEntity<GameState> getGameState() {
        GameState gameState = gameService.getCurrentGame();
        if (gameState == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(gameState);
    }

    /**
     * Get probabilities for a specific deck
     * GET /api/game/probability/{deckIndex}
     */
    @GetMapping("/probability/{deckIndex}")
    public ResponseEntity<ProbabilityInfo> getProbability(@PathVariable int deckIndex) {
        try {
            ProbabilityInfo probability = gameService.calculateProbability(deckIndex);
            return ResponseEntity.ok(probability);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get probabilities for all decks
     * GET /api/game/probabilities
     */
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

    /**
     * Reset/End current game
     * POST /api/game/reset
     */
    @PostMapping("/reset")
    public ResponseEntity<Void> resetGame() {
        gameService.resetGame();
        return ResponseEntity.ok().build();
    }

    /**
     * Health check endpoint
     * GET /api/game/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Card Game API is running");
        return ResponseEntity.ok(response);
    }

    /**
     * Save game result when game ends
     * POST /api/game/save
     * Body: { "score": 52, "numDecks": 6, "won": true }
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

            GameHistory history = new GameHistory(user, score, numDecks, won);
            gameHistoryRepository.save(history);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Game saved successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}