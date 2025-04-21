import { firebaseApp, analytics, database } from '../scripts/firebaseConfig.js';
import { sendRPC } from './chat.js';

const PIECE_RADIUS = 18;
const PIECE_DIAMETER = PIECE_RADIUS + PIECE_RADIUS;
const VERTICAL_TOLERANCE = 4;

const Stage = {
  DEMO: 'demo',
  CHOOSING: 'choosing',
  PLAYING: 'playing',
  BEARING: 'bearing',
  FINISHED: 'finished',
};

const pieces = document.querySelectorAll('.piece');

const boardElement = document.getElementById('board');
const boardLeftOffset = boardElement.getBoundingClientRect().left;
const boardTopOffset = boardElement.getBoundingClientRect().top;
//console.log('boardLeftOffset = ', boardLeftOffset, ', boardTopOffset = ', boardTopOffset);

console.log('Using Firebase in app.js:', firebaseApp);
const db = database;
console.log(analytics);
console.log(db);

// add dice
document.addEventListener('DOMContentLoaded', drawDice);

function drawDice() {
  let dice_white1_top, dice_white2_top, dice_red1_top, dice_red2_top;
  let red_face, white_face;

  console.log(
    'in drawDice(), game.myPlayer = ' +
      game.myPlayer +
      ', game.currentTurn = ' +
      game.currentTurn
  );

  // delete existing dice elements
  removeHtmlElement('dice_white1');
  removeHtmlElement('dice_white2');
  removeHtmlElement('dice_red1');
  removeHtmlElement('dice_red2');

  // Create new image elements
  let dice_white1 = document.createElement('img');
  dice_white1.id = 'dice_white1';
  let dice_white2 = document.createElement('img');
  dice_white2.id = 'dice_white2';
  let dice_red1 = document.createElement('img');
  dice_red1.id = 'dice_red1';
  let dice_red2 = document.createElement('img');
  dice_red2.id = 'dice_red2';

  // Set the source of the images
  if (game.myPlayer == 'r') {
    red_face =
      game.currentTurn == 'r'
        ? 'images/dice-red-click.png'
        : 'images/dice-red-six.png';
    white_face = 'images/dice-six.png';
  } else {
    white_face =
      game.currentTurn == 'w' ? 'images/dice-click.png' : 'images/dice-six.png';
    red_face = 'images/dice-red-six.png';
  }
  // apply the above
  dice_white1.src = white_face;
  dice_white2.src = white_face;
  dice_red1.src = red_face;
  dice_red2.src = red_face;

  // Set the size of the images (40px wide and 40px tall)
  dice_white1.width = 40;
  dice_white1.height = 40;
  dice_white2.width = 40;
  dice_white2.height = 40;
  dice_red1.width = 40;
  dice_red1.height = 40;
  dice_red2.width = 40;
  dice_red2.height = 40;

  // Set the style to position the images - player's own dice are at the top
  console.log('In DOMContentLoaded');
  if (game.myPlayer == 'r') {
    dice_white1_top = '310px';
    dice_white2_top = '360px';
    dice_red1_top = '110px';
    dice_red2_top = '160px';
  } else {
    dice_white1_top = '110px';
    dice_white2_top = '160px';
    dice_red1_top = '310px';
    dice_red2_top = '360px';
  }

  dice_white1.style.position = 'absolute';
  dice_white1.style.top = dice_white1_top;
  dice_white1.style.left = '10px';
  dice_white2.style.position = 'absolute';
  dice_white2.style.top = dice_white2_top;
  dice_white2.style.left = '10px';

  dice_red1.style.position = 'absolute';
  dice_red1.style.top = dice_red1_top;
  dice_red1.style.left = '10px';
  dice_red2.style.position = 'absolute';
  dice_red2.style.top = dice_red2_top;
  dice_red2.style.left = '10px';

  // Append the images to the 'board' div
  document.getElementById('board').appendChild(dice_white1);
  document.getElementById('board').appendChild(dice_white2);
  document.getElementById('board').appendChild(dice_red1);
  document.getElementById('board').appendChild(dice_red2);

  dice_white1.addEventListener('click', rollWhiteDice);
  dice_white2.addEventListener('click', rollWhiteDice);
  dice_red1.addEventListener('click', rollRedDice);
  dice_red2.addEventListener('click', rollRedDice);
}

function canBearOff() {
  const playerColor = game.myPlayer;
  const homeStart = playerColor === 'r' ? 19 : 1;
  const homeEnd = playerColor === 'r' ? 26 : 6;

  // Check all positions outside the home board
  for (let i = 1; i <= 26; i++) {
    // Skip the home board positions
    if (i >= homeStart && i <= homeEnd) {
      continue;
    }

    // Check if this position contains any pieces of the player's color
    const position = board.contents[i];
    if (
      Array.isArray(position) &&
      position.some(
        (piece) => typeof piece === 'string' && piece.startsWith(playerColor)
      )
    ) {
      return false; // Found a piece outside home board
    }
  }

  // No pieces found outside home board
  return true;
}

function isHomeEmpty() {
  const playerColor = game.myPlayer;
  const homeStart = playerColor === 'r' ? 19 : 1;
  const homeEnd = playerColor === 'r' ? 26 : 6;

  for (let i = homeStart; i <= homeEnd; i++) {
    // Check if this position contains any pieces of the player's color
    const position = board.contents[i];

    if (
      Array.isArray(position) &&
      position.some(
        (piece) => typeof piece === 'string' && piece.startsWith(playerColor)
      )
    ) {
      return false; // Found a piece outside home board
    }
  }

  // no pieces found in home board
  return true;
}

function updateGameStage() {
  if (game.stage == Stage.DEMO) return;

  if (canBearOff()) {
    if (isHomeEmpty()) {
      game.stage = Stage.FINISHED;
    } else {
      game.stage = Stage.BEARING;
    }
  } else {
    game.stage = Stage.PLAYING;
  }
}

