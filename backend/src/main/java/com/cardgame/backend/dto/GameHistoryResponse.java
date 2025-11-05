package com.cardgame.backend.dto;

import java.time.LocalDateTime;

public class GameHistoryResponse {

    private Long id;
    private int score;
    private int numDecks;
    private boolean won;
    private LocalDateTime playedAt;
    private Long durationSeconds;

    public GameHistoryResponse() {}

    public GameHistoryResponse(Long id, int score, int numDecks, boolean won,
                               LocalDateTime playedAt, Long durationSeconds) {
        this.id = id;
        this.score = score;
        this.numDecks = numDecks;
        this.won = won;
        this.playedAt = playedAt;
        this.durationSeconds = durationSeconds;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getNumDecks() {
        return numDecks;
    }

    public void setNumDecks(int numDecks) {
        this.numDecks = numDecks;
    }

    public boolean isWon() {
        return won;
    }

    public void setWon(boolean won) {
        this.won = won;
    }

    public LocalDateTime getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
}