export class Sudoku {
  constructor() {
    this.board = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.solution = null;
  }

  generateBoard(difficulty = 'easy') {
    // 1. Generate a full valid board
    this.fillBoard(this.board);
    this.solution = this.board.map(row => [...row]); // Store solution

    // 2. Remove numbers based on difficulty
    let attempts = 5;
    let holes;
    switch (difficulty) {
      case 'medium':
        holes = 40;
        break;
      case 'hard':
        holes = 50;
        break;
      case 'easy':
      default:
        holes = 30;
        break;
    }

    while (holes > 0 && attempts > 0) {
      let row = Math.floor(Math.random() * 9);
      let col = Math.floor(Math.random() * 9);
      while (this.board[row][col] === 0) {
        row = Math.floor(Math.random() * 9);
        col = Math.floor(Math.random() * 9);
      }

      let backup = this.board[row][col];
      this.board[row][col] = 0;

      // Copy board to check for uniqueness (optional optimization: skip for simple generation)
      // For a robust game, we should ensure unique solution, but for this version
      // we'll trust the removal process usually leaves a solvable board.
      // To strictly ensure unique solution requires running the solver.
      
      let copyBoard = this.board.map(r => [...r]);
      let solutions = 0;
      this.solve(copyBoard, () => solutions++);
      
      if (solutions !== 1) {
        this.board[row][col] = backup; // Put it back if multiple solutions or no solution (shouldn't happen if we started full)
        attempts--;
      } else {
        holes--;
      }
    }
    return this.board;
  }

  fillBoard(board) {
    const emptySpot = this.findEmpty(board);
    if (!emptySpot) return true;

    const [row, col] = emptySpot;
    const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let num of nums) {
      if (this.isValid(board, row, col, num)) {
        board[row][col] = num;
        if (this.fillBoard(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  solve(board, callback) {
    const emptySpot = this.findEmpty(board);
    if (!emptySpot) {
      if (callback) callback();
      return true; // Found a solution
    }

    const [row, col] = emptySpot;
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(board, row, col, num)) {
        board[row][col] = num;
        if (this.solve(board, callback)) {
           if (!callback) return true; // If we just want one solution
        }
        board[row][col] = 0;
      }
    }
    return false;
  }

  findEmpty(board) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) return [r, c];
      }
    }
    return null;
  }

  isValid(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num && x !== col) return false;
    }

    // Check col
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num && x !== row) return false;
    }

    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num && (i + startRow !== row || j + startCol !== col)) {
          return false;
        }
      }
    }
    return true;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  checkWin(currentBoard) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0) return false; // Not full
        if (!this.isValid(currentBoard, r, c, currentBoard[r][c])) return false; // Invalid placement
      }
    }
    return true;
  }
}