// remove html element
function removeHtmlElement(id) {
  const element = document.getElementById(id);

  if (element) {
    const parent = element.parentNode;
    parent.removeChild(element);
  }
}

// Helper function to create a delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Playback functions
export async function playbackDiceRoll(param) {
  console.log('In playbackDiceRoll, param = ' + JSON.stringify(param));

  if (param.player == 'w') {
    console.log('About to playback the roll of white dice');
    await rollWhiteDice(param);
  } else {
    console.log('About to playback the roll of red dice');
    await rollRedDice(param);
  }
}

export async function playbackMove(move) {
  console.log('In playbackMove, move = ' + JSON.stringify(move));
  const toColor = board.colorOfPoint(move.to);
  const toOccupied = board.contents[move.to].occupied.length;

  // TRANSPLANTED CODE FROM APPLYMOVE

  // TAKING A BLOT
  if (toColor != game.currentTurn && toOccupied == 1) {
    console.log(
      'In playbackMove, taking blot ' +
        board.contents[move.to].occupied[0] +
        ' with ' +
        move.pieceId
    );
    // board.completeMovePiece(move.to); // NOT REQUIRED, MOVE IS FULLY FORMED

    let barPoint = toColor == 'r' ? 25 : 26;
    let blotPieceId = board.contents[move.to].occupied[0];

    // snap into place
    let posToOccupy = 1; // by definition
    let [x, y] = getPieceCoords(game.myPlayer, move.to, posToOccupy); // first param was move.player
    await animateMovePiece(move.pieceId, x, y, 0.5);

    // animate the blot to the bar. Red bar = 25, White bar = 26
    // let barPoint = game.myPlayer == 'r' ? 26 : 25;
    // let pieceId = board.contents[move.to].occupied[0];
    board.onTheMove = blotPieceId;
    board.completeMovePiece(barPoint);
    board.contents[move.to].occupied = [blotPieceId];

    [x, y] = getPieceCoords(game.myPlayer, barPoint, 1); // was move.player
    // let blotPiece = document.getElementById(blotPieceId);
    await animateMovePiece(blotPieceId, x, y, 0.5);
    board.updatePointOccupation(barPoint);

    consumeDiceMove(move);

    return;
  }

  // END OF TRANSPLANTED CODE FROM APPLYMOVE

  // animate the opponent's move
  let posToOccupy = board.contents[move.to].occupied.length + 1;
  let [x, y] = getPieceCoords(game.myPlayer, move.to, posToOccupy); // ??? specify our coordinate system, rather than player who made move

  board.movePiece(move.from, move.to);

  board.updatePointOccupation(move.from);
  board.updatePointOccupation(move.to);

  // let piece = document.getElementById(move.pieceId);
  consumeDiceMove(move);

  await animateMovePiece(move.pieceId, x, y, 0.5);
  game.applyControls();
  // end of animate oppononent's move
}

// animate rolling white dice - call with predetermined dice numbers, or via event listener for a real 'throw'
// note that if rollWhiteDice is invoked from an event listener, the first param will be an event. We can use this to
// determine whether to have default values for the dice throws.
async function rollWhiteDice(param) {
  let finalIndex1, finalIndex2;

  // Check if first parameter is an event (indicates dice clicked rather than playback)
  const isEvent = param && param.target !== undefined;

  if (isEvent && game.myPlayer != 'w') return; // can be clicked by white player only, but playback still works

  if (isEvent) {
    if (game.whiteDiceActive == false) return;
    game.whiteDiceActive = false;
  }

  // Set default values accordingly
  const dice1Result = isEvent ? 0 : param.dice1 ?? 0;
  const dice2Result = isEvent ? 0 : param.dice2 ?? 0;

  // Array of dice image paths
  var diceFaces = [
    'images/dice-one.png',
    'images/dice-two.png',
    'images/dice-three.png',
    'images/dice-four.png',
    'images/dice-five.png',
    'images/dice-six.png',
  ];

  if (dice1Result == 0 && dice2Result == 0) {
    finalIndex1 = Math.floor(Math.random() * diceFaces.length);
    finalIndex2 = Math.floor(Math.random() * diceFaces.length);

    // communicate to the other player via RPC
    sendRPC('diceRoll', {
      player: 'w',
      dice1: finalIndex1 + 1,
      dice2: finalIndex2 + 1,
    });
  } else {
    finalIndex1 = dice1Result - 1; // make 0-based
    finalIndex2 = dice2Result - 1;
  }

  console.log('White dice clicked! Rolling the dice...');

  // clear previous throw
  board.diceThrows.fill(0);

  const dice_white1 = document.getElementById('dice_white1');
  const dice_white2 = document.getElementById('dice_white2');

  // Simulate rolling by changing the dice face multiple times
  for (let i = 0; i < 5; i++) {
    // Generate a random number between 0 and 5 (inclusive)
    let randomIndex1 = Math.floor(Math.random() * diceFaces.length);
    let randomIndex2 = Math.floor(Math.random() * diceFaces.length);

    // Change the dice image to a random face
    dice_white1.src = diceFaces[randomIndex1];
    dice_white2.src = diceFaces[randomIndex2];

    // Wait for 100ms before changing the face again
    await sleep(100);
  }

  // Wait for half a second before the final roll
  await sleep(100);

  // Final roll
  dice_white1.src = diceFaces[finalIndex1];
  dice_white2.src = diceFaces[finalIndex2];

  board.diceThrows[0] = finalIndex1 + 1;
  board.diceThrows[1] = finalIndex2 + 1;
  if (board.diceThrows[0] == board.diceThrows[1]) {
    board.diceThrows[2] = board.diceThrows[3] = board.diceThrows[0];
  }

  console.log('White dice rolled: ', board.diceThrows);
}

