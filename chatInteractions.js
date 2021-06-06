const MOVE_DISTANCE = 4;
const DIRECTIONS = Object.freeze(['left', 'right', 'up', 'down']);
const alpaca = document.querySelector('.alpaca');
const spawned = new Set();
const pieces = new Map();
const subscriberPieces = new Map();
const CURLING_PIECENAME = 'curl';
const curlingSound = new Audio('/assets/sounds/curling.m4a');

curlingSound.volume = 0.5;

pieces.set('crab', createPiece('🦀'));
pieces.set('crate', createPiece('📦'));
pieces.set('todd', createPiece('🦞'));
pieces.set('poop', createPiece('💩'));
pieces.set('donut', createPiece('🍩'));

subscriberPieces.set(CURLING_PIECENAME, createPiece('🥌', true));
subscriberPieces.set('unicorn', createPiece('🦄', true));

function createPiece(text, subscriber = false) {
  const piece = Object.assign(document.createElement('div'), {
    className: subscriber ? 'subscriber--piece': 'piece',
    innerHTML: text,
  });

  return piece;
}

function moveX(distance, piece) {
  const currentXPosition =
    getComputedStyle(piece).getPropertyValue('--x-position');
  const newXPosition = `${parseInt(currentXPosition, 10) + distance}vw`;

  piece.style.setProperty('--x-position', newXPosition);
}

function moveY(distance, piece) {
  const currentYPosition =
    getComputedStyle(piece).getPropertyValue('--y-position');
  const newYPosition = `${parseInt(currentYPosition, 10) + distance}vh`;

  piece.style.setProperty('--y-position', newYPosition);
}

function movePiece({ piece, direction, flags, sound }) {
  const { subscriber = false } = flags;

  if (piece.classList.contains('subscriber--piece') && !subscriber) {
    console.log('You are not a subscriber. This piece requires a subscription.');

    return;
  }

  sound?.play();

  switch (direction) {
    case 'left':
      moveX(-MOVE_DISTANCE, piece);
      break;

    case 'right':
      moveX(MOVE_DISTANCE, piece);
      break;

    case 'down':
      moveY(MOVE_DISTANCE, piece);
      break;

    case 'up':
      moveY(-MOVE_DISTANCE, piece);
      break;

    default:
      break;
  }
}

function spawn(pieceName, flags = { subscriber: false }) {
  const { subscriber = false } = flags

  if (!pieces.has(pieceName) && !subscriberPieces.has(pieceName)) {
    console.log(`There are no pieces that exist with the name ${pieceName}`);
    return null;
  }

  let piece = pieces.get(pieceName);

  if (!piece && subscriber) {
    piece = subscriberPieces.get(pieceName);
  }

  if (!piece) {
    console.log('You are not a subscriber. This piece requires a subscription.');

    return null;
  }

  if (spawned.has(piece)) {
    console.log(`The piece ${pieceName} has already been spawned`);
    return piece;
  }

  document.body.appendChild(piece);

  setTimeout(() => {
    piece.style.opacity = 1;
  }, 0);
  spawned.add(piece);

  return piece;
}

let alpacaTimeout = 0;

function handleAlpaca(command) {
  if (alpacaTimeout) {
    clearTimeout(alpacaTimeout);
  }

  switch (command) {
    case 'hide': {
      alpaca.classList.add('alpaca--hide');

      alpacaTimeout = setTimeout(() => {
        alpaca.classList.remove('alpaca--hide');
      }, 11000);
      break;
    }

    default:
      break;
  }
}

export function inializeChatInteractions() {
  ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const [pieceName, pieceCommand] = command.split('-');

    switch (pieceName) {
      case 'alpaca':
        handleAlpaca(pieceCommand);
        break;

      default: {
        const sound = pieceName === CURLING_PIECENAME ? curlingSound : null;
        const piece = spawn(pieceName, flags);

        if (!piece) {
          return;
        }

        if (pieceCommand == null || !DIRECTIONS.includes(pieceCommand)) {
          console.log(`There is no direction ${pieceCommand} defined.`);
          return;
        }

        movePiece({ piece, direction: pieceCommand, flags, sound });
        break;
      }
    }
  };

  ComfyJS.Init('nickytonline');
}
