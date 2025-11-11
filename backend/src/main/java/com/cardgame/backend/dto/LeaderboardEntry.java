package com.cardgame.backend.dto;

import java.time.LocalDateTime;

public class LeaderboardEntry {

    private Long rank;
    private String username;
    private int score; // Total accumulated score
    private int longestStreak; // ✅ NEW: Highest win streak
    private boolean isCurrentUser;

    public LeaderboardEntry() {}

    public LeaderboardEntry(Long rank, String username, int score, int longestStreak, boolean isCurrentUser) {
        this.rank = rank;
        this.username = username;
        this.score = score;
        this.longestStreak = longestStreak;
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

    public int getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(int longestStreak) {
        this.longestStreak = longestStreak;
    }

    public boolean isCurrentUser() {
        return isCurrentUser;
    }

    public void setCurrentUser(boolean currentUser) {
        isCurrentUser = currentUser;
    }
}