// animate rolling red dice
async function rollRedDice(param) {
  let finalIndex1, finalIndex2;

  // Check if first parameter is an event (indicates dice clicked rather than playback)
  const isEvent = param && param.target !== undefined;

  if (isEvent && game.myPlayer != 'r') return; // can be clicked by red player only, but playback still works

  if (isEvent) {
    if (game.redDiceActive == false) return;
    game.redDiceActive = false;
  }

  // Set default values accordingly
  const dice1Result = isEvent ? 0 : param.dice1 ?? 0;
  const dice2Result = isEvent ? 0 : param.dice2 ?? 0;

  // Array of dice image paths
  var diceFaces = [
    'images/dice-red-one.png',
    'images/dice-red-two.png',
    'images/dice-red-three.png',
    'images/dice-red-four.png',
    'images/dice-red-five.png',
    'images/dice-red-six.png',
  ];

  if (dice1Result == 0 && dice2Result == 0) {
    finalIndex1 = Math.floor(Math.random() * diceFaces.length);
    finalIndex2 = Math.floor(Math.random() * diceFaces.length);

    // communicate to the other player via RPC
    sendRPC('diceRoll', {
      player: 'r',
      dice1: finalIndex1 + 1,
      dice2: finalIndex2 + 1,
    });
  } else {
    finalIndex1 = dice1Result - 1; // make 0-based
    finalIndex2 = dice2Result - 1;
  }

  console.log('Red dice clicked! Rolling the dice...');

  // clear previous throw
  board.diceThrows.fill(0);

  const dice_red1 = document.getElementById('dice_red1');
  const dice_red2 = document.getElementById('dice_red2');

  // Simulate rolling by changing the dice face multiple times
  for (let i = 0; i < 5; i++) {
    // Generate a random number between 0 and 5 (inclusive)
    let randomIndex1 = Math.floor(Math.random() * diceFaces.length);
    let randomIndex2 = Math.floor(Math.random() * diceFaces.length);

    // Change the dice image to a random face
    dice_red1.src = diceFaces[randomIndex1];
    dice_red2.src = diceFaces[randomIndex2];

    // Wait for 100ms before changing the face again
    await sleep(100);
  }

  // Wait for some time before the final roll
  await sleep(100);

  // // ??? simulating a 5 and 3 rolled
  finalIndex1 = 4;
  finalIndex2 = 2;

  // Final roll
  dice_red1.src = diceFaces[finalIndex1];
  dice_red2.src = diceFaces[finalIndex2];

  board.diceThrows[0] = finalIndex1 + 1;
  board.diceThrows[1] = finalIndex2 + 1;
  if (board.diceThrows[0] == board.diceThrows[1]) {
    board.diceThrows[2] = board.diceThrows[3] = board.diceThrows[0];
  }

  console.log('Red dice rolled: ', board.diceThrows);
}

document.querySelector('.test_button2').addEventListener('click', function () {
  // demoRegisterForChat();

  // if (game.currentTurn == 'w') {
  //   game.currentTurn = 'r';
  // } else {
  //   game.currentTurn = 'w';
  // }

  // drawBoardNoAnimation();

  // console.log('CurrentTurn is now ' + game.currentTurn);

  console.log(
    'Status: ' +
      'game.myPlayer = ' +
      game.myPlayer +
      ', game.currentTurn = ' +
      game.currentTurn
  );
});

class CoordinateMapper {
  constructor() {
    this.coordinates = new Map();
  }

  // Add a coordinate mapping
  addCoordinate(pt, pos, x, y) {
    const key = `${x},${y}`;
    this.coordinates.set(key, { pt, pos });
  }

  // Find the exact point and pos for given x,y coordinates
  findPointAndPos(x, y) {
    console.log(
      'findPointAndPos called with game.myPlayer = ' +
        game.myPlayer +
        ', x = ' +
        x +
        ', y = ' +
        y
    );
    const key = `${x},${y}`;
    const originalResult = this.coordinates.get(key);
    console.log('findPointAndPos, key found = ' + JSON.stringify(originalResult));

    if (originalResult === undefined) return { pt: 0, pos: 0 };

    // Create a new object with the values from originalResult
    const result = { pt: originalResult.pt, pos: originalResult.pos };
    
    // reverse point when playing as red
    if (game.myPlayer == 'r') {
      result.pt = 25 - result.pt;
    }

    console.log('findPointAndPos returning ' + JSON.stringify(result));
    return result;
  }
}

const game = {
  myPlayer: 'w',
  currentTurn: 'w',
  currentMove: {},
  redDiceActive: true,
  whiteDiceActive: true,
  stage: Stage.DEMO,

  eventTurnFinished() {
    console.log('EVENT TURN FINISHED');

    // make it the other player's turn
    if (this.currentTurn == 'w') {
      this.currentTurn = 'r';

      // display dice-click image on red dice
      let dice_red1 = document.getElementById('dice_red1');
      let dice_red2 = document.getElementById('dice_red2');

      if (this.myPlayer == 'r') {
        dice_red1.src = 'images/dice-red-click.png';
        dice_red2.src = 'images/dice-red-click.png';
        this.whiteDiceActive = false;
        this.redDiceActive = true;
      }
    } else {
      this.currentTurn = 'w';

      // display dice-click image on white dice
      let dice_white1 = document.getElementById('dice_white1');
      let dice_white2 = document.getElementById('dice_white2');

      if (this.myPlayer == 'w') {
        dice_white1.src = 'images/dice-click.png';
        dice_white2.src = 'images/dice-click.png';
        this.whiteDiceActive = true;
        this.redDiceActive = false;
      }
    }

    this.applyControls();
  },

  applyControls() {
    // dice
    const dice_red1 = document.getElementById('dice_red1');
    const dice_red2 = document.getElementById('dice_red2');
    const dice_white1 = document.getElementById('dice_white1');
    const dice_white2 = document.getElementById('dice_white2');

    if (game.myPlayer == 'w') {
      dice_red1.style.opacity = '0.5';
      dice_red2.style.opacity = '0.5';

      dice_white1.style.opacity = '1.0';
      dice_white2.style.opacity = '1.0';
    } else {
      dice_white1.style.opacity = '0.5';
      dice_white2.style.opacity = '0.5';

      dice_red1.style.opacity = '1.0';
      dice_red2.style.opacity = '1.0';
    }
  },
};

