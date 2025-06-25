// Toads and Frogs Game - Fully Fixed Logic with Clear Status Wording
let board = [];
let gameOver = false;
let numPlayers = 1;
let currentPlayer = 'T';
let lastMover = null;

const boardDiv = document.getElementById('board');
const statusP = document.getElementById('status');
const winnerAnimation = document.getElementById('winnerAnimation');

function setupGame() {
  document.getElementById("gameSettings").style.display = "none";
  document.getElementById("gameArea").style.display = "flex";
  document.getElementById("rulesSection").style.display = "block";

  let totalCells = parseInt(document.getElementById('numCells').value);
  if (isNaN(totalCells) || totalCells < 1 || totalCells > 15) {
    alert("Please enter a number between 1 and 15.");
    return;
  }

  numPlayers = parseInt(document.getElementById('numPlayers').value);
  let pieceCount = Math.floor(totalCells / 3);
  let emptyCount = totalCells - pieceCount * 2;
  board = Array(pieceCount).fill('T').concat(Array(emptyCount).fill('_')).concat(Array(pieceCount).fill('F'));

  gameOver = false;
  currentPlayer = 'T';
  lastMover = null;
  document.getElementById('restartBtn').disabled = false;

  renderBoard();
  updateStatus();
}

function renderBoard() {
  boardDiv.innerHTML = '';
  board.forEach((cell, index) => {
    const div = document.createElement('div');
    div.className = 'cell';
    if (cell === 'T' || cell === 'F') {
      const img = document.createElement('img');
      img.src = cell === 'T' ? 'toadschar.png' : 'frogchar.png';
      img.alt = cell === 'T' ? 'Toad' : 'Frog';
      img.className = 'cell-img';
      div.appendChild(img);
    }
    if (!gameOver && ((numPlayers === 1 && ((currentPlayer === 'T' && cell === 'T') || (currentPlayer === 'F' && cell === 'F')))
        || (numPlayers === 2 && cell === currentPlayer))) {
      div.addEventListener('click', () => tryMove(index));
    }
    boardDiv.appendChild(div);
  });
}

function tryMove(i) {
  if (gameOver) return;
  if (board[i] !== currentPlayer) return;

  const moved = attemptMove(i);
  if (!moved) {
    statusP.textContent = `❌ Invalid move! That ${board[i] === 'T' ? 'Toad' : 'Frog'} can’t move from there.`;
    return;
  }

  renderBoard();

  if (numPlayers === 1) {
    if (currentPlayer === 'T') {
      currentPlayer = 'F';
      updateStatus();
      setTimeout(() => frogMoveOnce(), 300);
    }
  } else {
    handle2Player();
  }
}

function attemptMove(i) {
  let moved = false;
  const piece = board[i];

  if (piece === 'T') {
    if (i + 1 < board.length && board[i + 1] === '_') {
      [board[i], board[i + 1]] = [board[i + 1], board[i]];
      moved = true;
    } else if (i + 2 < board.length && board[i + 1] === 'F' && board[i + 2] === '_') {
      [board[i], board[i + 2]] = [board[i + 2], board[i]];
      moved = true;
    }
  } else if (piece === 'F') {
    if (i - 1 >= 0 && board[i - 1] === '_') {
      [board[i], board[i - 1]] = [board[i - 1], board[i]];
      moved = true;
    } else if (i - 2 >= 0 && board[i - 1] === 'T' && board[i - 2] === '_') {
      [board[i], board[i - 2]] = [board[i - 2], board[i]];
      moved = true;
    }
  }

  if (moved) lastMover = piece;
  return moved;
}

function frogMoveOnce() {
  if (gameOver) return;

  let bestMove = null;
  let bestScore = -Infinity;

  for (let i = board.length - 1; i >= 0; i--) {
    if (board[i] === 'F') {
      if (i - 2 >= 0 && board[i - 1] === 'T' && board[i - 2] === '_') {
        const test = [...board];
        [test[i], test[i - 2]] = [test[i - 2], test[i]];
        const score = evaluateBoard(test);
        if (score > bestScore) {
          bestScore = score;
          bestMove = { from: i, to: i - 2 };
        }
      } else if (i - 1 >= 0 && board[i - 1] === '_') {
        const test = [...board];
        [test[i], test[i - 1]] = [test[i - 1], test[i]];
        const score = evaluateBoard(test);
        if (score > bestScore) {
          bestScore = score;
          bestMove = { from: i, to: i - 1 };
        }
      }
    }
  }

  if (bestMove) {
    lastMover = 'F';
    [board[bestMove.from], board[bestMove.to]] = [board[bestMove.to], board[bestMove.from]];
    currentPlayer = 'T';
    renderBoard();
    const toadsCanMove = hasValidMove('T', 1);
    const frogsCanMove = hasValidMove('F', -1);
    if (!toadsCanMove && !frogsCanMove) {
      announceWinner();
    } else if (!toadsCanMove && frogsCanMove) {
      setTimeout(() => frogFinalMoveAndWin(), 300);
    } else {
      updateStatus();
    }
  } else {
    announceWinner();
  }
}

