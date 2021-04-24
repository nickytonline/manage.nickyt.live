const MOVE_DISTANCE = 4;

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

for (const [, piece] of pieces.entries()) {
  document.body.appendChild(piece);
}

export function chatInteractions() {
  ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const [pieceName, direction] = command.split('-');

    movePiece(direction, pieces.get(pieceName))
  };

  ComfyJS.Init("nickytonline");
}