const mapper = new CoordinateMapper();
defineCoordMap();

// Create the board object
//  - 0 represents nowhere or invalid position
//  - 1 to 24 represents the actual points
//  - 25 represents red-bar
//  - 26 represents white-bar
const board = {
  contents: Array.from({ length: 27 }, () => ({
    color: '',
    occupied: [],
  })),

  diceThrows: [0, 0, 0, 0],

  onTheMove: '', // piece id that is currently on the move

  // Method to update a specific point by index
  updatePoint(index, newContent) {
    if (index < 0 || index >= this.contents.length) {
      console.error('Index out of bounds');
      return;
    }
    this.contents[index] = { ...this.contents[index], ...newContent };
  },

  resetPiecesPosition(piece) {
    piece.style.top = '';
    piece.style.left = '6px';
  },

  // Method to reset the board
  resetBoard() {
    this.contents = this.contents.map(() => ({
      occupied: [],
    }));

    // Starting positions
    this.contents[1].occupied = ['r1', 'r2'];
    this.contents[2].occupied = [];
    this.contents[3].occupied = [];
    this.contents[4].occupied = [];
    this.contents[5].occupied = [];
    this.contents[6].occupied = ['w1', 'w2', 'w3', 'w4', 'w5'];
    this.contents[7].occupied = [];
    this.contents[8].occupied = ['w6', 'w7', 'w8'];
    this.contents[9].occupied = [];
    this.contents[10].occupied = [];
    this.contents[11].occupied = [];
    this.contents[12].occupied = ['r3', 'r4', 'r5', 'r6', 'r7'];
    this.contents[13].occupied = ['w9', 'w10', 'w11', 'w12', 'w13'];
    this.contents[14].occupied = [];
    this.contents[15].occupied = [];
    this.contents[16].occupied = [];
    this.contents[17].occupied = ['r8', 'r9', 'r10'];
    this.contents[18].occupied = [];
    this.contents[19].occupied = ['r11', 'r12', 'r13', 'r14', 'r15'];
    this.contents[20].occupied = [];
    this.contents[21].occupied = [];
    this.contents[22].occupied = [];
    this.contents[23].occupied = [];
    this.contents[24].occupied = ['w14', 'w15'];
  },

  completeMovePiece(toPoint) {
    console.log('in board.completeMovePiece, toPoint=' + toPoint);
    this.contents[toPoint].occupied.push(board.onTheMove);
    board.onTheMove = ''; // finished moving
  },

  movePiece(fromPoint, toPoint) {
    let pieceId = this.contents[fromPoint].occupied.at(-1);
    this.contents[fromPoint].occupied.pop();
    this.contents[toPoint].occupied.push(pieceId);
  },

  updatePointOccupation(reqPointNumber) {
    // reverse point numbers for points 1 - 24 when player is red
    const pointNumber =
      game.myPlayer == 'r' && reqPointNumber <= 24
        ? 25 - reqPointNumber
        : reqPointNumber;

    const pieceNumberId = 'pieceNumber' + pointNumber;
    const pointsNumber = document.getElementById(pieceNumberId);

    let occupied = this.contents[reqPointNumber].occupied.length;
    //let color = this.contents[pointNumber].color;
    let pointColor = this.colorOfPoint(reqPointNumber);

    let limit = pointNumber < 25 ? 5 : 1; // 5 points without occupied number, 1 on bars (points 25 and 26)

    if (occupied <= limit) {
      console.log('in updatePointOccupation: reqPointNumber=' + reqPointNumber);
      pointsNumber.textContent = '';
    } else {
      pointsNumber.textContent = '' + occupied;
      if (pointColor == 'w') pointsNumber.style.color = 'gray';
      if (pointColor == 'r') pointsNumber.style.color = 'white';
    }
  },

  colorOfPoint(pointNumber) {
    if (this.contents[pointNumber].occupied.length == 0) {
      return '';
    } else {
      return this.contents[pointNumber].occupied[0][0];
    }
  },

  // Method to print the current state of the board
  printBoard() {
    console.log(this.contents);
  },
};

export async function startGame(playerAssign, isChallenger) {
  if (playerAssign) {
    game.stage = Stage.PLAYING;
    game.myPlayer = isChallenger ? 'r' : 'w';
    game.currentTurn = 'r';
    game.redDiceActive = true;
    game.whiteDiceActive = false;
  } else {
    game.stage = Stage.DEMO;
    game.myPlayer = 'w';
    game.currentTurn = 'w';
    game.redDiceActive = false;
    game.whiteDiceActive = true;
  }

  pieces.forEach((current) => {
    board.resetPiecesPosition(current);
  });

  board.resetBoard();
  setupMouseEvents();
  await drawBoardWithAnimation(game.myPlayer);
  console.log(
    'About to apply game controls with myPlayer = ' +
      game.myPlayer +
      ' and currentTurn = ' +
      game.currentTurn
  );
  game.applyControls();
  console.log('After applying game controls');
}

let isPieceDragging = false; // Global flag to track if a piece is being dragged

