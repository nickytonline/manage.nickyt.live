import pThrottle from 'https://unpkg.com/p-throttle@5.0.0/index.js';

const MOVE_DISTANCE = 4;
const DIRECTIONS = Object.freeze(['left', 'right', 'up', 'down']);
const alpaca = document.querySelector('.alpaca');
const spawned = new Set();
const pieces = new Map();
const subscriberPieces = new Map();
const CURLING_PIECENAME = 'curl';
const curlingSound = new Audio('/assets/sounds/curling.m4a');
const confettiSound = new Audio('/assets/sounds/emojipalooza.m4a');
const yoloSound = new Audio('/assets/sounds/YOLO-lets-go.wav');
const confettiEmojis = [
  '🌈',
  '🦄',
  '💩',
  '🍩',
  '🙃',
  '😎',
  '😂',
  '🤡',
  '🤠',
  '🤩',
  '😱',
  '🤪',
];

let jsConfetti;
let confettiCount = 0;

curlingSound.volume = 0.5;
confettiSound.volume = 0.5;

pieces.set('todd', createPiece('🦞'));
pieces.set('poop', createPiece('💩'));
pieces.set('donut', createPiece('🍩'));

subscriberPieces.set(CURLING_PIECENAME, createPiece('🥌', true));
subscriberPieces.set('unicorn', createPiece('🦄', true));

const freshImage = document.querySelector('.fresh-image');
const beansImage = document.querySelector('.beans-image');
const nachoImage = document.querySelector('.nacho-image');
const lemonImage = document.querySelector('.lemon-image');

function createPiece(text, subscriber = false) {
  const piece = Object.assign(document.createElement('div'), {
    className: `${text} ${subscriber ? 'subscriber--piece' : 'piece'}`,
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
    console.log(
      'You are not a subscriber. This piece requires a subscription.',
    );

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
  const { subscriber = false } = flags;

  if (!pieces.has(pieceName) && !subscriberPieces.has(pieceName)) {
    console.log(`There are no pieces that exist with the name ${pieceName}`);
    return null;
  }

  let piece = pieces.get(pieceName);

  if (!piece && subscriber) {
    piece = subscriberPieces.get(pieceName);
  }

  if (!piece) {
    console.log(
      'You are not a subscriber. This piece requires a subscription.',
    );

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
const ALPACA_HATS = Object.freeze([
  'croissant',
  'graduation',
  'crown',
  'ball-cap',
  'top-hat',
  'goblin',
  'drink',
  'mohawk-mountain',
]);

function getAlpacaHat() {
  return ALPACA_HATS[Math.floor(Math.random() * ALPACA_HATS.length)];
}

let currentHat;

function handleAlpaca(command, timeout = 5000) {
  if (alpacaTimeout) {
    clearTimeout(alpacaTimeout);
  }

  switch (command) {
    case 'hide': {
      alpaca.classList.add('alpaca--hide');

      alpacaTimeout = setTimeout(() => {
        alpaca.classList.remove('alpaca--hide');
        currentHat && alpaca.classList.remove(currentHat);
        currentHat = getAlpacaHat();

        alpaca.classList.add(currentHat);
      }, timeout);
      break;
    }

    default:
      break;
  }
}

function getRandomEmoji() {
  return confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
}

const throttle = pThrottle({
  limit: 1,
  interval: 45000,
});

const confetti = throttle((flags = { subscriber: false }) => {
  confettiCount++;

  let confettiConfig = {
    confettiNumber: 50,
  };

  handleAlpaca('hide', 2300);

  if (flags.subscriber) {
    confettiSound.play();
    confettiConfig = {
      ...confettiConfig,
      emojis: confettiCount % 5 === 0 ? confettiEmojis : [getRandomEmoji()],
      emojiSize: 100,
      confettiNumber: confettiCount % 5 === 0 ? 150 : 50,
      confettiRadius: 20,
    };
  }

  jsConfetti.addConfetti(confettiConfig);
});

function yolo() {
  yoloSound.play();
}

function hideCommandImages() {
  for (const image of document.querySelectorAll('.command-images img')) {
    image.dataset.active = false;
  }
}

function imageToggler(image, timeoutInMs = 3000) {
  return () => {
    hideCommandImages();
    image.dataset.active = true;

    setTimeout(() => {
      image.dataset.active = false;
    }, timeoutInMs);
  };
}

const hellaFresh = imageToggler(freshImage, 2200);
const coolBeans = imageToggler(beansImage, 2200);
const nacho = imageToggler(nachoImage);
const lemon = imageToggler(lemonImage, 1750);

setInterval(() => handleAlpaca('hide'), 300000);

export function inializeChatInteractions() {
  const canvas = document.querySelector('.confetti');
  jsConfetti = new JSConfetti({ canvas });
  const pinnedMessage = document.querySelector('#pinned-message');
  const allowedUsers = ["dianasoyster", "nickytonline"];

  ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (allowedUsers.includes(user)) {
      if (command === 'pin') {
        pinnedMessage.innerHTML = message;
        pinnedMessage.classList.remove('hidden');
        console.log({user, command, message, flags, extra});
        return
      }

      if (command === 'unpin') {
        pinnedMessage.innerHTML = '';
        pinnedMessage.classList.add('hidden');
        return
      }
    }

    const [pieceName, pieceCommand] = command.split('-');

    switch (pieceName) {
      case 'fresh':
        if (flags.subscriber) {
          hellaFresh();
        }
        break;
      case 'beans':
        if (flags.subscriber) {
          coolBeans();
        }
        break;
      case 'nacho':
        if (flags.subscriber) {
          nacho();
        }
        break;
      case 'lemon':
        lemon();
        break;
      case 'alpaca':
        handleAlpaca(pieceCommand);
        break;

      case 'confetti': {
        confetti(flags);
        break;
      }

      case 'yolo': {
        if (flags.subscriber) {
          yolo();
        }
        break;
      }

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
