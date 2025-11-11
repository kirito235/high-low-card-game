import React, { useState, useEffect } from 'react';
import Card from './Card';
import DeckDisplay from './DeckDisplay';
import gameService from '../services/gameService';
import Confetti from 'react-confetti';
import '../styles/GameBoard.css';
import statsService from '../services/statsService';
import Toast from "./Toast";

const TOTAL_HINTS = 3;
const ROUNDS_PER_HINT = 3;

const convertCardNamesInMessage = (message) => {
  const cardPattern = /\b([2-9]|10|[AJQK])([SHDC])\b/g;

  const valueMap = {
    'A': 'Ace', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
    '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine', '10': 'Ten',
    'J': 'Jack', 'Q': 'Queen', 'K': 'King'
  };

  const suitMap = {
    'S': 'Spades', 'H': 'Hearts', 'D': 'Diamonds', 'C': 'Clubs'
  };

  return message.replace(cardPattern, (match, value, suit) => {
    return `${valueMap[value]} of ${suitMap[suit]}`;
  });
};

const GameBoard = () => {
  const [gameState, setGameState] = useState(null);
  const [probabilities, setProbabilities] = useState({});
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [numDecks, setNumDecks] = useState(6);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastDrawnCard, setLastDrawnCard] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintsRoundsLeft, setHintsRoundsLeft] = useState(0);
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isBackendLoading, setIsBackendLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const [showStatsPopup, setShowStatsPopup] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [currentGameScore, setCurrentGameScore] = useState(0); // ✅ NEW

  useEffect(() => {
    const keepAwake = setInterval(async () => {
      try {
        await gameService.healthCheck();
        console.log('✅ Backend pinged - staying awake');
      } catch (error) {
        console.log('❌ Backend ping failed:', error);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(keepAwake);
  }, []);

  useEffect(() => {
    const wakeBackend = async () => {
      setIsBackendLoading(true);
      try {
        await gameService.healthCheck();
        console.log('🚀 Backend woke up on page load');
        setIsBackendLoading(false);
      } catch (error) {
        console.log('⏳ Backend is waking up...');
        setTimeout(async () => {
          try {
            await gameService.healthCheck();
            console.log('🚀 Backend woke up after retry');
            setIsBackendLoading(false);
          } catch (err) {
            console.log('⏳ Still waiting for backend...');
            setIsBackendLoading(false);
          }
        }, 2000);
      }
    };

    wakeBackend();
  }, []);

  useEffect(() => {
    if (!isStarted && !loading) {
      const handleStartScreenKeys = (event) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setNumDecks(prev => Math.min(10, prev + 1));
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          setNumDecks(prev => Math.max(6, prev - 1));
        } else if (event.key === 'Enter') {
          event.preventDefault();
          startGame();
        }
      };

      window.addEventListener('keydown', handleStartScreenKeys);
      return () => window.removeEventListener('keydown', handleStartScreenKeys);
    }
  }, [isStarted, loading, numDecks]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isStarted || gameState?.gameOver || loading) {
        return;
      }

      if (event.key >= '1' && event.key <= '9') {
        const deckIndex = parseInt(event.key) - 1;
        if (gameState?.deckValues && deckIndex < gameState.deckValues.length) {
          const deckValue = gameState.deckValues[deckIndex];
          if (deckValue !== 'XX') {
            event.preventDefault();
            setSelectedDeck(deckIndex);
          }
        }
      }

      if (event.key === '0') {
        const deckIndex = 9;
        if (gameState?.deckValues && deckIndex < gameState.deckValues.length) {
          const deckValue = gameState.deckValues[deckIndex];
          if (deckValue !== 'XX') {
            event.preventDefault();
            setSelectedDeck(deckIndex);
          }
        }
      }

      if (event.key === 'ArrowLeft' && selectedDeck !== null) {
        event.preventDefault();
        moveSelection(-1);
      }

      if (event.key === 'ArrowRight' && selectedDeck !== null) {
        event.preventDefault();
        moveSelection(1);
      }

      if ((event.key === 'ArrowUp' || event.key.toLowerCase() === 'h') && selectedDeck !== null) {
        event.preventDefault();
        makeGuess('h');
      }

      if ((event.key === 'ArrowDown' || event.key.toLowerCase() === 'l') && selectedDeck !== null) {
        event.preventDefault();
        makeGuess('l');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isStarted, gameState, selectedDeck, loading]);

  const moveSelection = (direction) => {
    if (!gameState || selectedDeck === null) return;

    let newIndex = selectedDeck + direction;
    const totalDecks = gameState.deckValues.length;

    if (newIndex < 0) newIndex = totalDecks - 1;
    if (newIndex >= totalDecks) newIndex = 0;

    let attempts = 0;
    while (gameState.deckValues[newIndex] === 'XX' && attempts < totalDecks) {
      newIndex += direction;
      if (newIndex < 0) newIndex = totalDecks - 1;
      if (newIndex >= totalDecks) newIndex = 0;
      attempts++;
    }

    if (gameState.deckValues[newIndex] !== 'XX') {
      setSelectedDeck(newIndex);
    }
  };

  const startGame = async () => {
    setLoading(true);
    setMessage('Starting game... (First load may take ~30 seconds if backend was sleeping)');

    try {
      const state = await gameService.startGame(numDecks);
      setGameState(state);
      setIsStarted(true);
      setMessage(convertCardNamesInMessage(state.message));
      setLastDrawnCard(null);
      setHintsLeft(TOTAL_HINTS);
      setHintsRoundsLeft(0);
      setShowProbabilities(false);
      setCurrentGameScore(0); // ✅ Reset game score

      if (state.deckValues && state.deckValues.length > 0) {
        setSelectedDeck(0);
      }

      await new Promise(resolve => setTimeout(resolve, 250));
      await loadProbabilities();
    } catch (error) {
      setMessage('Error starting game. Please wait 30 seconds and try again.');
    }
    setLoading(false);
  };

  const loadProbabilities = async () => {
    try {
      const probs = await gameService.getProbabilities();
      setProbabilities(probs);
    } catch (error) {
      console.error('Error loading probabilities:', error);
    }
  };

  const handleCardClick = (deckIndex) => {
    if (gameState?.gameOver) return;
    if (gameState?.deckValues[deckIndex] === 'XX') return;
    setSelectedDeck(deckIndex);
  };

  const makeGuess = async (guess) => {
    if (selectedDeck === null) {
      setMessage('Please select a deck first!');
      return;
    }

    setLoading(true);
    setMessage('Drawing card...');

    try {
      const deckNumber = selectedDeck + 1;
      const newState = await gameService.makeGuess(deckNumber, guess);

      const cardMatch = newState.message.match(/(?:final card was|new card was|card was) ([A-K0-9]+[SHDC])/i);
      const drawnCard = cardMatch ? cardMatch[1] : null;

      if (drawnCard) {
        setLastDrawnCard(drawnCard);
        setIsFlipping(true);

        setTimeout(() => {
          setGameState(newState);
          setCurrentGameScore(newState.score); // ✅ Update current game score
          const convertedMessage = convertCardNamesInMessage(newState.message);
          setMessage(convertedMessage);

          if (newState.deckValues[selectedDeck] === 'XX') {
            let nextDeck = selectedDeck;
            for (let i = 1; i < newState.deckValues.length; i++) {
              const testIndex = (selectedDeck + i) % newState.deckValues.length;
              if (newState.deckValues[testIndex] !== 'XX') {
                nextDeck = testIndex;
                break;
              }
            }
            setSelectedDeck(nextDeck);
          }

          setIsFlipping(false);

          if (hintsRoundsLeft > 0) {
            const newRounds = hintsRoundsLeft - 1;
            setHintsRoundsLeft(newRounds);
            if (newRounds === 0) {
              setShowProbabilities(false);
              setMessage(convertedMessage + ' | Hint expired!');
            } else {
              setMessage(convertedMessage + ` | Hint rounds left: ${newRounds}`);
            }
          }

          if (newState.gameOver && newState.won) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 7000);
          }

          if (!newState.gameOver) {
            loadProbabilities();
          }

          setLoading(false);

        }, 500);

      } else {
        setGameState(newState);
        setCurrentGameScore(newState.score); // ✅ Update current game score
        setMessage(convertCardNamesInMessage(newState.message));

        if (newState.deckValues[selectedDeck] === 'XX') {
          let nextDeck = selectedDeck;
          for (let i = 1; i < newState.deckValues.length; i++) {
            const testIndex = (selectedDeck + i) % newState.deckValues.length;
            if (newState.deckValues[testIndex] !== 'XX') {
              nextDeck = testIndex;
              break;
            }
          }
          setSelectedDeck(nextDeck);
        }

        if (newState.gameOver && newState.won) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }

        if (!newState.gameOver) {
          loadProbabilities();
        }

        setLoading(false);
      }

      if (newState.gameOver) {
        try {
          await statsService.saveGameResult(
            newState.score,
            numDecks,
            newState.won
          );

          const updatedStats = await statsService.getMyStats();
          setFinalStats(updatedStats);
          setShowStatsPopup(true);

        } catch (err) {
          setToastMessage("⚠️ Could not save stats!");
        }
      }

    } catch (error) {
      console.error('Error making guess:', error);
      setMessage('Error making guess!');
      setIsFlipping(false);
      setLoading(false);
    }
  };

  const resetGame = async () => {
    setLoading(true);
    try {
      await gameService.resetGame();
      setGameState(null);
      setIsStarted(false);
      setSelectedDeck(null);
      setMessage('');
      setProbabilities({});
      setLastDrawnCard(null);
      setIsFlipping(false);
      setShowConfetti(false);
      setHintsLeft(TOTAL_HINTS);
      setHintsRoundsLeft(0);
      setShowProbabilities(false);
      setShowStatsPopup(false);
      setFinalStats(null);
      setCurrentGameScore(0); // ✅ Reset game score
    } catch (error) {
      setMessage('Error resetting game!');
    }
    setLoading(false);
  };

  const handleHintClick = () => {
    if (hintsLeft > 0 && hintsRoundsLeft === 0) {
      setHintsLeft(hintsLeft - 1);
      setHintsRoundsLeft(ROUNDS_PER_HINT);
      setShowProbabilities(true);
      setMessage(`💡 Hint activated! ${ROUNDS_PER_HINT} rounds remaining. Hints left: ${hintsLeft - 1}`);
    } else if (hintsRoundsLeft > 0) {
      setMessage(`Hint already active! ${hintsRoundsLeft} rounds remaining.`);
    } else {
      setMessage('No hints left!');
    }
  };

  const handlePlayAgainFromPopup = () => {
    setShowStatsPopup(false);
    resetGame();
  };

  // ✅ FIXED: Calculate remaining cards correctly
  const getRemainingCards = () => {
    if (!gameState) return 52;

    // Count cards in remaining deck
    let totalRemaining = 0;
    if (gameState.remainingCards) {
      Object.values(gameState.remainingCards).forEach(suitCards => {
        totalRemaining += suitCards.length;
      });
    }

    return totalRemaining;
  };

  return (
    <div className="game-board">
      <h1 className="game-title">🎴 High-Low Card Game 🎴</h1>

      {isBackendLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner-large">⏳</div>
            <h2>Waking up the server...</h2>
            <p>This may take up to 30 seconds on first load</p>
            <div className="loading-bar">
              <div className="loading-bar-fill"></div>
            </div>
            <p className="loading-tip">💡 Tip: The game will load faster on subsequent visits!</p>
          </div>
        </div>
      )}

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* ✅ UPDATED: Stats Popup with Current Game Score */}
      {showStatsPopup && finalStats && (
        <div className="stats-popup-overlay">
          <div className="stats-popup">
            <h2>{gameState?.won ? '🎉 Victory! 🎉' : '💪 Game Over!'}</h2>
            <div className="popup-stats-grid">
              <div className="popup-stat">
                <div className="popup-stat-icon">🎯</div>
                <div className="popup-stat-value">{currentGameScore}</div>
                <div className="popup-stat-label">This Game Score</div>
              </div>
              <div className="popup-stat">
                <div className="popup-stat-icon">🏆</div>
                <div className="popup-stat-value">{finalStats.bestScore}</div>
                <div className="popup-stat-label">Total Points</div>
              </div>
              <div className="popup-stat">
                <div className="popup-stat-icon">🥇</div>
                <div className="popup-stat-value">
                  {finalStats.userRank !== null && finalStats.bestScore > 0
                    ? `#${finalStats.userRank}`
                    : 'N/A'}
                </div>
                <div className="popup-stat-label">Global Rank</div>
              </div>
              <div className="popup-stat">
                <div className="popup-stat-icon">🔥</div>
                <div className="popup-stat-value">{finalStats.currentWinStreak}</div>
                <div className="popup-stat-label">Win Streak</div>
              </div>
              <div className="popup-stat">
                <div className="popup-stat-icon">📊</div>
                <div className="popup-stat-value">{finalStats.winRate.toFixed(1)}%</div>
                <div className="popup-stat-label">Win Rate</div>
              </div>
            </div>
            <button className="popup-play-again-btn" onClick={handlePlayAgainFromPopup}>
              🎮 Play Again
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {!isStarted ? (
        <div className="start-screen">
          <h2>Welcome to High-Low Card Game!</h2>
          <p>Choose the number of decks and start playing!</p>

          <div className="deck-selector">
            <label>Number of Decks (6-10):</label>
            <input
              type="number"
              min="6"
              max="10"
              value={numDecks}
              onChange={(e) => setNumDecks(parseInt(e.target.value))}
            />
          </div>

          <button
            className="start-button"
            onClick={startGame}
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Game'}
          </button>

          <div className="rules">
            <h3>How to Play:</h3>
            <ul>
              <li>The objective of the game is to guess all the cards correctly.</li>
              <li>The selected number of decks will be placed face-up.</li>
              <li>The player must choose a deck and guess whether the next drawn card will be higher or lower than the current top card.</li>
              <li>If the guess is correct, the new card replaces the top card of that deck.</li>
              <li>If the guess is wrong, that deck is eliminated and can no longer be used.</li>
              <li>Points are awarded for every card you survive - win or lose!</li>
            </ul>
            <h3>Keyboard Shortcuts:</h3>
            <ul>
              <li><strong>1-9, 0</strong> → Select Deck 1-10</li>
              <li><strong>← →</strong> → Navigate between decks</li>
              <li><strong>↑ Arrow Up</strong> or <strong>H</strong> → Higher</li>
              <li><strong>↓ Arrow Down</strong> or <strong>L</strong> → Lower</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="hint-floating-topright">
            <button
              className="hint-button"
              onClick={handleHintClick}
              disabled={hintsLeft === 0 || loading}
              title={`Click to reveal probabilities for ${ROUNDS_PER_HINT} rounds`}
            >
              💡
              {hintsLeft > 0 && (
                <span className="hint-badge">{hintsLeft}</span>
              )}
            </button>
            {hintsRoundsLeft > 0 && (
              <div className="hint-active-indicator">
                {hintsRoundsLeft} rounds
              </div>
            )}
          </div>

          <div className="rules-button-container">
            <button
              className="rules-button"
              onClick={() => setShowRules(true)}
              title="How to Play"
            >
              ❓
            </button>
          </div>

          {showRules && (
            <div className="rules-modal-overlay" onClick={() => setShowRules(false)}>
              <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setShowRules(false)}>×</button>
                <h2>🎴 How to Play</h2>
                <div className="rules-content">
                  <h3>📋 Game Rules:</h3>
                  <ul>
                    <li>The objective is to guess as many cards correctly as possible.</li>
                    <li>Select a deck and guess if the next card is higher or lower.</li>
                    <li>Correct guesses keep the deck active; wrong guesses eliminate it.</li>
                    <li>You earn points for every card you survive - even if you lose!</li>
                    <li>Fewer decks = harder game = higher score multiplier.</li>
                  </ul>

                  <h3>⌨️ Keyboard Shortcuts:</h3>
                  <ul>
                    <li><strong>1-9, 0</strong> → Select Deck 1-10</li>
                    <li><strong>← →</strong> → Navigate between decks</li>
                    <li><strong>↑ Arrow Up</strong> or <strong>H</strong> → Higher</li>
                    <li><strong>↓ Arrow Down</strong> or <strong>L</strong> → Lower</li>
                  </ul>

                  <h3>💡 Hints:</h3>
                  <ul>
                    <li>Click the <strong>💡 Hint button</strong> (top right)</li>
                    <li>Shows probabilities for {ROUNDS_PER_HINT} rounds</li>
                    <li>You have <strong>{TOTAL_HINTS} hints</strong> per game</li>
                  </ul>

                  <h3>🎯 Strategy Tips:</h3>
                  <ul>
                    <li>Use hints wisely on difficult decisions</li>
                    <li>Remember which cards have been played</li>
                    <li>Low cards (A-5) are more likely to go higher</li>
                    <li>High cards (9-K) are more likely to go lower</li>
                  </ul>
                </div>
                <button className="close-button-modal" onClick={() => setShowRules(false)}>
                  Got it! 🎮
                </button>
              </div>
            </div>
          )}

          <div className={`message-display ${gameState?.gameOver ? 'game-over' : ''} ${loading ? 'loading' : ''}`}>
            {loading && <span className="loading-spinner">⏳ </span>}
            {message}
          </div>

          <div className="play-area">
            <div className="draw-deck-section">
              <DeckDisplay
                lastDrawnCard={lastDrawnCard}
                isFlipping={isFlipping}
              />
            </div>

            <div className="player-decks-section">
              <div className="cards-container">
                {gameState?.deckValues.map((card, index) => (
                  <Card
                    key={index}
                    value={card.slice(0, -1)}
                    suit={card.slice(-1)}
                    isEliminated={card === 'XX'}
                    onClick={() => handleCardClick(index)}
                    isSelected={selectedDeck === index}
                    deckNumber={index + 1}
                    probability={probabilities[index]}
                    showProbability={showProbabilities}
                  />
                ))}
              </div>
            </div>
          </div>

          {!gameState?.gameOver && (
            <div className="controls">
              <button
                className="guess-button high-button"
                onClick={() => makeGuess('h')}
                disabled={loading || selectedDeck === null}
              >
                ⬆️ Higher
              </button>
              <button
                className="guess-button low-button"
                onClick={() => makeGuess('l')}
                disabled={loading || selectedDeck === null}
              >
                ⬇️ Lower
              </button>
            </div>
          )}

          <div className="score-bar">
            <div className="score-item">
              <span className="score-label">Score</span>
              <span className="score-value">{gameState?.score || 0}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Remaining Cards</span>
              <span className="score-value">{getRemainingCards()}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Active Decks</span>
              <span className="score-value">
                {gameState?.deckValues.filter(v => v !== 'XX').length || 0}
              </span>
            </div>
          </div>

          <button
            className="reset-button"
            onClick={resetGame}
            disabled={loading}
          >
            {gameState?.gameOver ? '🎮 Play Again' : '🔄 Reset Game'}
          </button>
        </>
      )}
    </div>
  );
};

export default GameBoard;