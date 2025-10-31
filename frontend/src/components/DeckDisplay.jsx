import React from 'react';
import { getCardBackImage, getCardImagePath } from '../utils/cardImageHelper';
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

const DeckDisplay = ({ lastDrawnCard, isFlipping }) => {
  return (
    <div className="deck-display">
      <h3>Draw Deck</h3>

      <div className="deck-area">
        {/* Stack of cards showing deck - ALWAYS VISIBLE */}
        <div className="deck-stack">
          <img src={getCardBackImage()} alt="Deck" className="deck-card deck-card-3" />
          <img src={getCardBackImage()} alt="Deck" className="deck-card deck-card-2" />
          <img src={getCardBackImage()} alt="Deck" className="deck-card deck-card-1" />
        </div>

        {/* Drawn card area - Shows during and after flip */}
        {lastDrawnCard && (
          <div className="drawn-card-area">
            <div className={`drawn-card ${isFlipping ? 'flipping' : ''}`}>
              <img src={getCardImagePath(lastDrawnCard)} alt={getFullCardName(lastDrawnCard)} />
            </div>
            <div className="last-drawn-label">
              Last Drawn: {getFullCardName(lastDrawnCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckDisplay;