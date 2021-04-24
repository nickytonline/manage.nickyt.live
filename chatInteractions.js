const MOVE_DISTANCE = 4;
const DIRECTIONS = Object.freeze(['left', 'right', 'up', 'down']);

function createPiece(text) {
  const piece = document.createElement("div");
  piece.className = "piece";
  piece.innerHTML = text;

  return piece;
}

function moveX(distance, piece) {
  const currentXPosition = getComputedStyle(piece).getPropertyValue(
    "--x-position"
  );
  const newXPosition = `${parseInt(currentXPosition, 10) + distance}vw`;

  piece.style.setProperty("--x-position", newXPosition);
}

function moveY(distance, piece) {
  const currentYPosition = getComputedStyle(piece).getPropertyValue(
    "--y-position"
  );
  const newYPosition = `${parseInt(currentYPosition, 10) + distance}vh`;

  piece.style.setProperty("--y-position", newYPosition);
}

function movePiece(direction, piece) {
  switch (direction) {
    case "left":
      moveX(-MOVE_DISTANCE, piece);
      break;

    case "right":
      moveX(MOVE_DISTANCE, piece);
      break;

    case "down":
      moveY(MOVE_DISTANCE, piece);
      break;

    case "up":
      moveY(-MOVE_DISTANCE, piece);
      break;

    default:
      break;
  }
}

const pieces = new Map();

pieces.set("crab", createPiece("🦀"));
pieces.set("crate", createPiece("📦"));
pieces.set("todd", createPiece("🦞"));
pieces.set("forem", createPiece("🌱"));

const spawned = new Set();

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
  piece.style.opacity = 1;
  spawned.add(piece);

  return piece;
}

export function chatInteractions() {
  ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const [pieceName, direction] = command.split('-');

    const piece = spawn(pieceName);

    if (direction == null || !DIRECTIONS.includes(direction)) {
      console.log(`There is no direction ${direction} defined.`);
      return;
    }

    movePiece(direction, piece);
  };

  ComfyJS.Init("nickytonline");
}