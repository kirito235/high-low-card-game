package com.cardgame.backend.repository;

import com.cardgame.backend.model.GameHistory;
import com.cardgame.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameHistoryRepository extends JpaRepository<GameHistory, Long> {

    // Get user's game history, ordered by most recent
    List<GameHistory> findByUserOrderByPlayedAtDesc(User user);

    // Get user's wins only
    List<GameHistory> findByUserAndWonTrueOrderByPlayedAtDesc(User user);

    // Count total games by user
    long countByUser(User user);

    // Count wins by user
    long countByUserAndWonTrue(User user);

    // Get user's best score
    @Query("SELECT MAX(g.score) FROM GameHistory g WHERE g.user = :user")
    Integer findMaxScoreByUser(User user);

    // Get user's average score
    @Query("SELECT AVG(g.score) FROM GameHistory g WHERE g.user = :user")
    Double findAvgScoreByUser(User user);

    // Global leaderboard - top scores
    @Query("SELECT g FROM GameHistory g WHERE g.won = true ORDER BY g.score DESC, g.playedAt DESC")
    List<GameHistory> findTopScores();

    // Get user's rank
    @Query("SELECT COUNT(DISTINCT g.user) FROM GameHistory g WHERE g.score > " +
            "(SELECT MAX(gh.score) FROM GameHistory gh WHERE gh.user = :user)")
    Long getUserRank(User user);
}