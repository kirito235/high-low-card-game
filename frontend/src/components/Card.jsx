import React from 'react';
import { getCardImagePath } from '../utils/cardImageHelper';
import '../styles/Card.css';

const Card = ({ value, suit, isEliminated, onClick, isSelected, deckNumber, probability }) => {
  const cardString = value + suit;
  const imagePath = getCardImagePath(cardString);

  return (
    <div className="card-container">
      <div
        className={`playing-card ${isEliminated ? 'eliminated' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={!isEliminated ? onClick : null}
      >
        <img
          src={imagePath}
          alt={isEliminated ? 'Eliminated' : cardString}
          className="card-image"
        />
        {isSelected && <div className="selected-glow"></div>}
      </div>

      <div className="deck-label">Deck {deckNumber}</div>

      {!isEliminated && probability && (
        <div className="probability-info">
          <div className="prob-bar-container">
            <div className="prob-bar higher">
              <div
                className="prob-fill"
                style={{ width: `${(probability.higher / probability.total) * 100}%` }}
              ></div>
              <span className="prob-text">↑ {probability.higher}</span>
            </div>
            <div className="prob-bar lower">
              <div
                className="prob-fill"
                style={{ width: `${(probability.lower / probability.total) * 100}%` }}
              ></div>
              <span className="prob-text">↓ {probability.lower}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;