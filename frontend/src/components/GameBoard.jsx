import React, { useState, useEffect } from 'react';
import Card from './Card';
import DeckDisplay from './DeckDisplay';
import gameService from '../services/gameService';
import Confetti from 'react-confetti';
import '../styles/GameBoard.css';

// Hint Configuration
const TOTAL_HINTS = 3; // Customize: Total number of hints
const ROUNDS_PER_HINT = 3; // Customize: How many rounds one hint lasts

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
  const [hintsLeft, setHintsLeft] = useState(3); // ADD THIS - Number of hints
  const [hintsRoundsLeft, setHintsRoundsLeft] = useState(0); // ADD THIS - Rounds hint is active
  const [showProbabilities, setShowProbabilities] = useState(false); // ADD THIS

  useEffect(() => {
    const keepAwake = setInterval(async () => {
      try {
        await gameService.healthCheck();
        console.log('✅ Backend pinged - staying awake');
      } catch (error) {
        console.log('❌ Backend ping failed:', error);
      }
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    // Cleanup: stop pinging when component unmounts
    return () => clearInterval(keepAwake);
  }, []);

  // Initial ping when component mounts to wake backend immediately
  useEffect(() => {
    const wakeBackend = async () => {
      try {
        await gameService.healthCheck();
        console.log('🚀 Backend woke up on page load');
      } catch (error) {
        console.log('⏳ Backend is waking up...');
      }
    };

    wakeBackend();
  }, []);

  // Keyboard controls for Higher/Lower
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only process if game is active and a deck is selected
      if (!isStarted || gameState?.gameOver || selectedDeck === null || loading) {
        return;
      }

      // Arrow Up or 'H' for Higher
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'h') {
        event.preventDefault();
        makeGuess('h');
      }

      // Arrow Down or 'L' for Lower
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 'l') {
        event.preventDefault();
        makeGuess('l');
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup function to remove listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isStarted, gameState, selectedDeck, loading]); // Dependencies

  const startGame = async () => {
    setLoading(true);
    setMessage('Starting game... (First load may take ~30 seconds if backend was sleeping)');

    try {
      const state = await gameService.startGame(numDecks);
      setGameState(state);
      setIsStarted(true);
      setMessage(state.message);
      setLastDrawnCard(null);
      setHintsLeft(TOTAL_HINTS); // ADD THIS
      setHintsRoundsLeft(0); // ADD THIS
      setShowProbabilities(false); // ADD THIS
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

    // Clear previous drawn card immediately
    setLastDrawnCard(null);
    setIsFlipping(false);

    try {
      const deckNumber = selectedDeck + 1;
      const newState = await gameService.makeGuess(deckNumber, guess);

      // Extract the drawn card from the backend message
      const cardMatch = newState.message.match(/(?:new card was|card was) ([A-K0-9]+[SHDC])/i);
      const drawnCard = cardMatch ? cardMatch[1] : null;

      if (drawnCard) {
        // Small delay to ensure previous card is cleared
        setTimeout(() => {
          setGameState(newState);
          setMessage(newState.message);
          setSelectedDeck(null);
          setIsFlipping(false);

          // Decrease hint rounds if active
          if (hintsRoundsLeft > 0) {
            const newRounds = hintsRoundsLeft - 1;
            setHintsRoundsLeft(newRounds);
            if (newRounds === 0) {
              setShowProbabilities(false);
              setMessage(newState.message + ' | Hint expired!');
            } else {
              setMessage(newState.message + ` | Hint rounds left: ${newRounds}`);
            }
          }

          // Trigger confetti if won
          if (newState.gameOver && newState.won) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }

          if (!newState.gameOver) {
            loadProbabilities();
          }

          setLoading(false);
        }, 800);

      } else {
        // Fallback
        setGameState(newState);
        setMessage(newState.message);
        setSelectedDeck(null);
        setLoading(false);

        if (!newState.gameOver) {
          loadProbabilities();
        }
      }

    } catch (error) {
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
      setHintsLeft(TOTAL_HINTS); // ADD THIS
      setHintsRoundsLeft(0); // ADD THIS
      setShowProbabilities(false); // ADD THIS
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

  return (
    <div className="game-board">
      <h1 className="game-title">🎴 High-Low Card Game 🎴</h1>

      {showConfetti && (
          <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
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
              <li>Select a deck by clicking on it</li>
              <li>Guess if the next card will be Higher or Lower</li>
              <li><strong>⌨️ Use Arrow Keys:</strong> ↑ for Higher, ↓ for Lower</li>
              <li><strong>Or press:</strong> H for Higher, L for Lower</li>
              <li>If correct, the new card becomes the top card</li>
              <li>If wrong, that deck is eliminated</li>
              <li>Try to guess as many cards as possible!</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Score Bar at Top */}
          <div className="score-bar">
            <div className="score-item">
              <span className="score-label">Score</span>
              <span className="score-value">{gameState?.score || 0}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Remaining Cards</span>
              <span className="score-value">{52 - (gameState?.score || 0)}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Active Decks</span>
              <span className="score-value">
                {gameState?.deckValues.filter(v => v !== 'XX').length || 0}
              </span>
            </div>
          </div>

          {/* Message Display */}
          <div className={`message-display ${gameState?.gameOver ? 'game-over' : ''} ${loading ? 'loading' : ''}`}>
            {loading && <span className="loading-spinner">⏳ </span>}
            {message}
          </div>

          {/* Main Game Area */}
          <div className="main-game-area">
            {/* Left: Deck Display */}
            <div className="left-section">
              <DeckDisplay
                lastDrawnCard={lastDrawnCard}
                isFlipping={isFlipping}
              />

              {/* Hint Button */}
              <div className="hint-container">
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
                    Active: {hintsRoundsLeft} rounds
                  </div>
                )}
              </div>
            </div>

            {/* Right: Player Decks */}
            <div className="right-section">
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

          {/* Control Buttons */}
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

          {/* Reset Button */}
          <button
            className="reset-button"
            onClick={resetGame}
            disabled={loading}
          >
            {gameState?.gameOver ? 'Play Again' : 'Reset Game'}
          </button>
        </>
      )}
    </div>
  );
};

export default GameBoard;