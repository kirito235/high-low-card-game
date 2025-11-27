package com.cardgame.backend.dto;

public class LeaderboardEntry {

    private Long rank;
    private String username;
    private int score;
    private int longestStreak;
    private boolean isCurrentUser;
    private boolean statsPublic;
    private String avatar; // ✅ NEW

    public LeaderboardEntry() {}

    public LeaderboardEntry(Long rank, String username, int score, int longestStreak,
                            boolean isCurrentUser, boolean statsPublic, String avatar) {
        this.rank = rank;
        this.username = username;
        this.score = score;
        this.longestStreak = longestStreak;
        this.isCurrentUser = isCurrentUser;
        this.statsPublic = statsPublic;
        this.avatar = avatar;
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

    public boolean isStatsPublic() {
        return statsPublic;
    }

    public void setStatsPublic(boolean statsPublic) {
        this.statsPublic = statsPublic;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}