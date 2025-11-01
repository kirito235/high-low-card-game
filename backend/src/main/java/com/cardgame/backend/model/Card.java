package com.cardgame.backend.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Card {
    private String value;  // A, 2, 3, ..., K
    private String suit;   // S, C, H, D

    public Card() {}

    public Card(String value, String suit) {
        this.value = value;
        this.suit = suit;
    }

    public int getNumericValue() {
        return switch (value) {
            case "A" -> 1;
            case "J" -> 11;
            case "Q" -> 12;
            case "K" -> 13;
            case "X" -> 0;
            default -> Integer.parseInt(value);
        };
    }

    @Override
    public String toString() {
        return value + suit;
    }
}