function setupMouseEvents() {
  // Install event listeners on each piece
  pieces.forEach((piece) => {
    piece.addEventListener('mousedown', (e) => {
      if (isPieceDragging) {
        // If a piece is already being dragged, ignore this event
        return;
      }

      // const type = piece.dataset.type;

      // Determine the piece's position
      const x = piece.offsetLeft + PIECE_RADIUS;
      const y = piece.offsetTop + PIECE_RADIUS;
      const { pt, pos } = mapper.findPointAndPos(x, y);
      console.log('in mouseDown 1, pt = ' + pt + ', pos = ' + pos);

      // Check if the piece is movable
      if (!isPieceMovable(piece, pt, pos)) {
        console.log('Movement disallowed.');
        return; // Exit the handler if the piece cannot be moved
      }

      // Bring the current piece to the front
      piece.style.zIndex = '1000'; // Set a high z-index value

      // Record the starting point of the move
      // let point = identifyPoint(e.pageX, e.pageY);
      console.log('Grabbed piece on point ' + pt);
      game.currentMove.pieceId = piece.id;
      game.currentMove.player = game.currentTurn;
      game.currentMove.from = pt;
      game.currentMove.to = 0;

      // Mark the piece as being moved
      board.onTheMove = piece.id;
      board.contents[pt].occupied.pop();
      board.updatePointOccupation(pt);

      // Store the starting position
      // let startX = piece.style.left || '0px';
      // let startY = piece.style.top || '0px';

      // Set the global flag to indicate a piece is being dragged
      isPieceDragging = true;

      // Define the mousemove event handler
      const onMouseMove = (event) => {
        // Update the piece's position based on mouse movement
        piece.style.left =
          event.pageX - piece.offsetWidth / 2 - boardLeftOffset + 'px';
        piece.style.top =
          event.pageY - piece.offsetHeight / 2 - boardTopOffset + 'px';
        let point = identifyPoint(event.pageX, event.pageY);
        console.log('in onMouseMove, point = ' + point);
        applyHighlight(point, 1);
      };

      // Attach the mousemove event listener to the document
      document.addEventListener('mousemove', onMouseMove);

      // Define the mouseup event handler
      const onMouseUp = (event) => {
        // Remove the mousemove event listener to stop tracking mouse movements
        document.removeEventListener('mousemove', onMouseMove);

        // Reset the piece's z-index and remove highlights
        piece.style.zIndex = '';
        applyHighlight(0, 0);

        // Record the ending point of the move
        let point = identifyPoint(event.pageX, event.pageY);
        game.currentMove.to = point;
        console.log(
          'On mouseup, move is from point ' +
            game.currentMove.from +
            ' to ' +
            game.currentMove.to
        );

        // Apply the move to the board
        applyMove(game.currentMove);

        // Reset the global flag to indicate the piece is no longer being dragged
        isPieceDragging = false;
      };

      // Attach the mouseup event listener to the document
      document.addEventListener('mouseup', onMouseUp, { once: true });
    });
  });
}

function isValidDiceMove(move) {
  console.log(
    'In isValidDiceMove turn = ' +
      game.currentTurn +
      ' move = ' +
      JSON.stringify(move)
  );

  const moveDistance =
    game.currentTurn == 'w' ? move.from - move.to : move.to - move.from;

  for (let i = 0; i < board.diceThrows.length; i++) {
    if (board.diceThrows[i] == moveDistance) return true;
  }

  return false;
}

function consumeDiceMove(move) {
  const moveDistance =
    game.currentTurn == 'w' ? move.from - move.to : move.to - move.from;

  for (let i = 0; i < board.diceThrows.length; i++) {
    if (board.diceThrows[i] == moveDistance) {
      board.diceThrows[i] = 0;
      break;
    }
  }

  // is the player's turn over?
  if (board.diceThrows.every((element) => element === 0))
    game.eventTurnFinished();
}

async function applyMove(move) {
  // either snap or return depending on move legality

  // const toColor = board.contents[move.to].color;
  const toColor = board.colorOfPoint(move.to);
  const toOccupied = board.contents[move.to].occupied.length;

  // RETURNING
  if (
    move.to == 0 ||
    move.to == 25 ||
    move.to == 26 ||
    move.to == move.from ||
    // (game.currentTurn == 'w' && move.to > move.from) ||
    // (game.currentTurn == 'r' && move.to < move.from) ||
    (toColor != '' && toColor != game.currentTurn && toOccupied > 1) ||
    !isValidDiceMove(move) // moving an available throw
  ) {
    console.log(
      'Returning piece: toColor = ' + toColor + ', toOccupied = ' + toOccupied
    );
    // return back to beginning
    board.contents[move.from].occupied.push(board.onTheMove);
    board.onTheMove = '';
    let posToOccupy = board.contents[move.from].occupied.length;
    let [x, y] = getPieceCoords(game.myPlayer, move.from, posToOccupy);
    await animateMovePiece(move.pieceId, x, y, 0.5);
    board.updatePointOccupation(move.from);

    updateGameStage();

    return;
  }

  // TAKING A BLOT
  if (toColor != game.currentTurn && toOccupied == 1) {
    sendRPC('move', {
      pieceId: move.pieceId,
      player: game.currentTurn,
      from: move.from,
      to: move.to,
    });

    console.log('Taking blot ' + move.pieceId);
    board.completeMovePiece(move.to);

    let barPoint = game.myPlayer == 'r' ? 26 : 25;
    let blotPieceId = board.contents[move.to].occupied[0];

    // snap active piece into place
    let posToOccupy = 1; // by definition
    let [x, y] = getPieceCoords(game.myPlayer, move.to, posToOccupy);
    await animateMovePiece(move.pieceId, x, y, 0.5);

    // animate the blot to the bar. Red bar = 25, White bar = 26
    // let barPoint = game.myPlayer == 'r' ? 26 : 25;
    // let pieceId = board.contents[move.to].occupied[0];
    board.onTheMove = blotPieceId;
    board.completeMovePiece(barPoint);
    board.contents[move.to].occupied = [blotPieceId];

    [x, y] = getPieceCoords(game.myPlayer, barPoint, 1);
    //let blotPiece = document.getElementById(pieceId);
    await animateMovePiece(blotPieceId, x, y, 0.5);
    board.updatePointOccupation(barPoint);

    consumeDiceMove(move);

    updateGameStage();
    return;
  }

  // ORDINARY MOVE
  // let the opponent know the move
  // send the move to the opponent
  console.log('sending rpc for move, piece = ' + move.piece);

  sendRPC('move', {
    pieceId: move.pieceId,
    player: game.currentTurn,
    from: move.from,
    to: move.to,
  });

  let posToOccupy = board.contents[move.to].occupied.length + 1;
  let [x, y] = getPieceCoords(game.myPlayer, move.to, posToOccupy);

  board.completeMovePiece(move.to);

  // console.log(
  //   'After',
  //   '\tOnTheMove: ' + board.onTheMove,
  //   '\tAt ' + move.from + ': ' + board.contents[move.from].occupied,
  //   '\tAt ' + move.to + ': ' + board.contents[move.to].occupied
  // );

  board.updatePointOccupation(move.to);
  consumeDiceMove(move);
  await animateMovePiece(move.pieceId, x, y, 0.5);
}

