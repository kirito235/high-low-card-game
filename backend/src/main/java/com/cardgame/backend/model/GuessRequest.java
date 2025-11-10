package com.cardgame.backend.model;

public class GuessRequest {
    private int deckNumber;
    private String guess;  // "h" or "l"

    public GuessRequest() {}

    public GuessRequest(int deckNumber, String guess) {
        this.deckNumber = deckNumber;
        this.guess = guess;
    }



    public int getDeckNumber() {
        return deckNumber;
    }

    public void setDeckNumber(int deckNumber) {
        this.deckNumber = deckNumber;
    }

    public String getGuess() {
        return guess;
    }

    public void setGuess(String guess) {
        this.guess = guess;
    }
}