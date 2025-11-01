package com.cardgame.backend.model;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class GameState {
    private Map<String, List<String>> remainingCards;
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
}