function applyHighlight(point, state) {
  // translate point coordinates when playing as red
  if (game.myPlayer == 'r') point = 25 - point;

  for (let pt = 1; pt <= 24; pt++) {
    const id = `highlight${pt}`; // Construct the element ID
    const element = document.getElementById(id); // Get the element by ID

    if (point == pt && state == 1) {
      // Check if the element exists
      element.style.backgroundColor = 'orange'; // Set the background color
    } else {
      element.style.backgroundColor = 'white';
    }
  }
}

async function drawBoardWithAnimation(player) {
  console.log('In drawBoardWithAnimation');

  for (let pt = 1; pt <= 26; pt++) {
    const occupiedList = board.contents[pt].occupied;

    for (let pos = 1; pos <= occupiedList.length; pos++) {
      const pieceId = occupiedList[pos - 1];
      // const piece = document.getElementById(id);
      let [x, y] = getPieceCoords(player, pt, pos);
      await animateMovePiece(pieceId, x, y, 5);
    }
  }

  drawDice();
}

function drawBoardNoAnimation(player) {
  console.log('In drawBoardNoAnimation');

  for (let pt = 1; pt <= 26; pt++) {
    const occupiedList = board.contents[pt].occupied;

    for (let pos = 1; pos <= occupiedList.length; pos++) {
      const id = occupiedList[pos - 1];
      const piece = document.getElementById(id);
      console.log(
        'About to call getPieceCoords with player=' +
          player +
          ', pt=' +
          pt +
          ', pos=' +
          pos
      );
      let [x, y] = getPieceCoords(player, pt, pos);
      console.log(
        'After calling getPieceCoords with player=' +
          player +
          ', pt=' +
          pt +
          ', pos=' +
          pos
      );
      // await animateMovePiece(piece, x, y, 5);
      // Set the new position based on progress
      piece.style.left = x - PIECE_RADIUS + 'px';
      piece.style.top = y - PIECE_RADIUS + 'px';
    }

    board.updatePointOccupation(pt);
  }
}

// Function to move the piece back to its original position over a given duration
function animateMovePiece(pieceId, targetX, targetY, speed) {
  return new Promise((resolve) => {
    let piece = document.getElementById(pieceId);
    const initialX = parseFloat(piece.style.left) || 0;
    const initialY = parseFloat(piece.style.top) || 0;
    const deltaX = parseFloat(targetX) - PIECE_RADIUS - initialX;
    const deltaY = parseFloat(targetY) - PIECE_RADIUS - initialY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate duration based on distance and speed
    const duration = distance / speed;

    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Cap at 1 (100%)

      // Set the new position based on progress
      piece.style.left = initialX + deltaX * progress + 'px';
      piece.style.top = initialY + deltaY * progress + 'px';

      if (progress < 1) {
        requestAnimationFrame(animate); // Continue animation
      } else {
        resolve(); // Animation complete, resolve the promise
      }
    }

    requestAnimationFrame(animate); // Start animation
  });
}

