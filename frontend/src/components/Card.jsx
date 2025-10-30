import React from 'react';
import { getCardImagePath } from '../utils/cardImageHelper';
import '../styles/Card.css';

// Helper function to get full card name
const getFullCardName = (value, suit) => {
  const valueMap = {
    'A': 'Ace',
    '2': 'Two',
    '3': 'Three',
    '4': 'Four',
    '5': 'Five',
    '6': 'Six',
    '7': 'Seven',
    '8': 'Eight',
    '9': 'Nine',
    '10': 'Ten',
    'J': 'Jack',
    'Q': 'Queen',
    'K': 'King',
    'X': 'Eliminated'
  };

  const suitMap = {
    'S': 'Spades',
    'H': 'Hearts',
    'D': 'Diamonds',
    'C': 'Clubs',
    'X': ''
  };

  if (value === 'X') return 'Eliminated';

  return `${valueMap[value]} of ${suitMap[suit]}`;
};

const Card = ({ value, suit, isEliminated, onClick, isSelected, deckNumber, probability, showProbability }) => {
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
          alt={isEliminated ? 'Eliminated' : getFullCardName(value, suit)}
          className="card-image"
          title={getFullCardName(value, suit)}
        />
        {isSelected && <div className="selected-glow"></div>}
      </div>

      <div className="deck-label">{getFullCardName(value, suit)}</div>

      {!isEliminated && probability && showProbability && (
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