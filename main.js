// Sudoku generator and solver functions
function generateSudoku(difficulty) {
    const solution = generateSolution();
    const puzzle = removeCells(solution, difficulty);
    return { puzzle, solution };
}

function generateSolution() {
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    fillGrid(grid);
    return grid;
}

function fillGrid(grid) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                shuffle(numbers);
                for (let num of numbers) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (fillGrid(grid)) {
                            return true;
                        }
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }

    // Check 3x3 box
    let boxRow = Math.floor(row / 3) * 3;
    let boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[boxRow + i][boxCol + j] === num) return false;
        }
    }

    return true;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function removeCells(solution, difficulty) {
    const puzzle = JSON.parse(JSON.stringify(solution));
    const cellsToRemove = {
        easy: 30,
        medium: 40,
        hard: 50
    }[difficulty];

    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }
    return puzzle;
}

// Game state
let gameState = {
    currentPuzzle: null,
    solution: null,
    userInputs: [],
    difficulty: 'medium'
};

// DOM elements
const sudokuGrid = document.getElementById('sudokuGrid');
const numberButtons = document.querySelectorAll('.number-button');
const showAnsButton = document.getElementById('ShowAnswer');
const hintButton = document.getElementById('hint');
const undoButton = document.getElementById('Undo');
const checkButton = document.getElementById('CheckSolution');
const difficultySelect =document.getElementById('Difficulty');
const difficultySelectElements = document.getElementsByClassName('difficulty-item')
// Initialize game
function initGame() {
    const { puzzle, solution } = generateSudoku(gameState.difficulty);
    gameState.currentPuzzle = puzzle;
    gameState.solution = solution;
    gameState.userInputs = [];
    renderSudokuGrid(puzzle);
    setupButtons();
    setupDifficultySelect();
}
// Render Sudoku grid
function renderSudokuGrid(puzzle) {
    sudokuGrid.innerHTML = '';
    puzzle.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            
            if (cellValue !== 0) {
                cell.textContent = cellValue;
                cell.dataset.default = 'true';
            } else {
                cell.addEventListener('click', handleCellClick);
            }
            
            sudokuGrid.appendChild(cell);
        });
    });
}

// Handle cell click
function handleCellClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    if (cell.dataset.default != 'true') {
        sudokuGrid.querySelectorAll('.active').forEach(c => c.classList.remove('active'));
        cell.classList.add('active');
    }
}

// Handle number button click
function handleNumberButtonClick(number) {
    const activeCell = sudokuGrid.querySelector('.active');
    if (activeCell && activeCell.dataset.default !== 'true') {
        const row = parseInt(activeCell.dataset.row);
        const col = parseInt(activeCell.dataset.col);
        
        gameState.userInputs.push({ row, col, value: gameState.currentPuzzle[row][col] });
        gameState.currentPuzzle[row][col] = number;
        activeCell.textContent = number;
    }
}

// Show answer
function showAnswer() {
    const answerGrid = document.createElement('div');
    answerGrid.classList.add('sudoku-container');
    gameState.solution.forEach(row => {
        row.forEach(cellValue => {
            const cell = document.createElement('div');
            cell.textContent = cellValue;
            cell.classList.add('sudoku-cell');
            answerGrid.appendChild(cell);
        });
    });
    
    const modal = document.createElement('div');
    modal.classList.add('py-2');
    modal.appendChild(answerGrid);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', () => modal.remove());
}

// Give hint
function giveHint() {
    const emptyCells = [];
    gameState.currentPuzzle.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            if (cellValue === 0) {
                emptyCells.push({ row: rowIndex, col: colIndex });
            }
        });
    });
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const hintValue = gameState.solution[randomCell.row][randomCell.col];
        gameState.currentPuzzle[randomCell.row][randomCell.col] = hintValue;
        const cell = sudokuGrid.querySelector(`[data-row="${randomCell.row}"][data-col="${randomCell.col}"]`);
        cell.textContent = hintValue;
    }
}

// Undo last action
function undoLastAction() {
    if (gameState.userInputs.length > 0) {
        const lastInput = gameState.userInputs.pop();
        gameState.currentPuzzle[lastInput.row][lastInput.col] = lastInput.value;
        const cell = sudokuGrid.querySelector(`[data-row="${lastInput.row}"][data-col="${lastInput.col}"]`);
        cell.textContent = lastInput.value || '';
    }
}

// Check solution
function checkSolution() {
    let isCorrect = true;
    gameState.currentPuzzle.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            if (cellValue !== gameState.solution[rowIndex][colIndex]) {
                isCorrect = false;
                const cell = sudokuGrid.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);
                cell.classList.add('incorrect');
            }
        });
    });
    
    if (isCorrect) {
        showConfetti();
        showCustomAlert('Congratulations! You solved the Sudoku puzzle!', 
            () => {
              // Retry function - clear the board and let the user try again
              gameState.currentPuzzle = JSON.parse(JSON.stringify(gameState.solution));
              gameState.userInputs = [];
              renderSudokuGrid(gameState.currentPuzzle);
            },
            () => {
              // New Game function - generate a new puzzle
              initGame();
            }
          );
    }else{
        showCustomAlert('Sorry, the solution is incorrect. Would you like to try again or start a new game?',
            () => {
              // Retry function - clear incorrect highlights
              sudokuGrid.querySelectorAll('.incorrect').forEach(cell => cell.classList.remove('incorrect'));
            },
            () => {
              // New Game function - generate a new puzzle
              initGame();
            }
          );
    }
}

// Show confetti
function showConfetti() {
    const count = 200,
    defaults = {
        origin: { y: 0.7 },
    };

    function fire(particleRatio, opts) {
    confetti(
        Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
        })
    );
    }

    fire(0.25, {
    spread: 26,
    startVelocity: 55,
    });

    fire(0.2, {
    spread: 60,
    });

    fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    });

    fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    });

    fire(0.1, {
    spread: 120,
    startVelocity: 45,
    });
}

// Setup buttons
function setupButtons() {
    showAnsButton.addEventListener('click', showAnswer);
    hintButton.addEventListener('click', giveHint);
    undoButton.addEventListener('click', undoLastAction);
    checkButton.addEventListener('click', checkSolution); 
}

// Setup difficulty select
function setupDifficultySelect() {
    difficultySelect.innerText = gameState.difficulty;
    Array.from(difficultySelectElements).forEach((element) => {
        element.addEventListener('click', (e) => {
            const newDifficulty = e.target.textContent.toLowerCase();
            if (newDifficulty !== gameState.difficulty) {
                gameState.difficulty = newDifficulty;
                difficultySelect.textContent = e.target.textContent;
                initGame();
            }
        });
    });
    
}

// Event listeners
numberButtons.forEach(button => {
    button.addEventListener('click', () => handleNumberButtonClick(parseInt(button.textContent)));
});

function showCustomAlert(message, onRetry, onNewGame) {
    const modal = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const retryButton = document.getElementById('retryButton');
    const newGameButton = document.getElementById('newGameButton');
  
    alertMessage.textContent = message;
    modal.style.display = 'block';
  
    retryButton.onclick = () => {
      modal.style.display = 'none';
      if (onRetry) onRetry();
    };
  
    newGameButton.onclick = () => {
      modal.style.display = 'none';
      if (onNewGame) onNewGame();
    };
  }
  

// Initialize game
initGame();