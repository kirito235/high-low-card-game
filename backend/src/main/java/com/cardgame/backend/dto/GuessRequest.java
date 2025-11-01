package com.cardgame.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuessRequest {
    private int deckNumber;
    private String guess;  // "h" or "l"

    public GuessRequest() {}

    public GuessRequest(int deckNumber, String guess) {
        this.deckNumber = deckNumber;
        this.guess = guess;
    }
}