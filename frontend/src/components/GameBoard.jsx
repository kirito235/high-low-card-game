import React, { useState, useEffect } from 'react';
import Card from './Card';
import DeckDisplay from './DeckDisplay';
import gameService from '../services/gameService';
import Confetti from 'react-confetti';
import '../styles/GameBoard.css';

// Hint Configuration
const TOTAL_HINTS = 3;
const ROUNDS_PER_HINT = 3;

// Helper function to convert card codes to full names in messages
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
      setMessage(convertCardNamesInMessage(state.message)); // UPDATE THIS
      setLastDrawnCard(null);
      setHintsLeft(TOTAL_HINTS);
      setHintsRoundsLeft(0);
      setShowProbabilities(false);
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

      // Extract the drawn card from the backend message
      const cardMatch = newState.message.match(/(?:new card was|card was) ([A-K0-9]+[SHDC])/i);
      const drawnCard = cardMatch ? cardMatch[1] : null;

      console.log('Drawn card:', drawnCard);
      console.log('Game over:', newState.gameOver, 'Won:', newState.won);

      if (drawnCard) {
        // Set the drawn card and start flip animation
        setLastDrawnCard(drawnCard);
        setIsFlipping(true);

        // Wait for flip animation to complete
        setTimeout(() => {
          setGameState(newState);
          const convertedMessage = convertCardNamesInMessage(newState.message);
          setMessage(convertedMessage);
          setSelectedDeck(null);
          setIsFlipping(false);

          // Decrease hint rounds if active
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

          // Trigger confetti if won
          if (newState.gameOver && newState.won) {
            console.log('🎉 Triggering confetti!');
            setShowConfetti(true);

            // Keep confetti for 5 seconds
            setTimeout(() => {
              setShowConfetti(false);
              console.log('Confetti ended');
            }, 5000);
          }

          // DON'T clear last drawn card when game ends - keep it visible
          // The card should stay on screen showing the final draw

          if (!newState.gameOver) {
            loadProbabilities();
          }

          setLoading(false);
        }, 1200); // Slightly longer for better visibility

      } else {
        // Fallback - still show confetti if won
        setGameState(newState);
        const convertedMessage = convertCardNamesInMessage(newState.message);
        setMessage(convertedMessage);
        setSelectedDeck(null);

        if (newState.gameOver && newState.won) {
          console.log('🎉 Triggering confetti (fallback)!');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }

        setLoading(false);

        if (!newState.gameOver) {
          loadProbabilities();
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

      {/* Confetti Effect */}
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
          {/* Hint Button - Fixed Top Right */}
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

          {/* 1. Game Status Message */}
          <div className={`message-display ${gameState?.gameOver ? 'game-over' : ''} ${loading ? 'loading' : ''}`}>
            {loading && <span className="loading-spinner">⏳ </span>}
            {message}
          </div>

          {/* 2. Game Area - Draw Deck + Player Decks */}
          <div className="play-area">
            {/* Left: Draw Deck */}
            <div className="draw-deck-section">
              <DeckDisplay
                lastDrawnCard={lastDrawnCard}
                isFlipping={isFlipping}
              />
            </div>

            {/* Right: Player Decks */}
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

          {/* 3. Control Buttons - Higher/Lower */}
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

          {/* 4. Score Bar */}
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

          {/* 5. Reset Button */}
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