// Function to identify point from mouse coordinates
function identifyPoint(x, y) {
  console.log(
    'in identifyPoint, game.myPlayer = ' +
      game.myPlayer +
      ', x = ' +
      x +
      ', y = ' +
      y
  );
  let point;

  if (
    // upper left
    x >= 72 + boardLeftOffset &&
    x < 324 + boardLeftOffset &&
    y >= 16 + boardTopOffset &&
    y <= 226 + boardTopOffset + PIECE_RADIUS - VERTICAL_TOLERANCE
  ) {
    // region = '18-13';

    let n = Math.floor((x - boardLeftOffset - 72) / 42);
    point = 13 + n;
  } else if (
    // upper right
    x >= 354 + boardLeftOffset &&
    x < 604 + boardLeftOffset &&
    y >= 16 + boardTopOffset &&
    y <= 226 + boardTopOffset + PIECE_RADIUS - VERTICAL_TOLERANCE
  ) {
    // region = '24-19';

    let n = Math.floor((x - boardLeftOffset - 354) / 42);
    point = 19 + n;
  } else if (
    // lower left
    x >= 72 + boardLeftOffset &&
    x < 324 + boardLeftOffset &&
    y >=
      272 +
        boardTopOffset -
        PIECE_RADIUS +
        VERTICAL_TOLERANCE +
        VERTICAL_TOLERANCE &&
    y <= 478 + boardTopOffset + VERTICAL_TOLERANCE + VERTICAL_TOLERANCE
  ) {
    // region = '12-7';
    let n = Math.floor((x - boardLeftOffset - 72) / 42);
    point = 12 - n;
  } else if (
    // lower right
    x >= 354 + boardLeftOffset &&
    x < 604 + boardLeftOffset &&
    y >=
      272 +
        boardTopOffset -
        PIECE_RADIUS +
        VERTICAL_TOLERANCE +
        VERTICAL_TOLERANCE &&
    y <= 478 + boardTopOffset + VERTICAL_TOLERANCE + VERTICAL_TOLERANCE
  ) {
    // region = '6-1';
    let n = Math.floor((x - boardLeftOffset - 354) / 42);
    point = 6 - n;
  } else if (
    x >= 314 + boardLeftOffset &&
    x <= 364 + boardLeftOffset &&
    y >= 220 + boardTopOffset &&
    y <= 244 + boardTopOffset
  ) {
    // region = 'Red Bar';
    point = 25;
  } else if (
    x >= 314 + boardLeftOffset &&
    x <= 364 + boardLeftOffset &&
    y >= 245 + boardTopOffset &&
    y <= 268 + boardTopOffset
  ) {
    // region = 'White Bar';
    point = 26;
  } else {
    point = 0;
  }

  if (game.myPlayer == 'r') {
    // reverse board
    if (point >= 1 && point <= 24) {
      point = 25 - point;
      // if (point >= 13) {
      //   point = point - 12;
      // } else {
      //   point = point + 12;
      // }
    }
  }

  console.log('identifyPoint returning point ' + point);
  return point;
}

function getPieceCoords(player, reqPoint, reqPosition) {
  let x = 0,
    y = 0;

  if (reqPoint == 0 || reqPosition == 0) return [x, y];

  // position for requested positions > 5 are set to position 5
  let position = reqPosition > 5 ? 5 : reqPosition;
  let point = reqPoint;

  // convert the coords when playing as red
  if (player == 'r' && reqPoint <= 24) {
    point = 25 - reqPoint;
  }

  // upper right
  if (point <= 24 && point >= 19) {
    x = 567 + PIECE_RADIUS + (point - 24) * 42;
    y = 20 + PIECE_RADIUS + (position - 1) * (PIECE_DIAMETER + 2);
    return [x, y];
  }

  // upper left
  if (point <= 18 && point >= 13) {
    x = 284 + PIECE_RADIUS + (point - 18) * 42;
    y = 20 + PIECE_RADIUS + (position - 1) * (PIECE_DIAMETER + 2);
    return [x, y];
  }

  if (point <= 12 && point >= 7) {
    x = 74 + PIECE_RADIUS + (12 - point) * 42;
    y = 485 - PIECE_RADIUS - (position - 1) * (PIECE_DIAMETER + 2);
    return [x, y];
  }

  if (point <= 6 && point >= 1) {
    x = 105 + PIECE_RADIUS + (12 - point) * 42;
    y = 485 - PIECE_RADIUS - (position - 1) * (PIECE_DIAMETER + 2);
    return [x, y];
  }

  if (point == 25) {
    // red bar
    return [338, 231];
  }

  if (point == 26) {
    // white bar
    return [338, 269];
  }
}

