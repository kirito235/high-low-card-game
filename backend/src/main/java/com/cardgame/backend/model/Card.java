package com.cardgame.backend.model;

public class Card {
    private String value;  // A, 2, 3, ..., K
    private String suit;   // S, C, H, D

    public Card() {}

    public Card(String value, String suit) {
        this.value = value;
        this.suit = suit;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getSuit() {
        return suit;
    }

    public void setSuit(String suit) {
        this.suit = suit;
    }

    public String getCardString() {
        return value + suit;
    }

    public int getNumericValue() {
        switch (value) {
            case "A": return 1;
            case "J": return 11;
            case "Q": return 12;
            case "K": return 13;
            case "X": return 0;
            default: return Integer.parseInt(value);
        }
    }

    @Override
    public String toString() {
        return value + suit;
    }
}