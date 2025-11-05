package com.cardgame.backend.dto;

import java.time.LocalDateTime;

public class LeaderboardEntry {

    private Long rank;
    private String username;
    private int score;
    private int numDecks;
    private LocalDateTime playedAt;
    private boolean isCurrentUser;

    public LeaderboardEntry() {}

    public LeaderboardEntry(Long rank, String username, int score, int numDecks,
                            LocalDateTime playedAt, boolean isCurrentUser) {
        this.rank = rank;
        this.username = username;
        this.score = score;
        this.numDecks = numDecks;
        this.playedAt = playedAt;
        this.isCurrentUser = isCurrentUser;
    }

    // Getters and Setters
    public Long getRank() {
        return rank;
    }

    public void setRank(Long rank) {
        this.rank = rank;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public LocalDateTime getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }

    public boolean isCurrentUser() {
        return isCurrentUser;
    }

    public void setCurrentUser(boolean currentUser) {
        isCurrentUser = currentUser;
    }
}