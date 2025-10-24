import React, { useState, useEffect } from 'react';
import Card from './Card';
import DeckDisplay from './DeckDisplay';
import gameService from '../services/gameService';
import '../styles/GameBoard.css';

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
    try {
      const state = await gameService.startGame(numDecks);
      setGameState(state);
      setIsStarted(true);
      setMessage(state.message);
      setLastDrawnCard(null);
      await loadProbabilities();
    } catch (error) {
      setMessage('Error starting game. Make sure backend is running!');
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
    setIsFlipping(true);

    try {
      const deckNumber = selectedDeck + 1;
      const newState = await gameService.makeGuess(deckNumber, guess);

      // Get the new card that was drawn
      const newCard = newState.deckValues[selectedDeck];

      // ALWAYS show the drawn card first (even if deck gets eliminated)
      // We need to extract the actual drawn card from the message
      // The backend message contains the card like "The card was 6D"
      const cardMatch = newState.message.match(/was ([A-K0-9]+[SHDC])/);
      const drawnCard = cardMatch ? cardMatch[1] : (newCard !== 'XX' ? newCard : null);

      setLastDrawnCard(drawnCard);

      // Wait for flip animation to complete, then show result
      setTimeout(() => {
        setGameState(newState);
        setMessage(newState.message);
        setSelectedDeck(null);
        setIsFlipping(false);

        if (!newState.gameOver) {
          loadProbabilities();
        }
      }, 800); // Increased to 800ms so user can see the card

    } catch (error) {
      setMessage('Error making guess!');
      setIsFlipping(false);
    }
    setLoading(false);
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
    } catch (error) {
      setMessage('Error resetting game!');
    }
    setLoading(false);
  };

  return (
    <div className="game-board">
      <h1 className="game-title">🎴 High-Low Card Game 🎴</h1>

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
          <div className={`message-display ${gameState?.gameOver ? 'game-over' : ''}`}>
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
            </div>

            {/* Right: Player Decks */}
            <div className="right-section">
              <h3 className="section-title">Your Decks</h3>
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