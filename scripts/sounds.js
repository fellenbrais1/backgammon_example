/////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Sounds to play on the webpage and in the game

'use strict';
console.log(`sounds.js running`);

/////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES

// Webpage sound variables
const openingJingleSound = document.getElementById('opening_jingle');
const buttonClickSound = document.getElementById('button_click_sound');

// Game sound variables
const piecePickUpSound = document.getElementById('piece_pickup');
const piecePutDownSound = document.getElementById('piece_putdown');
const piecesDealSound = document.getElementById('pieces_deal');
const diceRollSound = document.getElementById('dice_roll_sound');
const chatNotificationSound = document.getElementById('chat_sound');

// Dice number sound variables
const number1Sound = document.getElementById('number1');
const number2Sound = document.getElementById('number2');
const number3Sound = document.getElementById('number3');
const number4Sound = document.getElementById('number4');
const number5Sound = document.getElementById('number5');
const number6Sound = document.getElementById('number6');
const number7Sound = document.getElementById('number7');
const number8Sound = document.getElementById('number8');
const number9Sound = document.getElementById('number9');
const number10Sound = document.getElementById('number10');
const number11Sound = document.getElementById('number11');
const number12Sound = document.getElementById('number12');

const diceNumberSounds = [
  number1Sound,
  number2Sound,
  number3Sound,
  number4Sound,
  number5Sound,
  number6Sound,
  number7Sound,
  number8Sound,
  number9Sound,
  number10Sound,
  number11Sound,
  number12Sound,
];

// Joke sound variables
const programsMatrixSound = document.getElementById('programs_matrix');
const blackSocksTedSound = document.getElementById('black_socks_ted');

/////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// Webpage sound functions

// Plays the 'opening jingle' sound
export function playOpeningJingleSound() {
  openingJingleSound.play();
}

// Plays the 'button click' sound
export function playClickSound() {
  buttonClickSound.play();
}

// Game sound functions

// Plays the 'piece pick up' sound
export function playPiecePickupSound() {
  piecePickUpSound.play();
}

// Plays the 'piece put down' sound
export function playPiecePutDownSound() {
  piecePutDownSound.play();
}

// Plays the 'pieces deal' sound
export function playPiecesDealSound() {
  piecesDealSound.play();
}

// Plays the 'dice roll' sound
export function playDiceRollSound() {
  diceRollSound.play();
}

// Plays the 'chat notification' sound
export function playChatNotificationSound() {
  chatNotificationSound.play();
}

// Dice sound function
export function playDiceNumberSound(rollResult) {
  if (rollResult > 12) {
    console.log(`Double must have been rolled, no sound will be played`);
    return;
  }
  console.log(
    `Playing number sound: ${rollResult}, Index number: ${rollResult - 1}`
  );
  diceNumberSounds[rollResult - 1].play();
  return;
}

// Joke sound functions
export function playProgramsMatrixSound() {
  programsMatrixSound.play();
}

export function playBlackSocksTedSound() {
  blackSocksTedSound.play();
}

// CODE END
/////////////////////////////////////////////////////////////////////////////////////////
