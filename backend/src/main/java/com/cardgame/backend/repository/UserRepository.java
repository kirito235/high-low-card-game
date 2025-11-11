package com.cardgame.backend.repository;

import com.cardgame.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    // ✅ OLD: Only users with score > 0
    List<User> findAllByBestScoreGreaterThanOrderByBestScoreDesc(int score);

    // ✅ NEW: Include users with score >= 0, exclude guests
    List<User> findAllByBestScoreGreaterThanEqualAndIsGuestFalseOrderByBestScoreDesc(int score);

    // ✅ UPDATED: Get user's rank by counting users with higher scores
    @Query("SELECT COUNT(u) FROM User u WHERE u.bestScore > :bestScore AND u.isGuest = false")
    Long getUserRankByBestScore(int bestScore);
}