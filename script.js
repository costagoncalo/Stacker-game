//* -----------------------
//* PREPARATION PHASE
//* -----------------------

// Select the relevant elements from the page
const grid = document.querySelector('.grid');
const stackBtn = document.querySelector('.stack');
const scoreCounter = document.querySelector('.score-counter');
const endGameScreen = document.querySelector('.end-game-screen');
const endGameText = document.querySelector('.end-game-text');
const playAgainButton = document.querySelector('.play-again');

// Create the matrix for the grid
// 0 = empty cell
// 1 = bar
const gridMatrix = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0], // This is our starting currentRowIndex (see below)
];

// Initialise the variables needed for the game setup
let currentRowIndex = gridMatrix.length - 1;
// We start at the last index of the matrix as that is the
// bottom of the grid as displayed in the game
let barDirection = 'right';
let barSize = 3;
let isGameOver = false;
let score = 0;

// *---------------------------
// * FUNCTIONS
// *---------------------------

function draw() {
  // First, reset the grid
  grid.innerHTML = '';

  gridMatrix.forEach(function (rowContent) {
    rowContent.forEach(function (cellContent) {
      // Create a cell
      const cell = document.createElement('div');
      cell.classList.add('cell');

      // The cells that the bar occupies
      if (cellContent === 1) {
        cell.classList.add('bar');
      }

      // Put the cell in the grid
      grid.appendChild(cell);
    });
  });
}

function moveRight(row) {
  row.pop();
  row.unshift(0);
}

function moveLeft(row) {
  row.shift();
  row.push(0);
}

function isRightEdge(row) {
  // Check if the right-most element of `row` has a value of 1.
  // If it does, then we know the bar has reached the right edge.
  const lastElement = row[row.length - 1];
  return lastElement === 1;
}

function isLeftEdge(row) {
  // As above for `isRightEdge` but for the left-most element.
  const firstElement = row[0];
  return firstElement === 1;
}

function moveBar() {
  const currentRow = gridMatrix[currentRowIndex];

  if (barDirection === 'right') {
    moveRight(currentRow);

    // After moving the bar to the right, if it reaches the right edge,
    // we need to move the bar to the left in the next loop.
    if (isRightEdge(currentRow)) {
      barDirection = 'left';
    }
  } else if (barDirection === 'left') {
    moveLeft(currentRow);

    // Vice-versa.
    if (isLeftEdge(currentRow)) {
      barDirection = 'right';
    }
  }
}

// *---------------------------
// * GAME LOGIC / CONTROLS
// *---------------------------
function endGame(isVictory) {
  if (isVictory) {
    endGameText.innerHTML = 'YOU<br>WON';
    endGameScreen.classList.add('win');
  }

  endGameScreen.classList.remove('hidden');
}

function onPlayAgain() {
  location.reload();
}

function checkWin() {
  // We win if we get to the top of the grid
  if (currentRowIndex === 0 && !isGameOver) {
    updateScore(); // Make sure we update the score for the last stack when we win
    isGameOver = true;
    clearInterval(gameInterval);
    endGame(true);
  }
}

function checkLost() {
  // Save the references to the current and previous rows
  const currentRow = gridMatrix[currentRowIndex];
  const prevRow = gridMatrix[currentRowIndex + 1];

  // If there is no previous row (i.e. at game start)
  // then exit the function
  if (!prevRow) return;

  // Check whether there is at least one accumulated stack
  // element under each bar element
  for (let i = 0; i < currentRow.length; i++) {
    // If there is no accumulated stack element below a bar element...
    if (currentRow[i] === 1 && prevRow[i] === 0) {
      // ...remove the overhanging bar pieces for both the current stack
      // and for the bar in the next loop
      currentRow[i] = 0;
      barSize--;

      // If the bar has no more pieces left, we've lost the game!
      if (barSize === 0) {
        isGameOver = true;
        clearInterval(gameInterval);
        endGame(false);
      }
    }
  }
}

function updateScore() {
  score += barSize;
  scoreCounter.innerText = score.toString().padStart(5, '0');
}

function onStack() {
  // Check if game won or lost
  checkLost();
  checkWin();

  // If the game is over, stop this function here
  if (isGameOver) return;

  // Update the score
  updateScore();

  // Move the current row up one and...
  currentRowIndex = currentRowIndex - 1;
  barDirection = 'right';

  // ...update `gridMatrix` to add a bar to the new row
  // starting from the first column/element
  for (let i = 0; i < barSize; i++) {
    gridMatrix[currentRowIndex][i] = 1;
  }

  // When we call the `draw` function, the cells which the bar occupied
  // in the row when we clicked "STACK" will retain the `.bar` style.
  // As we have just incremented the `currentRowIndex` variable, the moving
  // bar will be on the row above.
  draw();
}

// *---------------------------
// * EVENTS
// *---------------------------
stackBtn.addEventListener('click', onStack);
playAgainButton.addEventListener('click', onPlayAgain);

// *---------------------------
// * START GAME
// *---------------------------
// Show grid on first page load
draw();

function main() {
  moveBar();
  draw();
}

// Start game loop.
// Every 600ms we call `main`:
// - `moveBar()` updates the values in the `gridMatrix` variable;
// - `draw()` updates the display based on the modified `gridMatrix`;
// We will make use of the `gameInterval` variable later.
const gameInterval = setInterval(main, 600);