function defineCoordMap() {
  mapper.addCoordinate(1, 1, 585, 467);
  mapper.addCoordinate(1, 2, 585, 429);
  mapper.addCoordinate(1, 3, 585, 391);
  mapper.addCoordinate(1, 4, 585, 353);
  mapper.addCoordinate(1, 5, 585, 315);
  mapper.addCoordinate(2, 1, 543, 467);
  mapper.addCoordinate(2, 2, 543, 429);
  mapper.addCoordinate(2, 3, 543, 391);
  mapper.addCoordinate(2, 4, 543, 353);
  mapper.addCoordinate(2, 5, 543, 315);
  mapper.addCoordinate(3, 1, 501, 467);
  mapper.addCoordinate(3, 2, 501, 429);
  mapper.addCoordinate(3, 3, 501, 391);
  mapper.addCoordinate(3, 4, 501, 353);
  mapper.addCoordinate(3, 5, 501, 315);
  mapper.addCoordinate(4, 1, 459, 467);
  mapper.addCoordinate(4, 2, 459, 429);
  mapper.addCoordinate(4, 3, 459, 391);
  mapper.addCoordinate(4, 4, 459, 353);
  mapper.addCoordinate(4, 5, 459, 315);
  mapper.addCoordinate(5, 1, 417, 467);
  mapper.addCoordinate(5, 2, 417, 429);
  mapper.addCoordinate(5, 3, 417, 391);
  mapper.addCoordinate(5, 4, 417, 353);
  mapper.addCoordinate(5, 5, 417, 315);
  mapper.addCoordinate(6, 1, 375, 467);
  mapper.addCoordinate(6, 2, 375, 429);
  mapper.addCoordinate(6, 3, 375, 391);
  mapper.addCoordinate(6, 4, 375, 353);
  mapper.addCoordinate(6, 5, 375, 315);
  mapper.addCoordinate(7, 1, 302, 467);
  mapper.addCoordinate(7, 2, 302, 429);
  mapper.addCoordinate(7, 3, 302, 391);
  mapper.addCoordinate(7, 4, 302, 353);
  mapper.addCoordinate(7, 5, 302, 315);
  mapper.addCoordinate(8, 1, 260, 467);
  mapper.addCoordinate(8, 2, 260, 429);
  mapper.addCoordinate(8, 3, 260, 391);
  mapper.addCoordinate(8, 4, 260, 353);
  mapper.addCoordinate(8, 5, 260, 315);
  mapper.addCoordinate(9, 1, 218, 467);
  mapper.addCoordinate(9, 2, 218, 429);
  mapper.addCoordinate(9, 3, 218, 391);
  mapper.addCoordinate(9, 4, 218, 353);
  mapper.addCoordinate(9, 5, 218, 315);
  mapper.addCoordinate(10, 1, 176, 467);
  mapper.addCoordinate(10, 2, 176, 429);
  mapper.addCoordinate(10, 3, 176, 391);
  mapper.addCoordinate(10, 4, 176, 353);
  mapper.addCoordinate(10, 5, 176, 315);
  mapper.addCoordinate(11, 1, 134, 467);
  mapper.addCoordinate(11, 2, 134, 429);
  mapper.addCoordinate(11, 3, 134, 391);
  mapper.addCoordinate(11, 4, 134, 353);
  mapper.addCoordinate(11, 5, 134, 315);
  mapper.addCoordinate(12, 1, 92, 467);
  mapper.addCoordinate(12, 2, 92, 429);
  mapper.addCoordinate(12, 3, 92, 391);
  mapper.addCoordinate(12, 4, 92, 353);
  mapper.addCoordinate(12, 5, 92, 315);
  mapper.addCoordinate(13, 1, 92, 38);
  mapper.addCoordinate(13, 2, 92, 76);
  mapper.addCoordinate(13, 3, 92, 114);
  mapper.addCoordinate(13, 4, 92, 152);
  mapper.addCoordinate(13, 5, 92, 190);
  mapper.addCoordinate(14, 1, 134, 38);
  mapper.addCoordinate(14, 2, 134, 76);
  mapper.addCoordinate(14, 3, 134, 114);
  mapper.addCoordinate(14, 4, 134, 152);
  mapper.addCoordinate(14, 5, 134, 190);
  mapper.addCoordinate(15, 1, 176, 38);
  mapper.addCoordinate(15, 2, 176, 76);
  mapper.addCoordinate(15, 3, 176, 114);
  mapper.addCoordinate(15, 4, 176, 152);
  mapper.addCoordinate(15, 5, 176, 190);
  mapper.addCoordinate(16, 1, 218, 38);
  mapper.addCoordinate(16, 2, 218, 76);
  mapper.addCoordinate(16, 3, 218, 114);
  mapper.addCoordinate(16, 4, 218, 152);
  mapper.addCoordinate(16, 5, 218, 190);
  mapper.addCoordinate(17, 1, 260, 38);
  mapper.addCoordinate(17, 2, 260, 76);
  mapper.addCoordinate(17, 3, 260, 114);
  mapper.addCoordinate(17, 4, 260, 152);
  mapper.addCoordinate(17, 5, 260, 190);
  mapper.addCoordinate(18, 1, 302, 38);
  mapper.addCoordinate(18, 2, 302, 76);
  mapper.addCoordinate(18, 3, 302, 114);
  mapper.addCoordinate(18, 4, 302, 152);
  mapper.addCoordinate(18, 5, 302, 190);
  mapper.addCoordinate(19, 1, 375, 38);
  mapper.addCoordinate(19, 2, 375, 76);
  mapper.addCoordinate(19, 3, 375, 114);
  mapper.addCoordinate(19, 4, 375, 152);
  mapper.addCoordinate(19, 5, 375, 190);
  mapper.addCoordinate(20, 1, 417, 38);
  mapper.addCoordinate(20, 2, 417, 76);
  mapper.addCoordinate(20, 3, 417, 114);
  mapper.addCoordinate(20, 4, 417, 152);
  mapper.addCoordinate(20, 5, 417, 190);
  mapper.addCoordinate(21, 1, 459, 38);
  mapper.addCoordinate(21, 2, 459, 76);
  mapper.addCoordinate(21, 3, 459, 114);
  mapper.addCoordinate(21, 4, 459, 152);
  mapper.addCoordinate(21, 5, 459, 190);
  mapper.addCoordinate(22, 1, 501, 38);
  mapper.addCoordinate(22, 2, 501, 76);
  mapper.addCoordinate(22, 3, 501, 114);
  mapper.addCoordinate(22, 4, 501, 152);
  mapper.addCoordinate(22, 5, 501, 190);
  mapper.addCoordinate(23, 1, 543, 38);
  mapper.addCoordinate(23, 2, 543, 76);
  mapper.addCoordinate(23, 3, 543, 114);
  mapper.addCoordinate(23, 4, 543, 152);
  mapper.addCoordinate(23, 5, 543, 190);
  mapper.addCoordinate(24, 1, 585, 38);
  mapper.addCoordinate(24, 2, 585, 76);
  mapper.addCoordinate(24, 3, 585, 114);
  mapper.addCoordinate(24, 4, 585, 152);
  mapper.addCoordinate(24, 5, 585, 190);
  mapper.addCoordinate(25, 1, 338, 231);
  mapper.addCoordinate(26, 1, 338, 269);
}

// Game Play

function isPieceMovable(piece, pt, pos) {
  console.log('isPieceMovable called for pt = ', pt, ' pos = ', pos);

  // if piece is not being moved from a valid position
  if (piece == 0 && pos == 0) {
    console.log('Not moving from a valid position');
    return false;
  }

  // if there are no dice moves left
  if (board.diceThrows.every((element) => element === 0)) {
    console.log('isPieceMovable: no dice moves remaining');
    return false;
  }

  // check is piece is my colour
  if (game.myPlayer != piece.dataset.type) {
    console.log('isPieceMovable: wrong colour');
    return false;
  }

  // don't move unless topmost piece
  if (pos < board.contents[pt].occupied.length && pos < 5) {
    console.log('isPieceMovable: not topmost piece');
    return false;
  }

  console.log('isPieceMovable: true');
  return true;
}
