/////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Handles webpage logic and connects to the game logic in app.js

'use strict';
console.log(`script.js running`);

/////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS
import {
  welcomeNameForm,
  checkForLocalStorageObject,
} from '../scripts/welcome.js';
// import { gamePlayers } from './modals.js';
// // import { clearLocalStorage, testForLocalStorageData } from './localStorage.js';
import * as storage from './localStorage.js';

/////////////////////////////////////////////////////////////////////////////////////////
// DOM ELEMENT SELECTION

// Debug button elements
const testButton1 = document.querySelector('.test_button1');
const testButton2 = document.querySelector('.test_button2');

// Game board elements
const imbedGame = document.getElementById('content_container');
const boardMessage = document.querySelector('.board_message');

// Welcome section elements
const welcomeSection = document.querySelector('.welcome_section');

// Welcome return section elements
const returnSection = document.querySelector('.return_section');

// // Chatbox section elements
// const chatboxSection = document.querySelector('.chatbox_section');
// const chatBoxDisplay = document.querySelector('.chatbox_display');
// const chatboxInput = document.getElementById('chat_input');

// Ad section elements
export const adNotification = document.querySelector('.ad_notification');
const adSection = document.querySelector('.adbox');
const currentAdLink = document.querySelector('.ad_link');
const currentAdPicture = document.querySelector('.ad_picture');

/////////////////////////////////////////////////////////////////////////////////////////
// SOUNDS

// Page sounds
export const buttonClickSound = document.getElementById('button_click_sound');

/////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES

// Ad section variables
const ad1 = {
  source: '../images/cash4gold.jpg',
  altText: 'Cash 4 Gold Advertisement',
  href: 'https://www.cash4goldonline.co.uk/',
  title: 'Cash 4 Gold Online',
};

const ad2 = {
  source: '../images/kier.avif',
  altText: 'Kier Starmer Advertismeent',
  href: 'https://en.wikipedia.org/wiki/Keir_Starmer',
  title: 'Kier Starmer Action Figures',
};

const ad3 = {
  source: '../images/chocowhopper.webp',
  altText: 'Burger King Advertisment',
  href: 'https://youtube.com/watch?v=2JaCzLZTYAE',
  title: 'The NEW Chocolate Whopper',
};

const ad4 = {
  source: '../images/vizswan.jpg',
  altText: 'Viz Swan Advertisment',
  href: 'https://www.amazon.co.uk/Brainbox-Candy-Official-Advert-Birthday/dp/B0BMGXMB61',
  title: 'Retrain as a Swan Today',
};

const ad5 = {
  source: '../images/hokusaiNuke.jpeg',
  altText: 'Japanese Nuclear Waste Advertisment',
  href: 'https://www.globaltimes.cn/page/202104/1221726.shtml',
  title: 'Japanese Nuclear Waste Near You!',
};

const ad6 = {
  source: '../images/gizmo.jpg',
  altText: 'Baby Gizmo Advertismement',
  href: 'https://fastshow.fandom.com/wiki/Chanel_9_Neus',
  title: 'Baby Gizmo Action Pumpo',
};

const adList = [ad1, ad2, ad3, ad4, ad5, ad6];

let currentAdNumber = 0;

//////////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS

// Window listeners
window.addEventListener('load', () => {
  showMain();
  storage.testForLocalStorageData();
  imbedGame.classList.add('show');
  imbedGame.classList.remove('no_pointer_events');
  setInterval(imgAdCycler, 15000);
});

// Debug button eventListeners
testButton1.addEventListener('click', () => {
  console.log(`Contents of localStorageObject reset to default`);
  storage.clearLocalStorage();
  window.location.reload();
});

testButton2.addEventListener('click', () => {
  console.log(`Dad button activated`);
});

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// Main display functions
// Shows the pages main elements on load or a site reset event
function showMain() {
  const doesUserAlreadyExist = checkForLocalStorageObject();
  console.log(doesUserAlreadyExist);
  setTimeout(() => {
    if (doesUserAlreadyExist) {
      returnSection.classList.add('reveal');
    } else {
      welcomeSection.classList.add('reveal');
    }
    adSection.classList.add('reveal');
    adNotification.classList.add('show');
    boardMessage.textContent = `Have a go at moving the pieces!`;
  }, 3000);
  setTimeout(() => {
    if (doesUserAlreadyExist) {
      returnSection.classList.add('focus_element_thick');
    } else {
      welcomeSection.classList.add('focus_element_thick');
    }
  }, 500);
  setTimeout(() => {
    welcomeNameForm.classList.add('focus_element');
  }, 500);
}

