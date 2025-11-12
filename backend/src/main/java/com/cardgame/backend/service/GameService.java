package com.cardgame.backend.service;

import com.cardgame.backend.model.GameState;
import com.cardgame.backend.model.ProbabilityInfo;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.*;

@Service
@SessionScope // ✅ CRITICAL: Each user gets their own instance
public class GameService {

    private static final int TOTAL_CARDS = 52;
    private GameState currentGame;

    public GameService() {
        this.currentGame = null;
    }

    /**
     * Calculate score multiplier based on number of decks
     * Fewer decks = Higher difficulty = Higher multiplier
     */
    private double getScoreMultiplier(int numDecks) {
        switch (numDecks) {
            case 6: return 2.0;  // Hardest
            case 7: return 1.8;
            case 8: return 1.5;
            case 9: return 1.2;
            case 10: return 1.0; // Easiest
            default: return 1.0;
        }
    }

    /**
     * Initialize a new game with specified number of decks
     */
    public GameState startNewGame(int numDecks) {
        if (numDecks < 6 || numDecks > 10) {
            throw new IllegalArgumentException("Number of decks must be between 6 and 10");
        }

        currentGame = new GameState();
        currentGame.setNumDecks(numDecks);

        // Initialize the card deck
        HashMap<String, ArrayList<String>> cards = initializeCards();
        currentGame.setRemainingCards(cards);

        // Initialize deck values (top card for each deck)
        List<String> deckValues = new ArrayList<>();
        for (int i = 0; i < numDecks; i++) {
            deckValues.add(drawRandomCard(cards));
        }
        currentGame.setDeckValues(deckValues);
        currentGame.setScore(0);
        currentGame.setMessage("Game started! Choose a deck and guess high or low.");

        return currentGame;
    }

    /**
     * Initialize all 52 cards
     */
    private HashMap<String, ArrayList<String>> initializeCards() {
        HashMap<String, ArrayList<String>> cards = new HashMap<>();
        String[] suits = {"S", "C", "H", "D"};
        String[] values = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"};

        for (String suit : suits) {
            ArrayList<String> list = new ArrayList<>();
            for (String value : values) {
                list.add(value + suit);
            }
            cards.put(suit, list);
        }

        return cards;
    }

    /**
     * Draw a random card from remaining cards
     */
    private String drawRandomCard(HashMap<String, ArrayList<String>> cards) {
        Random rand = new Random();
        ArrayList<String> suitList = new ArrayList<>(cards.keySet());

        if (suitList.isEmpty()) {
            return null;
        }

        String randomSuit = suitList.get(rand.nextInt(suitList.size()));
        ArrayList<String> suitCards = cards.get(randomSuit);
        String pickedCard = suitCards.remove(rand.nextInt(suitCards.size()));

        // Remove suit if empty
        if (suitCards.isEmpty()) {
            cards.remove(randomSuit);
        }

        return pickedCard;
    }

