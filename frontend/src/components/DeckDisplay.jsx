import React from 'react';
import { getCardImagePath } from '../utils/cardImageHelper';
import '../styles/DeckDisplay.css';

// Helper to get full card name
const getFullCardName = (cardString) => {
  if (!cardString || cardString === 'XX') return '';

  const value = cardString.slice(0, -1);
  const suit = cardString.slice(-1);

  const valueMap = {
    'A': 'Ace', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
    '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine', '10': 'Ten',
    'J': 'Jack', 'Q': 'Queen', 'K': 'King'
  };

  const suitMap = {
    'S': 'Spades', 'H': 'Hearts', 'D': 'Diamonds', 'C': 'Clubs'
  };

  return `${valueMap[value]} of ${suitMap[suit]}`;
};

// ✅ Get card back based on user selection
const getCardBackImage = () => {
  const selectedCardBack = localStorage.getItem('cardBack') || 'default';

  const cardBackMap = {
    'default': '/cards/back.png',
    'blue': '/cards/back-blue.png',
    'green': '/cards/back-green.png',
    'gold': '/cards/back-gold.png'
  };

  return cardBackMap[selectedCardBack] || '/cards/back.png';
};

const DeckDisplay = ({ lastDrawnCard, isFlipping }) => {
  const cardBackImage = getCardBackImage();

  return (
    <div className="deck-display">
      <h3>Draw Deck</h3>

      <div className="deck-area">
        {/* Stack of cards showing deck - ALWAYS VISIBLE */}
        <div className="deck-stack">
          <img src={cardBackImage} alt="Deck" className="deck-card deck-card-3" />
          <img src={cardBackImage} alt="Deck" className="deck-card deck-card-2" />
          <img src={cardBackImage} alt="Deck" className="deck-card deck-card-1" />
        </div>

        {/* Last Drawn Card Area - ALWAYS VISIBLE RECTANGLE */}
        <div className="drawn-card-area">
          <div className="drawn-card-label">Last Drawn Card</div>

          <div className="drawn-card-frame">
            {lastDrawnCard ? (
              <div className={`drawn-card ${isFlipping ? 'flipping' : ''}`}>
                <img
                  src={getCardImagePath(lastDrawnCard)}
                  alt={getFullCardName(lastDrawnCard)}
                  key={lastDrawnCard}
                />
              </div>
            ) : (
              <div className="no-card-placeholder">
                <span>No card drawn yet</span>
              </div>
            )}
          </div>

          {lastDrawnCard && (
            <div className="last-drawn-name">
              {getFullCardName(lastDrawnCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckDisplay;