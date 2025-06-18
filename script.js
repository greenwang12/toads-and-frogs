let n, m;
let board = [];
let gameOver = false;
let numPlayers = 1;
let currentPlayer = 'T';


const boardDiv = document.getElementById('board');
const statusP = document.getElementById('status');

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

  board = Array(pieceCount).fill('T')
    .concat(Array(emptyCount).fill('_'))
    .concat(Array(pieceCount).fill('F'));

  gameOver = false;
  currentPlayer = 'T';
  document.getElementById('restartBtn').disabled = false;

  renderBoard();
  statusP.innerHTML = `Your move: Click a ${
  currentPlayer === 'T'
    ? '<img src="toadschar.png" alt="Toad" class="status-icon"> Toad'
    : '<img src="frogchar.png" alt="Frog" class="status-icon"> Frog'
}.`;

}

function renderBoard() {
  boardDiv.innerHTML = '';
  board.forEach((cell, index) => {
    const div = document.createElement('div');
    div.className = 'cell';
  if (cell === 'T') {
  const img = document.createElement('img');
  img.src = 'toadschar.png'; // place 'toad.png' in the same folder as your HTML
  img.alt = 'Toad';
  img.className = 'cell-img';
  div.appendChild(img);
} else if (cell === 'F') {
  const img = document.createElement('img');
  img.src = 'frogchar.png'; // place 'frog.png' in the same folder as your HTML
  img.alt = 'Frog';
  img.className = 'cell-img';
  div.appendChild(img);
}


    if (!gameOver) {
      if ((numPlayers === 1 && cell === 'T') || (numPlayers === 2 && cell === currentPlayer)) {
        div.addEventListener('click', () => tryMove(index));
      }
    }
    boardDiv.appendChild(div);
  });
}

function tryMove(i) {
  if (gameOver) return;
  if (numPlayers === 2 && board[i] !== currentPlayer) {
    statusP.textContent = `❌ It's ${currentPlayer === 'T' ? 'Toad 🐢' : 'Frog 🐸'}'s turn!`;
    return;
  }

  if (board[i] === 'T') {
    if (i + 1 < board.length && board[i + 1] === '_') {
      [board[i], board[i + 1]] = [board[i + 1], board[i]];
    } else if (i + 2 < board.length && board[i + 1] === 'F' && board[i + 2] === '_') {
      [board[i], board[i + 2]] = [board[i + 2], board[i]];
    } else {
      statusP.textContent = '❌ Invalid move for Toad!';
      return;
    }
  } else if (board[i] === 'F') {
    if (i - 1 >= 0 && board[i - 1] === '_') {
      [board[i], board[i - 1]] = [board[i - 1], board[i]];
    } else if (i - 2 >= 0 && board[i - 1] === 'T' && board[i - 2] === '_') {
      [board[i], board[i - 2]] = [board[i - 2], board[i]];
    } else {
      statusP.textContent = '❌ Invalid move for Frog!';
      return;
    }
  }

  renderBoard();
  checkGameOver();

  if (!gameOver) {
  if (numPlayers === 1) {
    // 💡 ADD THIS BEFORE the AI plays
    statusP.innerHTML = `<img src="frogchar.png" class="status-icon"> Frog turn!`;

    setTimeout(frogMove, 300);
  } else {
    switchPlayer();
    renderBoard();
  }
}
}

function frogMove() {
  let bestMove = null;
  let bestScore = -Infinity;

  for (let i = board.length - 1; i >= 0; i--) {
    if (board[i] === 'F') {
      if (i - 2 >= 0 && board[i - 1] === 'T' && board[i - 2] === '_') {
        const testBoard = [...board];
        [testBoard[i], testBoard[i - 2]] = [testBoard[i - 2], testBoard[i]];
        const score = evaluateBoard(testBoard);
        if (score > bestScore) {
          bestScore = score;
          bestMove = { from: i, to: i - 2 };
        }
      } else if (i - 1 >= 0 && board[i - 1] === '_') {
        const testBoard = [...board];
        [testBoard[i], testBoard[i - 1]] = [testBoard[i - 1], testBoard[i]];
        const score = evaluateBoard(testBoard);
        if (score > bestScore) {
          bestScore = score;
          bestMove = { from: i, to: i - 1 };
        }
      }
    }
  }

  if (bestMove) {
    [board[bestMove.from], board[bestMove.to]] = [board[bestMove.to], board[bestMove.from]];
    renderBoard();
    checkGameOver();
  } else {
    checkGameOver();
  }
}

function evaluateBoard(tempBoard) {
  let toadsBlocked = 0;
  for (let i = 0; i < tempBoard.length; i++) {
    if (tempBoard[i] === 'T') {
      const next1 = i + 1 < tempBoard.length ? tempBoard[i + 1] : null;
      const next2 = i + 2 < tempBoard.length ? tempBoard[i + 2] : null;
      if (next1 !== '_' && (next2 !== '_' || next1 === 'T')) {
        toadsBlocked++;
      }
    }
  }
  return toadsBlocked;
}

function switchPlayer() {
  currentPlayer = currentPlayer === 'T' ? 'F' : 'T';
  statusP.innerHTML = `Your move: Click a ${
  currentPlayer==='T'
    ? '<img src="toadschar.png" alt="Toad" class="status-icon"> Toad'
    : '<img src="frogchar.png" alt="Frog" class="status-icon"> Frog'
}.`;

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

function checkGameOver() {
  const toadsCanMove = hasValidMove('T', 1);
  const frogsCanMove = hasValidMove('F', -1);

  if (!toadsCanMove && !frogsCanMove) {
    statusP.innerHTML = `🎉 ${
  currentPlayer === 'T'
    ? '<img src="toadschar.png" alt="Toads" class="status-icon"> Toads'
    : '<img src="frogchar.png" alt="Frogs" class="status-icon"> Frogs'
} win!`;

    endGame();
  } else if (!toadsCanMove) {
     statusP.innerHTML = `🎉 <img src="frogchar.png" alt="Frogs" class="status-icon"> Frogs win!`;
    endGame();
  } else if (!frogsCanMove) {
    statusP.innerHTML = `🎉 <img src="toadschar.png" alt="Toads" class="status-icon"> Toads win!`;
    endGame();
  } else if (numPlayers === 2) {
    statusP.innerHTML = `Your move: Click a ${
  currentPlayer==='T'
    ? '<img src="toadschar.png" alt="Toad" class="status-icon"> Toad'
    : '<img src="frogchar.png" alt="Frog" class="status-icon"> Frog'
}.`;

  } else {
    statusP.innerHTML = `Your move: Click a <img src="toadschar.png" alt="Toad" class="status-icon"> Toad.`;
  }
}

function endGame() {
  gameOver = true;
  document.getElementById('restartBtn').style.display = 'inline-block';
  document.getElementById('restartBtn').disabled = false;
}

function restartGame() {
  document.getElementById("gameSettings").style.display = "block";
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

function updateAITurnStatus() {
  statusP.innerHTML = `<img src="frogchar.png" class="status-icon"> Frog turn!`;
  
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('restartBtn').addEventListener('click', restartGame);
  document.getElementById('startBtn').addEventListener('click', setupGame);
});
