package com.cardgame.backend.service;

import com.cardgame.backend.model.GameState;
import com.cardgame.backend.model.ProbabilityInfo;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Getter
public class GameService {

    private static final int TOTAL_CARDS = 52;
    private final Random rand = new Random();

    private GameState currentGame;

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
        var cards = initializeCards();
        currentGame.setRemainingCards(cards);

        // Initialize deck values (top card for each deck)
        var deckValues = new ArrayList<String>();
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
    private Map<String, List<String>> initializeCards() {
        Map<String, List<String>> cards = new HashMap<>();
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
    private String drawRandomCard(Map<String, List<String>> cards) {
        var suitList = new ArrayList<>(cards.keySet());

        if (suitList.isEmpty()) {
            return null;
        }

        var randomSuit = suitList.get(rand.nextInt(suitList.size()));
        var suitCards = cards.get(randomSuit);
        var pickedCard = suitCards.remove(rand.nextInt(suitCards.size()));

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
        var newCard = drawRandomCard(currentGame.getRemainingCards());

        // Calculate score FIRST
        int remainingCardsCount = getDeckSize(currentGame.getRemainingCards());
        int score = TOTAL_CARDS - remainingCardsCount;

        // Check if all 52 cards have been drawn (player wins)
        if (score >= TOTAL_CARDS) {
            currentGame.setScore(TOTAL_CARDS);
            currentGame.setGameOver(true);
            currentGame.setWon(true);
            currentGame.setMessage("🎉 Congratulations! You won! You guessed all 52 cards! 🎉");
            return currentGame;
        }

        // Check if deck is empty (shouldn't happen, but safety check)
        if (newCard == null) {
            currentGame.setScore(score);
            currentGame.setGameOver(true);
            currentGame.setWon(true);
            currentGame.setMessage("🎉 Congratulations! You won! All cards have been guessed! 🎉");
            return currentGame;
        }
        // Check if guess is correct
        boolean correct = checkGuess(topCard, newCard, guess);

        // Calculate score
        currentGame.setScore(score);

        if (correct) {
            // Update the deck with new card
            currentGame.getDeckValues().set(deckNumber - 1, newCard);
            currentGame.setMessage("Correct! The new card was " + newCard + ". Your score: " + score);
        } else {
            // Eliminate the deck
            currentGame.getDeckValues().set(deckNumber - 1, "XX");
            currentGame.setMessage("Wrong! The card was " + newCard + ". Deck " + deckNumber + " eliminated. Your score: " + score);
        }

        // Check if all decks are eliminated (game over)
        boolean allEliminated = currentGame.getDeckValues().stream()
                .allMatch(val -> val.equalsIgnoreCase("XX"));

        if (allEliminated) {
            currentGame.setGameOver(true);
            currentGame.setWon(false);
            currentGame.setMessage(currentGame.getMessage() + " Game Over! All decks eliminated. Final score: " + score);
        }

        return currentGame;
    }

    /**
     * Check if the guess is correct
     */
    private boolean checkGuess(String topCard, String newCard, String guess) {
        int topValue = getCardValue(topCard);
        int newValue = getCardValue(newCard);

        // Equal cards are treated as wrong
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
    private int getDeckSize(Map<String, List<String>> cards) {
        int size = 0;
        for (var list : cards.values()) {
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

        var cards = currentGame.getRemainingCards();

        for (var list : cards.values()) {
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
     * Reset game
     */
    public void resetGame() {
        this.currentGame = null;
    }
}