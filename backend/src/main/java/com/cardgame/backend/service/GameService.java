package com.cardgame.backend.service;

import com.cardgame.backend.model.GameState;
import com.cardgame.backend.model.ProbabilityInfo;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.*;

@Service
@SessionScope
public class GameService {

    private static final int TOTAL_CARDS = 52;
    private GameState currentGame;

    public GameService() {
        this.currentGame = null;
    }

    /**
     * ✅ UPDATED: Calculate score multiplier based on number of decks
     */
    private double getDeckMultiplier(int numDecks) {
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
     * ✅ NEW: Calculate streak multiplier based on user's win streak
     */
    private double getStreakMultiplier(int winStreak) {
        if (winStreak < 2) return 1.0;
        // Starts at 1.1x for 2-game streak, increases by 0.05x per additional win
        return 1.0 + (0.05 * winStreak);
    }

    /**
     * ✅ NEW: Calculate bonus points for winning
     */
    private int getVictoryBonus(int numDecks, int winStreak) {
        int deckBonus = (11 - numDecks) * 50; // More bonus for harder difficulties
        int streakBonus = winStreak * 25; // 25 points per win in streak
        return deckBonus + streakBonus;
    }

    public GameState startNewGame(int numDecks) {
        if (numDecks < 6 || numDecks > 10) {
            throw new IllegalArgumentException("Number of decks must be between 6 and 10");
        }

        currentGame = new GameState();
        currentGame.setNumDecks(numDecks);

        HashMap<String, ArrayList<String>> cards = initializeCards();
        currentGame.setRemainingCards(cards);

        List<String> deckValues = new ArrayList<>();
        for (int i = 0; i < numDecks; i++) {
            deckValues.add(drawRandomCard(cards));
        }
        currentGame.setDeckValues(deckValues);
        currentGame.setScore(0);
        currentGame.setMessage("Game started! Choose a deck and guess high or low.");

        return currentGame;
    }

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

    private String drawRandomCard(HashMap<String, ArrayList<String>> cards) {
        Random rand = new Random();
        ArrayList<String> suitList = new ArrayList<>(cards.keySet());

        if (suitList.isEmpty()) {
            return null;
        }

        String randomSuit = suitList.get(rand.nextInt(suitList.size()));
        ArrayList<String> suitCards = cards.get(randomSuit);
        String pickedCard = suitCards.remove(rand.nextInt(suitCards.size()));

        if (suitCards.isEmpty()) {
            cards.remove(randomSuit);
        }

        return pickedCard;
    }

    /**
     * ✅ UPDATED: Process guess with win streak multiplier
     */
    public GameState processGuess(int deckNumber, String guess, int userWinStreak) {
        if (currentGame == null) {
            throw new IllegalStateException("No game in progress. Start a new game first.");
        }

        if (currentGame.isGameOver()) {
            return currentGame;
        }

        if (deckNumber < 1 || deckNumber > currentGame.getNumDecks()) {
            currentGame.setMessage("Invalid deck number");
            return currentGame;
        }

        String topCard = currentGame.getDeckValues().get(deckNumber - 1);
        if (topCard.equalsIgnoreCase("XX")) {
            currentGame.setMessage("Deck " + deckNumber + " is already eliminated. Choose another deck.");
            return currentGame;
        }

        String newCard = drawRandomCard(currentGame.getRemainingCards());

        // Calculate remaining cards
        int remainingCardsCount = getDeckSize(currentGame.getRemainingCards());

        // ✅ Calculate score with win streak multiplier
        int baseScore = TOTAL_CARDS - remainingCardsCount;
        double deckMultiplier = getDeckMultiplier(currentGame.getNumDecks());
        double streakMultiplier = getStreakMultiplier(userWinStreak);

        boolean correct = checkGuess(topCard, newCard, guess);

        int finalScore = (int) Math.round(baseScore * deckMultiplier * streakMultiplier);

        // Check win condition
        if (baseScore >= TOTAL_CARDS || remainingCardsCount == 0) {
            int victoryBonus = getVictoryBonus(currentGame.getNumDecks(), userWinStreak);
            finalScore += victoryBonus;

            currentGame.setScore(finalScore);
            currentGame.setGameOver(true);
            currentGame.setWon(true);

            if (correct) {
                currentGame.getDeckValues().set(deckNumber - 1, newCard);
                currentGame.setMessage(String.format(
                        "🎉 Victory! Final card: %s | Score: %d | Win Streak: %d (%.2fx multiplier) | Victory Bonus: +%d 🎉",
                        newCard, finalScore, userWinStreak, streakMultiplier, victoryBonus
                ));
            } else {
                currentGame.getDeckValues().set(deckNumber - 1, "XX");
                currentGame.setMessage(String.format(
                        "🎉 Victory! Final card: %s | Score: %d 🎉",
                        newCard, finalScore
                ));
            }

            return currentGame;
        }

        if (newCard == null) {
            int victoryBonus = getVictoryBonus(currentGame.getNumDecks(), userWinStreak);
            finalScore += victoryBonus;
            currentGame.setScore(finalScore);
            currentGame.setGameOver(true);
            currentGame.setWon(true);
            currentGame.setMessage(String.format(
                    "🎉 Victory! All cards guessed! Score: %d | Bonus: +%d 🎉",
                    finalScore, victoryBonus
            ));
            return currentGame;
        }

        currentGame.setScore(finalScore);

        if (correct) {
            currentGame.getDeckValues().set(deckNumber - 1, newCard);
            currentGame.setMessage(String.format(
                    "✅ Correct! New card: %s | Score: %d | Win Streak: %d (%.2fx multiplier)",
                    newCard, finalScore, userWinStreak, streakMultiplier
            ));
        } else {
            currentGame.getDeckValues().set(deckNumber - 1, "XX");
            currentGame.setMessage(String.format(
                    "❌ Wrong! Card: %s | Deck %d eliminated | Score: %d",
                    newCard, deckNumber, finalScore
            ));
        }

        // Check if all decks eliminated
        boolean allEliminated = currentGame.getDeckValues().stream()
                .allMatch(val -> val.equalsIgnoreCase("XX"));

        if (allEliminated) {
            currentGame.setGameOver(true);
            currentGame.setWon(false);
            currentGame.setMessage(currentGame.getMessage() + " | Game Over! All decks eliminated. Final score: " + finalScore);
        }

        return currentGame;
    }

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

    private int getDeckSize(HashMap<String, ArrayList<String>> cards) {
        int size = 0;
        for (ArrayList<String> list : cards.values()) {
            size += list.size();
        }
        return size;
    }

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

    public GameState getCurrentGame() {
        return currentGame;
    }

    public void resetGame() {
        this.currentGame = null;
    }
}