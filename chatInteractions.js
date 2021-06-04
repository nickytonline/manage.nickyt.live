const MOVE_DISTANCE = 4;
const DIRECTIONS = Object.freeze(['left', 'right', 'up', 'down']);
const alpaca = document.querySelector('.alpaca');
const spawned = new Set();
const pieces = new Map();

pieces.set('crab', createPiece('🦀'));
pieces.set('crate', createPiece('📦'));
pieces.set('todd', createPiece('🦞'));
pieces.set('poop', createPiece('💩'));
pieces.set('curling', createPiece('🥌'));
pieces.set('donut', createPiece('🍩'));

function createPiece(text) {
  const piece = Object.assign(document.createElement('div'), {
    className: 'piece',
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

function movePiece(piece, direction) {
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

function spawn(pieceName) {
  if (!pieces.has(pieceName)) {
    console.log(`There are no pieces that exist with the name ${pieceName}`);
    return null;
  }

  const piece = pieces.get(pieceName);

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
      case 'setup': {
        let count = 0;
        for (const [name, ] of pieces.entries()) {
          const piece = spawn(name);

          if (count > 0) {
            for (const counter of new Array(count)) {
              movePiece(piece, 'left')
            }
          }

          count++;
        }
      }

      case 'alpaca': {
        handleAlpaca(pieceCommand);
        return;
      }

      default: {
        // Handle movable pieces
        const piece = spawn(pieceName);

        if (pieceCommand == null || !DIRECTIONS.includes(pieceCommand)) {
          console.log(`There is no direction ${pieceCommand} defined.`);
          return;
        }

        movePiece(piece, pieceCommand);
      }
    }
  };

  ComfyJS.Init('nickytonline');
}