// Sound functions
// Plays the set click sound for the webpage
export function playClickSound() {
  buttonClickSound.play();
}

// Ad section functions
// Cycles through the available ads using random numbers, changes properties of image ad elements on the webpage
function imgAdCycler() {
  setTimeout(() => {
    const oldAdNumber = currentAdNumber;
    while (oldAdNumber === currentAdNumber) {
      currentAdNumber = Math.round(Math.random() * (adList.length - 1));
    }
    currentAdPicture.src = adList[currentAdNumber].source;
    currentAdPicture.title = adList[currentAdNumber].title;
    currentAdPicture.alt = adList[currentAdNumber].altText;
    currentAdLink.href = adList[currentAdNumber].href;
  }, 0);
}

export function toggleClass(pageElement, property) {
  pageElement.classList.contains(property)
    ? pageElement.classList.remove(property)
    : pageElement.classList.add(property);
}

// ///////////////////////////////
// // CHAT BOX

// // Captures a users chat message from the input box and adds it to the chat display
// // Called by an eventHandler when pressing enter in the chat input box
// function addChatMessage() {
//   const message = chatboxInput.value;
//   chatboxInput.value = '';
//   const messageHTML = createChatMessage(message);
//   postChatMessage(messageHTML);
//   displayLatestMessage();
// }

// // Assembles and returns  an HTML literal string to add to the chat display element
// // Called by addChatMessage()
// function createChatMessage(message) {
//   const timeStamp = getTimeStamp();
//   const messageClass = userMessageStyleToggle
//     ? 'chatbox_entry_a'
//     : 'chatbox_entry_b';
//   const displayName = getUserDisplayName();
//   const messageHTML = `<p class='${messageClass}'><strong class='player_name'>${displayName}:</strong> ${message} - ${timeStamp}</p>`;
//   userMessageStyleToggle = userMessageStyleToggle ? false : true;
//   return messageHTML;
// }

// // Generates a time stamp in minutes and seconds when a message is added to the chat display
// // Called by createChatMessage()
// function getTimeStamp() {
//   const now = new Date();
//   const hours = String(now.getHours()).padStart(2, '0');
//   const minutes = String(now.getMinutes()).padStart(2, '0');
//   const seconds = String(now.getSeconds()).padStart(2, '0');
//   return `${hours}:${minutes}:${seconds}`;
// }

// // Adds a chat message HTML literal string to the chat display elements innerHTML
// // Called by addChatMessage()
// function postChatMessage(messageHTML, position = 'beforeend') {
//   chatBoxDisplay.insertAdjacentHTML(position, messageHTML);
//   chatPop.play();
// }

// // Scrolls the chat box display down to the lcoation of the latest message - could be annoying when trying to look back through chats later? - UX?
// // Called by addChatMessage()
// function displayLatestMessage() {
//   chatBoxDisplay.scrollTop = chatBoxDisplay.scrollHeight;
// }

// // Captures the users display name or 'Guest' if one is not set and returns it
// // Called by startGameMessages(), createChatMessage()
// function getUserDisplayName() {
//   const storedObject = storage.loadLocalStorage();
//   const displayName = storedObject.displayName;
//   return displayName;
// }

// function getOpponentName() {
//   const opponentName = gamePlayers.opponent.displayName;
//   return opponentName;
// }

// // Generates and posts a chatbox message from a pretend opponent
// // Called by an eventHandler on the 'Ask Jack - TEST' button
// function pretendOpponentMessage() {
//   const messageHTML = createOpponentMessage(
//     'Jack',
//     'That would be an ecumenical matter...'
//   );
//   postChatMessage(messageHTML);
//   displayLatestMessage();
// }

// function forfeitMessage() {
//   let chatHTML, chatHTML2;
//   const displayName = getUserDisplayName();
//   const opponentName = getOpponentName();
//   chatHTML = `<p class='chatbox_entry_c'><strong>${displayName}</strong> has decided to forfeit the game.</p>`;
//   chatHTML2 = `<p class='chatbox_entry_d'><strong>${opponentName}</strong> wins the game!</p>`;
//   addGameNotification(chatHTML);
//   setTimeout(() => {
//     addGameNotification(chatHTML2);
//   }, 500);
// }

// // Creates a message form an opponent to them be posted in the chatbox, message styling is unique to the opponent to differentiate between player 1 and player 2
// // Called by pretendOpponentMessage()
// function createOpponentMessage(opponentName, message) {
//   const timeStamp = getTimeStamp();
//   const messageClass = opponentMessageStyleToggle
//     ? 'chatbox_entry_e'
//     : 'chatbox_entry_f';
//   const messageHTML = `<p class='${messageClass}'><strong class='opponent_name'>${opponentName}:</strong> ${message} - ${timeStamp}</p>`;
//   opponentMessageStyleToggle = opponentMessageStyleToggle ? false : true;
//   return messageHTML;
// }

