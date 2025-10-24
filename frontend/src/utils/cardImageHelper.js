// Convert our card format (AS, 2H, KD) to image filename
export const getCardImagePath = (cardString) => {
  if (!cardString || cardString === 'XX') {
    return '/cards/back.png';
  }

  // Extract value and suit from card string (e.g., "AS" -> value="A", suit="S")
  const value = cardString.slice(0, -1);
  const suit = cardString.slice(-1);

  // Convert suit letter to full name
  const suitMap = {
    'S': 'spades',
    'H': 'hearts',
    'D': 'diamonds',
    'C': 'clubs'
  };

  // Convert value to word format
  const valueMap = {
    'A': 'ace',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': 'jack',
    'Q': 'queen',
    'K': 'king'
  };

  const suitName = suitMap[suit];
  const valueName = valueMap[value];

  return `/cards/${valueName}_of_${suitName}.png`;
};

export const getCardBackImage = () => {
  return '/cards/back.png';
};