function frogFinalMoveAndWin() {
  for (let i = board.length - 1; i >= 0; i--) {
    if (board[i] === 'F') {
      if (i - 2 >= 0 && board[i - 1] === 'T' && board[i - 2] === '_') {
        [board[i], board[i - 2]] = [board[i - 2], board[i]];
        break;
      } else if (i - 1 >= 0 && board[i - 1] === '_') {
        [board[i], board[i - 1]] = [board[i - 1], board[i]];
        break;
      }
    }
  }
  renderBoard();
  declareWinner('F');
}

function handle2Player() {
  const toadsCanMove = hasValidMove('T', 1);
  const frogsCanMove = hasValidMove('F', -1);

  if (!toadsCanMove && !frogsCanMove) return announceWinner();
  if (currentPlayer === 'T' && !frogsCanMove) return declareWinner('T');
  if (currentPlayer === 'F' && !toadsCanMove) return declareWinner('F');

  switchPlayer();
}

function hasValidMove(char, dir) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === char) {
      if (dir === 1) {
        if (i + 1 < board.length && board[i + 1] === '_') return true;
        if (i + 2 < board.length && board[i + 1] !== char && board[i + 2] === '_') return true;
      } else {
        if (i - 1 >= 0 && board[i - 1] === '_') return true;
        if (i - 2 >= 0 && board[i - 1] !== char && board[i - 2] === '_') return true;
      }
    }
  }
  return false;
}

function evaluateBoard(tempBoard) {
  return tempBoard.reduce((count, val, i) => {
    if (val === 'T') {
      const n1 = tempBoard[i + 1];
      const n2 = tempBoard[i + 2];
      if (n1 !== '' && (n2 !== '' || n1 === 'T')) count++;
    }
    return count;
  }, 0);
}

function switchPlayer() {
  currentPlayer = currentPlayer === 'T' ? 'F' : 'T';
  updateStatus();
  renderBoard();
}

function updateStatus() {
  if (gameOver) return;
  statusP.innerHTML = `It’s <img src="${currentPlayer === 'T' ? 'toadschar.png' : 'frogchar.png'}" class="status-icon"> <strong>${currentPlayer === 'T' ? 'Toad' : 'Frog'}</strong>’s turn! Click to move.`;
}

function declareWinner(winner) {
  const img = winner === 'T' ? 'toadschar.png' : 'frogchar.png';
  statusP.innerHTML = `🎉 <strong>${winner === 'T' ? 'Toads' : 'Frogs'}</strong> win the game! <img src="${img}" class="status-icon">`;
  if (winnerAnimation) {
    winnerAnimation.style.display = 'block';
    winnerAnimation.innerHTML = `<img src="${img}" alt="Winner">`;
  }
  endGame();
}

function announceWinner() {
  const img = lastMover === 'T' ? 'toadschar.png' : 'frogchar.png';
  statusP.innerHTML = `🎉 Game over! No valid moves left. <img src="${img}" class="status-icon"> <strong>${lastMover === 'T' ? 'Toads' : 'Frogs'}</strong> win by last successful move!`;
  if (winnerAnimation) {
    winnerAnimation.style.display = 'block';
    winnerAnimation.innerHTML = `<img src="${img}" alt="Winner">`;
  }
  endGame();
}

function endGame() {
  gameOver = true;
  document.getElementById('restartBtn').style.display = 'inline-block';
  document.getElementById('restartBtn').disabled = false;
}

function restartGame() {
  document.getElementById("gameSettings").style.display = "flex";
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("restartBtn").style.display = "none";
  document.getElementById("rulesSection").style.display = "none";
  statusP.textContent = '';
  boardDiv.innerHTML = '';
  document.getElementById('numCells').value = '7';
  document.getElementById('numPlayers').value = '1';
}

function toggleRules() {
  const rules = document.getElementById("gameRules");
  rules.style.display = rules.style.display === "none" ? "block" : "none";
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('restartBtn').addEventListener('click', restartGame);
  document.getElementById('startBtn').addEventListener('click', setupGame);

  let mouseDown = false;
  document.addEventListener('mousedown', e => {
    if (e.detail > 1) e.preventDefault();
    else mouseDown = true;
  }, true);
  document.addEventListener('mousemove', e => mouseDown && e.preventDefault(), true);
  document.addEventListener('mouseup', () => mouseDown = false, true);
  document.addEventListener('dragstart', e => e.preventDefault());
});
