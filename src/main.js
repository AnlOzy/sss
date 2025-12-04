import './style.css'
import { Sudoku } from './sudoku.js'

const sudoku = new Sudoku();
let currentBoard = [];
let initialBoard = [];
let selectedCell = null;
let timerInterval;
let seconds = 0;
let mistakes = 0;
const MAX_MISTAKES = 3;

// DOM Elements
const boardEl = document.getElementById('board');
const difficultySelect = document.getElementById('difficulty');
const newGameBtn = document.getElementById('new-game-btn');
const timerEl = document.getElementById('timer');
const mistakesEl = document.getElementById('mistakes');
const numpadBtns = document.querySelectorAll('.num-btn');
const eraseBtn = document.getElementById('erase-btn');
const checkBtn = document.getElementById('check-btn');

function initGame() {
  const difficulty = difficultySelect.value;
  const board = sudoku.generateBoard(difficulty);

  // Deep copy for initial state to know which cells are fixed
  initialBoard = board.map(row => [...row]);
  currentBoard = board.map(row => [...row]);

  mistakes = 0;
  seconds = 0;
  updateMistakes();
  startTimer();
  renderBoard();
  selectCell(null);
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;

      const value = currentBoard[r][c];
      if (value !== 0) {
        cell.textContent = value;
        if (initialBoard[r][c] !== 0) {
          cell.classList.add('initial');
        } else {
          cell.classList.add('user-input');
        }
      }

      cell.addEventListener('click', () => selectCell(cell));
      boardEl.appendChild(cell);
    }
  }
}

function selectCell(cell) {
  // Remove previous selection
  if (selectedCell) {
    selectedCell.classList.remove('selected');
    // Also remove highlighting of same numbers
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('highlighted'));
  }

  selectedCell = cell;

  if (cell) {
    cell.classList.add('selected');
    const val = cell.textContent;
    if (val) {
      highlightNumbers(val);
    }
  }
}

function highlightNumbers(num) {
  document.querySelectorAll('.cell').forEach(cell => {
    if (cell.textContent === num) {
      cell.classList.add('highlighted');
    }
  });
}

function handleInput(num) {
  if (!selectedCell) return;

  const r = parseInt(selectedCell.dataset.row);
  const c = parseInt(selectedCell.dataset.col);

  // Cannot edit initial cells
  if (initialBoard[r][c] !== 0) return;

  // If erasing
  if (num === 0) {
    currentBoard[r][c] = 0;
    selectedCell.textContent = '';
    selectedCell.classList.remove('user-input', 'error');
    return;
  }

  // Check validity immediately for feedback (optional design choice, let's do immediate feedback for mistakes)
  // Actually, standard Sudoku often lets you put anything, but warns you.
  // Let's implement: Allow input. If it conflicts, mark as error? 
  // Or: Strict mode -> if it's not the correct number from solution, count mistake.
  // Let's go with: Check against solution for "Mistakes" counter.

  if (sudoku.solution[r][c] === num) {
    currentBoard[r][c] = num;
    selectedCell.textContent = num;
    selectedCell.classList.add('user-input');
    selectedCell.classList.remove('error');

    // Check win
    if (sudoku.checkWin(currentBoard)) {
      clearInterval(timerInterval);
      setTimeout(() => alert('Congratulations! You won!'), 100);
    }
  } else {
    mistakes++;
    updateMistakes();
    selectedCell.textContent = num;
    selectedCell.classList.add('error');
    if (mistakes >= MAX_MISTAKES) {
      clearInterval(timerInterval);
      setTimeout(() => {
        alert('Game Over! Too many mistakes.');
        initGame();
      }, 100);
    }
  }

  // Re-highlight
  if (selectedCell) selectCell(selectedCell);
}

function updateMistakes() {
  mistakesEl.textContent = mistakes;
}

function startTimer() {
  clearInterval(timerInterval);
  timerEl.textContent = '00:00';
  timerInterval = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;
  }, 1000);
}

// Event Listeners
newGameBtn.addEventListener('click', initGame);

numpadBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const num = parseInt(btn.dataset.num);
    handleInput(num);
  });
});

eraseBtn.addEventListener('click', () => handleInput(0));

checkBtn.addEventListener('click', () => {
  // Simple check: validate current board state against rules (not solution)
  // This is useful if user wants to know if they have any logical conflicts so far
  // But our input handler already checks against solution.
  // Let's make this button fill in a correct number for the selected cell (Hint)
  if (!selectedCell) return;
  const r = parseInt(selectedCell.dataset.row);
  const c = parseInt(selectedCell.dataset.col);

  if (initialBoard[r][c] === 0) {
    handleInput(sudoku.solution[r][c]);
  }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!selectedCell) return;

  const key = e.key;
  if (key >= '1' && key <= '9') {
    handleInput(parseInt(key));
  } else if (key === 'Backspace' || key === 'Delete') {
    handleInput(0);
  } else if (key.startsWith('Arrow')) {
    // Navigation
    const r = parseInt(selectedCell.dataset.row);
    const c = parseInt(selectedCell.dataset.col);
    let newR = r, newC = c;

    if (key === 'ArrowUp') newR = Math.max(0, r - 1);
    if (key === 'ArrowDown') newR = Math.min(8, r + 1);
    if (key === 'ArrowLeft') newC = Math.max(0, c - 1);
    if (key === 'ArrowRight') newC = Math.min(8, c + 1);

    const nextCell = document.querySelector(`.cell[data-row="${newR}"][data-col="${newC}"]`);
    if (nextCell) selectCell(nextCell);
  }
});

// Start
initGame();