    /**
     * Process a player's guess
     */
    public GameState processGuess(int deckNumber, String guess) {
        if (currentGame == null) {
            throw new IllegalStateException("No game in progress. Start a new game first.");
        }

        if (currentGame.isGameOver()) {
            return currentGame;
        }

        // Validate deck number
        if (deckNumber < 1 || deckNumber > currentGame.getNumDecks()) {
            currentGame.setMessage("Invalid deck number");
            return currentGame;
        }

        // Check if deck is already used
        String topCard = currentGame.getDeckValues().get(deckNumber - 1);
        if (topCard.equalsIgnoreCase("XX")) {
            currentGame.setMessage("Deck " + deckNumber + " is already eliminated. Choose another deck.");
            return currentGame;
        }

        // Draw new card
        String newCard = drawRandomCard(currentGame.getRemainingCards());

        // Calculate base score
        int remainingCardsCount = getDeckSize(currentGame.getRemainingCards());
        int baseScore = TOTAL_CARDS - remainingCardsCount;

        // Apply multiplier
        double multiplier = getScoreMultiplier(currentGame.getNumDecks());
        int finalScore = (int) Math.round(baseScore * multiplier);

        // Check if guess is correct
        boolean correct = checkGuess(topCard, newCard, guess);

        // Check if all 52 cards have been drawn (player wins)
        if (baseScore >= TOTAL_CARDS || remainingCardsCount == 0) {
            currentGame.setScore(finalScore);
            currentGame.setGameOver(true);
            currentGame.setWon(true);

            if (correct) {
                currentGame.getDeckValues().set(deckNumber - 1, newCard);
                currentGame.setMessage("🎉 Congratulations! You won! The final card was " + newCard +
                        ". Final score: " + finalScore + " (Multiplier: " + multiplier + "x) 🎉");
            } else {
                currentGame.getDeckValues().set(deckNumber - 1, "XX");
                currentGame.setMessage("🎉 Congratulations! You won! The final card was " + newCard +
                        ". Final score: " + finalScore + " (Multiplier: " + multiplier + "x) 🎉");
            }

            return currentGame;
        }

        // Check if deck is empty
        if (newCard == null) {
            currentGame.setScore(finalScore);
            currentGame.setGameOver(true);
            currentGame.setWon(true);
            currentGame.setMessage("🎉 Congratulations! You won! All cards have been guessed! Final score: " + finalScore);
            return currentGame;
        }

        // Update score
        currentGame.setScore(finalScore);

        if (correct) {
            currentGame.getDeckValues().set(deckNumber - 1, newCard);
            currentGame.setMessage("Correct! The new card was " + newCard + ". Your score: " + finalScore);
        } else {
            currentGame.getDeckValues().set(deckNumber - 1, "XX");
            currentGame.setMessage("Wrong! The card was " + newCard + ". Deck " + deckNumber + " eliminated. Your score: " + finalScore);
        }

        // Check if all decks are eliminated
        boolean allEliminated = currentGame.getDeckValues().stream()
                .allMatch(val -> val.equalsIgnoreCase("XX"));

        if (allEliminated) {
            currentGame.setGameOver(true);
            currentGame.setWon(false);
            currentGame.setMessage(currentGame.getMessage() + " Game Over! All decks eliminated. Final score: " + finalScore);
        }

        return currentGame;
    }

    /**
     * Check if the guess is correct
     */
    private boolean checkGuess(String topCard, String newCard, String guess) {
        int topValue = getCardValue(topCard);
        int newValue = getCardValue(newCard);

        if (topValue == newValue) {
            return true;
        }

        if (guess.equalsIgnoreCase("h") || guess.equalsIgnoreCase("high")) {
            return newValue > topValue;
        } else if (guess.equalsIgnoreCase("l") || guess.equalsIgnoreCase("low")) {
            return newValue < topValue;
        }

        return false;
    }

    /**
     * Get numeric value of a card
     */
    private int getCardValue(String card) {
        if (card.equalsIgnoreCase("XX")) {
            return 0;
        }

        String value = card.substring(0, card.length() - 1);
        switch (value) {
            case "A": return 1;
            case "J": return 11;
            case "Q": return 12;
            case "K": return 13;
            case "X": return 0;
            default:
                try {
                    return Integer.parseInt(value);
                } catch (NumberFormatException e) {
                    return 0;
                }
        }
    }

    /**
     * Get total remaining cards
     */
    private int getDeckSize(HashMap<String, ArrayList<String>> cards) {
        int size = 0;
        for (ArrayList<String> list : cards.values()) {
            size += list.size();
        }
        return size;
    }

    /**
     * Calculate probability for a specific deck
     */
    public ProbabilityInfo calculateProbability(int deckIndex) {
        if (currentGame == null) {
            return new ProbabilityInfo(0, 0, 0, 0);
        }

        String topCard = currentGame.getDeckValues().get(deckIndex);

        if (topCard.equalsIgnoreCase("XX")) {
            return new ProbabilityInfo(0, 0, 0, 0);
        }

        int topValue = getCardValue(topCard);
        int higherCount = 0;
        int lowerCount = 0;
        int equalCount = 0;

        HashMap<String, ArrayList<String>> cards = currentGame.getRemainingCards();

        for (ArrayList<String> list : cards.values()) {
            for (String card : list) {
                int cardValue = getCardValue(card);
                if (cardValue > topValue) {
                    higherCount++;
                } else if (cardValue < topValue) {
                    lowerCount++;
                } else {
                    equalCount++;
                }
            }
        }

        int total = getDeckSize(cards);
        return new ProbabilityInfo(higherCount, lowerCount, equalCount, total);
    }

    /**
     * Get current game state
     */
    public GameState getCurrentGame() {
        return currentGame;
    }

    /**
     * Reset game
     */
    public void resetGame() {
        this.currentGame = null;
    }
}