// // Displays information messages in the chatbox when starting a new game
// // Called by displayFunBoard(), displayProBoard()
// function startGameMessages(userDisplayName, opponentName) {
//   let chatHTML, chatHTML2;
//   chatHTML = `<p class='chatbox_entry_c'>Starting a game.</p>`;

//   const displayName = getUserDisplayName();
//   chatHTML2 = `<p class='chatbox_entry_d'><strong>${userDisplayName}</strong> is playing against <strong>${opponentName}!</strong></p>`;
//   addGameNotification(chatHTML);
//   setTimeout(() => {
//     addGameNotification(chatHTML2);
//   }, 500);
// }

// // Allows a game start notification to be added to the chatbox
// // Called by startGameMessages()
// function addGameNotification(HTML) {
//   chatBoxDisplay.insertAdjacentHTML('beforeend', HTML);
//   chatPop.play();
// }

// MESSAGE SENDING AND RECEIVING FUNCTIONS
function sendMessageToWebpage(message) {
  window.parent.postMessage(JSON.stringify(message), '*'); // '*' means any origin can receive. For production, specify the exact origin of the iframe.
}

// TODO - FIX THIS FUNCTION TO BE ABLE TO ACCEPT MESSAGES ETC.
function handleMessageFromParent(message) {
  console.log('Iframe received:', message);
  let roll, messageContent, firstTurnRollResults;
  switch (message.method) {
    case 'startGame':
      startGame();
      break;
    case 'changeTurn':
      changeGameState(message.params);
      break;
    case 'rollOnce':
      roll = rollOnce();
      console.log(roll);
      sendMessageToWebpage({ method: '1DieResult', params: roll });
      changeGameState('playerR firstTurn');
      break;
    case 'rollTwice':
      roll = rollTwice();
      console.log(roll);
      sendMessageToWebpage({ method: '2DiceResult', params: roll });
      break;
    case 'chooseFirstPlayer':
      firstTurnRollResults = message.params;
      console.log(firstTurnRollResults);
      console.log(firstTurnRollResults[0]);
      console.log(firstTurnRollResults[1]);
      if (firstTurnRollResults[0] === firstTurnRollResults[1]) {
        sendMessageToWebpage({ method: 'rollResultDraw', params: 'none' });
      }
      if (firstTurnRollResults[0] > firstTurnRollResults[1]) {
        console.log(`W goes first`);
        changeGameState('playerW roll');
        sendMessageToWebpage({
          method: 'displayNotification',
          params: 'W goes first',
        });
        sendMessageToWebpage({ method: 'gameState', params: 'playerW roll' });
      } else if (firstTurnRollResults[0] < firstTurnRollResults[1]) {
        console.log(`R goes first`);
        changeGameState('playerR roll');
        sendMessageToWebpage({
          method: 'displayNotification',
          params: 'R goes first',
        });
        sendMessageToWebpage({ method: 'gameState', params: 'playerR roll' });
      }
      break;
    case 'resetBoard':
      board.resetBoard();
      pieces.forEach((current) => {
        board.resetPiecesPosition(current);
      });
      console.log(`Resetting board...`);
      break;
    case 'chatMessage':
      messageContent = message.params;
      console.log(messageContent);
      break;
    case 'gameMessage':
      messageContent = message.params;
      console.log(messageContent);
      break;
    case 'winMessage':
      messageContent = message.params;
      console.log(message);
      break;
    case 'forfeitMessage':
      messageContent = message.params;
      console.log(message);
      break;
  }
}

function changeGameState(state) {
  switch (state) {
    case 'setup':
      gameState2 = 'setup';
      break;
    case 'playerW firstTurn':
      gameState2 = 'playerW firstTurn';
      break;
    case 'playerR firstTurn':
      gameState2 = 'playerR firstTurn';
      break;
    case 'chooseFirstPlayer':
      break;
    // const diceRolls =
    case 'playerW roll':
      gameState2 = 'playerW roll';
      break;
    case 'playerW move':
      gameState2 = 'playerW move';
      break;
    case 'playerR roll':
      gameState2 = 'playerR roll';
      break;
    case 'playerR move':
      gameState2 = 'playerR move';
      break;
    case 'end win':
      gameState2 = 'end win';
      break;
    case 'end forfeit':
      gameState2 = 'end forfeit';
      break;
  }
  const gameStateMessage = { method: 'gameState', params: gameState2 };
  sendMessageToWebpage(gameStateMessage);
}

// CODE END
