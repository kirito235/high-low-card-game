package com.cardgame.backend.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GameState {
    private Map<String, ArrayList<String>> remainingCards;
    private List<String> deckValues;  // Current top card of each deck
    private int numDecks;
    private int score;
    private boolean gameOver;
    private boolean won;
    private String message;

    public GameState() {
        this.remainingCards = new HashMap<>();
        this.deckValues = new ArrayList<>();
        this.gameOver = false;
        this.won = false;
    }

    // Getters and Setters
    public Map<String, ArrayList<String>> getRemainingCards() {
        return remainingCards;
    }

    public void setRemainingCards(Map<String, ArrayList<String>> remainingCards) {
        this.remainingCards = remainingCards;
    }

    public List<String> getDeckValues() {
        return deckValues;
    }

    public void setDeckValues(List<String> deckValues) {
        this.deckValues = deckValues;
    }

    public int getNumDecks() {
        return numDecks;
    }

    public void setNumDecks(int numDecks) {
        this.numDecks = numDecks;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public void setGameOver(boolean gameOver) {
        this.gameOver = gameOver;
    }

    public boolean isWon() {
        return won;
    }

    public void setWon(boolean won) {
        this.won = won;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}