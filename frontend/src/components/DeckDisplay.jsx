import React from 'react';
import { getCardBackImage, getCardImagePath } from '../utils/cardImageHelper';
import '../styles/DeckDisplay.css';

const DeckDisplay = ({ lastDrawnCard, isFlipping }) => {
  return (
    <div className="deck-display">
      <h3>Draw Deck</h3>

      <div className="deck-area">
        {/* Stack of cards showing deck */}
        <div className="deck-stack">
          <img src={getCardBackImage()} alt="Deck" className="deck-card deck-card-3" />
          <img src={getCardBackImage()} alt="Deck" className="deck-card deck-card-2" />
          <img src={getCardBackImage()} alt="Deck" className="deck-card deck-card-1" />
        </div>

        {/* Drawn card area - always visible when there's a card */}
        {lastDrawnCard && (
          <div className="drawn-card-area">
            <div className={`drawn-card ${isFlipping ? 'flipping' : ''}`}>
              <img src={getCardImagePath(lastDrawnCard)} alt={lastDrawnCard} />
            </div>
            <div className="last-drawn-label">
              Last Drawn: {lastDrawnCard}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckDisplay;