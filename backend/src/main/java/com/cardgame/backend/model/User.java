package com.cardgame.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String username;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider = AuthProvider.LOCAL;

    private String providerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private boolean isGuest = false;

    // ✅ NEW: Best score for leaderboard (instead of multiple entries)
    @Column(name = "best_score")
    private Integer bestScore = 0;

    // ✅ NEW: Number of decks used for best score
    @Column(name = "best_score_decks")
    private Integer bestScoreDecks = 0;

    // ✅ NEW: Win streak counter
    @Column(name = "current_win_streak")
    private Integer currentWinStreak = 0;

    // ✅ NEW: Longest win streak ever
    @Column(name = "longest_win_streak")
    private Integer longestWinStreak = 0;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<GameHistory> gameHistories = new HashSet<>();

    @Column(name = "stats_public")
    private Boolean statsPublic = true; // Default to public


    @Column(name = "avatar")
    private String avatar = "🎴"; // Default avatar



    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    // Add getter and setter:
    public Boolean getStatsPublic() {
        return statsPublic;
    }

    public void setStatsPublic(Boolean statsPublic) {
        this.statsPublic = statsPublic;
    }

    // Constructors
    public User() {
        this.createdAt = LocalDateTime.now();
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isGuest() {
        return isGuest;
    }

    public void setGuest(boolean guest) {
        isGuest = guest;
    }

    public Integer getBestScore() {
        return bestScore;
    }

    public void setBestScore(Integer bestScore) {
        this.bestScore = bestScore;
    }

    public Integer getBestScoreDecks() {
        return bestScoreDecks;
    }

    public void setBestScoreDecks(Integer bestScoreDecks) {
        this.bestScoreDecks = bestScoreDecks;
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

    public Set<GameHistory> getGameHistories() {
        return gameHistories;
    }

    public void setGameHistories(Set<GameHistory> gameHistories) {
        this.gameHistories = gameHistories;
    }
}