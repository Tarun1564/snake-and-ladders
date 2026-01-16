const Home = 0;
const Finish = 99;

const snakes = {
  25: 3, 42: 1, 56: 12,
  61: 43, 92: 67, 95: 12, 98: 80
};

const ladders = {
  7: 30, 16: 33, 20: 38, 36: 83,
  50: 68, 63: 81, 71: 89, 86: 97
};

const presplash = document.getElementById("presplash");
const boardDiv = document.getElementById("board");
const gameDiv = document.getElementById("game");
const info = document.getElementById("info");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

let players = 2;
let positions = [];
let currentPlayer = 0;
function startGame(p) {
  players = parseInt(p, 10);
  positions = new Array(players).fill(Home);
  currentPlayer = 0;

  presplash.hidden = true;
  gameDiv.hidden = false;

  buildBoard();
  drawOverlay();
  renderTokens();
  updateInfo();
}
function buildBoard() {
  boardDiv.innerHTML = "";

  for (let i = 99; i >= 0; i--) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.textContent = i + 1;

    const row = Math.floor(i / 10);
    const col = i % 10;

    cell.style.gridRow = 10 - row;
    cell.style.gridColumn = row % 2 === 0 ? col + 1 : 10 - col;

    boardDiv.appendChild(cell);
  }
}
function rollDice() {
  const dice = Math.floor(Math.random() * 6) + 1;
  movePlayer(dice);
}
function movePlayer(dice) {
  let steps = dice;

  function stepMove() {
    if (steps === 0) {
      applySnakeOrLadder();
      checkWin();
      currentPlayer = (currentPlayer + 1) % players;
      updateInfo();
      return;
    }

    positions[currentPlayer]++;
    renderTokens();
    steps--;

    setTimeout(stepMove, 300);
  }

  if (positions[currentPlayer] + dice <= Finish) {
    stepMove();
  }
}
function applySnakeOrLadder() {
  let pos = positions[currentPlayer];

  if (snakes[pos] !== undefined) {
    animateJump(pos, snakes[pos]);
  } else if (ladders[pos] !== undefined) {
    animateJump(pos, ladders[pos]);
  }
}

function animateJump(from, to) {
  const token = document.querySelector(`.p${currentPlayer}`);
  const start = getCellCenter(from);
  const end = getCellCenter(to);

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  token.style.transition = "transform 0.6s ease-in-out";
  token.style.transform = `translate(${dx}px, ${dy}px)`;

  setTimeout(() => {
    token.style.transition = "";
    token.style.transform = "";
    positions[currentPlayer] = to;
    renderTokens();
  }, 600);
}
function renderTokens() {
  document.querySelectorAll(".token").forEach(t => t.remove());

  const cellTokenMap = {};

  positions.forEach((pos, i) => {
    if (!cellTokenMap[pos]) cellTokenMap[pos] = [];
    cellTokenMap[pos].push(i);
  });

  for (let pos in cellTokenMap) {
    const cell = document.querySelector(`[data-index="${pos}"]`);
    cellTokenMap[pos].forEach((playerIndex, i) => {
      const token = document.createElement("div");
      token.className = `token p${playerIndex}`;

      token.style.left = `${(i % 2) * 14}px`;
      token.style.top = `${Math.floor(i / 2) * 14}px`;

      cell.appendChild(token);
    });
  }
}
function updateInfo() {
  info.textContent = `Player ${currentPlayer + 1}'s turn`;
}

function checkWin() {
  if (positions[currentPlayer] === Finish) {
    alert(`Player ${currentPlayer + 1} wins!`);
    location.reload();
  }
}
function getCellCenter(index) {
  const cell = document.querySelector(`[data-index="${index}"]`);
  const rect = cell.getBoundingClientRect();
  const boardRect = boardDiv.getBoundingClientRect();

  return {
    x: rect.left - boardRect.left + rect.width / 2,
    y: rect.top - boardRect.top + rect.height / 2
  };
}

function drawOverlay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 4;
  for (let start in ladders) {
    const p1 = getCellCenter(start);
    const p2 = getCellCenter(ladders[start]);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  ctx.strokeStyle = "red";
  ctx.lineWidth = 5;
  for (let start in snakes) {
    const p1 = getCellCenter(start);
    const p2 = getCellCenter(snakes[start]);

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + 40;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
    ctx.stroke();
  }
}
