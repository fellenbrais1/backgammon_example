/////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Handles message logic for the chat section

'use strict';
console.log(`messages.js running`);

/////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS

import { gamePlayers } from './modals.js';
import { playChatNotificationSound } from './sounds.js';
import { loadLocalStorage } from './localStorage.js';
import { sendRPC } from './chat.js';

/////////////////////////////////////////////////////////////////////////////////////////
// DOM ELEMENT SELECTION

// Chat section elements
const chatDisplay = document.querySelector('.chat_display');
const chatInput = document.getElementById('chat_input');

/////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES

// Variables used to alternate message format in the chatbox
let userMessageStyleToggle = false;
let opponentMessageStyleToggle = false;

//////////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS

// Event listeners
window.addEventListener('message', (event) => {
  const receivedMessage = event.data;
  handleMessageFromParent(receivedMessage);
});

chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addChatMessage();
  }
});

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// Captures a users chat message from the input box and adds it to the chat display
// Called by an eventHandler when pressing enter in the chat input box
function addChatMessage() {
  const message = chatInput.value;
  const sanitisedMessage = sanitizeMessage(message);
  const messageHTML = createChatMessage(sanitisedMessage);
  chatInput.value = '';
  sendRPC('chat', sanitisedMessage);
  postChatMessage(messageHTML);
  displayLatestMessage();
}

function sanitizeMessage(message) {
  return message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Assembles and returns  an HTML literal string to add to the chat display element
// Called by addChatMessage()
function createChatMessage(message) {
  const messageClass = userMessageStyleToggle ? 'chat_entry_a' : 'chat_entry_b';
  const displayName = getUserDisplayName();
  const messageHTML = `<p class='${messageClass}'><strong class='player_name'>${displayName}:</strong> ${message}</p>`;
  userMessageStyleToggle = userMessageStyleToggle ? false : true;
  return messageHTML;
}

// Adds a chat message HTML literal string to the chat display elements innerHTML
// Called by addChatMessage()
function postChatMessage(messageHTML, position = 'beforeend') {
  chatDisplay.insertAdjacentHTML(position, messageHTML);
  playChatNotificationSound();
}

// Scrolls the chat box display down to the lcoation of the latest message
// Called by addChatMessage()
function displayLatestMessage() {
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Captures the users display name or 'Guest' if one is not set and returns it
// Called by startGameMessages(), createChatMessage()
function getUserDisplayName() {
  const storedObject = loadLocalStorage();
  const displayName = storedObject.displayName;
  return displayName;
}

export function getOpponentName() {
  const opponentName = gamePlayers.opponent.displayName;
  return opponentName;
}

// Generates and posts a chatbox message from a pretend opponent
export function opponentMessage(opponentName, message) {
  console.log(message);
  const messageHTML = createOpponentMessage(`${opponentName}`, `${message}`);
  postChatMessage(messageHTML);
  displayLatestMessage();
}

export function forfeitMessage() {
  let chatHTML, chatHTML2;
  const displayName = getUserDisplayName();
  const opponentName = getOpponentName();
  chatHTML = `<p class='chat_entry_c'><strong>${displayName}</strong> has decided to forfeit the game.</p>`;
  chatHTML2 = `<p class='chat_entry_d'><strong>${opponentName}</strong> wins the game!</p>`;
  addGameNotification(chatHTML);
  setTimeout(() => {
    addGameNotification(chatHTML2);
  }, 500);
}

// Creates a message form an opponent to them be posted in the chatbox, message styling is unique to the opponent to differentiate between player 1 and player 2
// Called by pretendOpponentMessage()
function createOpponentMessage(opponentName, message) {
  console.log(message);
  const messageClass = opponentMessageStyleToggle
    ? 'chat_entry_e'
    : 'chat_entry_f';
  const messageHTML = `<p class='${messageClass}'><strong class='opponent_name'>${opponentName}:</strong> ${message}</p>`;
  opponentMessageStyleToggle = opponentMessageStyleToggle ? false : true;
  return messageHTML;
}

// Displays information messages in the chatbox when starting a new game
// Called by displayFunBoard(), displayProBoard()
export function startGameMessages(opponentName) {
  let chatHTML, chatHTML2;
  chatHTML = `<p class='chat_entry_c'>Starting a game. Say hello!</p>`;

  const displayName = getUserDisplayName();
  chatHTML2 = `<p class='chat_entry_d'><strong>${displayName}</strong> is playing against <strong>${opponentName}!</strong></p>`;
  addGameNotification(chatHTML);
  setTimeout(() => {
    addGameNotification(chatHTML2);
  }, 500);
}

// Allows a game start notification to be added to the chatbox
// Called by startGameMessages()
function addGameNotification(HTML) {
  chatDisplay.insertAdjacentHTML('beforeend', HTML);
  playChatNotificationSound();
}

// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
