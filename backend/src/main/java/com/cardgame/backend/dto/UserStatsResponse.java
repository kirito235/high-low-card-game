package com.cardgame.backend.dto;

public class UserStatsResponse {

    private Long userId;
    private String username;
    private long totalGames;
    private long gamesWon;
    private double winRate;
    private Integer bestScore;
    private Double averageScore;
    private Long userRank;
    private Integer currentWinStreak; // ✅ NEW
    private Integer longestWinStreak; // ✅ NEW

    public UserStatsResponse() {}

    public UserStatsResponse(Long userId, String username, long totalGames, long gamesWon,
                             double winRate, Integer bestScore, Double averageScore, Long userRank,
                             Integer currentWinStreak, Integer longestWinStreak) {
        this.userId = userId;
        this.username = username;
        this.totalGames = totalGames;
        this.gamesWon = gamesWon;
        this.winRate = winRate;
        this.bestScore = bestScore;
        this.averageScore = averageScore;
        this.userRank = userRank;
        this.currentWinStreak = currentWinStreak;
        this.longestWinStreak = longestWinStreak;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public long getTotalGames() {
        return totalGames;
    }

    public void setTotalGames(long totalGames) {
        this.totalGames = totalGames;
    }

    public long getGamesWon() {
        return gamesWon;
    }

    public void setGamesWon(long gamesWon) {
        this.gamesWon = gamesWon;
    }

    public double getWinRate() {
        return winRate;
    }

    public void setWinRate(double winRate) {
        this.winRate = winRate;
    }

    public Integer getBestScore() {
        return bestScore;
    }

    public void setBestScore(Integer bestScore) {
        this.bestScore = bestScore;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public Long getUserRank() {
        return userRank;
    }

    public void setUserRank(Long userRank) {
        this.userRank = userRank;
    }

    public Integer getCurrentWinStreak() {
        return currentWinStreak;
    }

    public void setCurrentWinStreak(Integer currentWinStreak) {
        this.currentWinStreak = currentWinStreak;
    }

    public Integer getLongestWinStreak() {
        return longestWinStreak;
    }

    public void setLongestWinStreak(Integer longestWinStreak) {
        this.longestWinStreak = longestWinStreak;
    }
}