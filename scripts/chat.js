/////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Inter-player communication logic

'use strict';
console.log(`chat.js running`);

/////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS

import { firebaseApp, analytics, database } from './firebaseConfig.js';
import { challengerName, populatePlayers } from './welcome.js';
import {
  forfeitMessage,
  getOpponentName,
  opponentMessage,
} from './messages.js';
import { changeModalContent, getActiveChallengeTimeStamp } from './modals.js';
import { playbackDiceRoll, playbackMove } from './app.js';

/////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES

// Firebase related variables
console.log('Using Firebase in chat.js:', firebaseApp);
const db = database;
console.log(analytics);
console.log(db);

export let peer;
let activeOpponent = '';

// Variables for the looping delay to work in sendRPC()
let connOpen = false;
let attemptNo = 1;

let shutdownFlag = false;
let firstPlayerRefreshFlag = true;
let blockProcessFlag = false;

/////////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS

document.addEventListener('DOMContentLoaded', () => {
  peer = new Peer({
    host: '0.peerjs.com',
    port: 443,
    secure: true,
    key: 'peerjs',
  });

  peer.on('open', (id) => {
    console.log('My unique peer ID is: ' + id);
  });

  // On the remote peer's side
  peer.on('connection', (connection) => {
    console.log('Incoming connection from:', connection.peer);
    conn = connection;

    conn.on('open', () => {
      console.log('Connection opened with:', connection.peer);
      connOpen = true;
    });

    conn.on('data', (data) => {
      console.log('Received data:', data);

      const parsedData = JSON.parse(data);

      console.log(
        'Data received. method=' +
          parsedData.method +
          ', params=' +
          JSON.stringify(parsedData.params)
      );
      dispatchMessage(parsedData);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  });

  peer.on('reconnect', () => {
    console.log('Reconnected to PeerJS server');
    peer.on('open', (id) => {
      console.log('New peer ID after reconnection:', id);
    });
  });

  peer.on('disconnected', () => {
    console.log('Peer disconnected');
  });
});

let conn;

export async function checkForName(playerName, allowedName = '') {
  const playersRef = database.ref('players');

  try {
    // Query Firebase to check if displayName already exists
    const querySnapshot = await playersRef
      .orderByChild('displayName')
      .equalTo(playerName)
      .once('value');
    const nameExists = querySnapshot.exists();

    if (nameExists) {
      if (playerName === allowedName) {
        return 1;
      } else {
        console.error('Error: display name already exists');
        return 0;
      }
    } else {
      return 1;
    }
  } catch (error) {
    console.error('Error handling player record: ', error);
    return null;
  }
}

export async function changeInGameStatus(key, bool) {
  const playersRef = database.ref('players');

  const existingPlayerRef = playersRef.child(key);
  const existingSnapshot = await existingPlayerRef.once('value');
  if (!existingSnapshot.exists()) {
    console.error('Error: Player record does not exist');
    return null;
  }

  const newInGame = bool;

  await existingPlayerRef.update({
    inGame: newInGame,
  });
  console.log(`Player status set to inGame = ${existingPlayerRef.inGame}`);
  console.log(JSON.stringify(existingPlayerRef));
  return;
}

export async function registerForChat(key, player, allowedName = '') {
  const playersRef = database.ref('players');

  try {
    // Query Firebase to check if displayName already exists
    const querySnapshot = await playersRef
      .orderByChild('displayName')
      .equalTo(player.displayName)
      .once('value');
    const nameExists = querySnapshot.exists();

    if (key === null) {
      console.log(`HERE!!!!! : ${allowedName}`);
      if (player.displayName === allowedName) {
        console.log(
          `Skipping process as name is the same one as currently saved to player record`
        );
      } else {
        if (nameExists) {
          console.error('Error: display name already exists');
          changeModalContent('nameExists', player.displayName);
          return null;
        }
      }

      // Create a new player record
      const newPlayerRef = playersRef.push();
      await newPlayerRef.set({
        displayName: player.displayName,
        peerID: player.peerID,
        skillLevel: player.skillLevel,
        languages: player.languages,
        lastOnline: Date.now(),
        inGame: false,
      });
      console.log('Player registered successfully!');
      return newPlayerRef.key;
    } else {
      // Check if the record exists
      const existingPlayerRef = playersRef.child(key);
      const existingSnapshot = await existingPlayerRef.once('value');
      if (!existingSnapshot.exists()) {
        console.error('Error: Player record does not exist');
        return null;
      }

      const existingPlayer = existingSnapshot.val();

      // If updating, ensure the new displayName does not conflict
      if (player.displayName !== existingPlayer.displayName && nameExists) {
        console.error('Error: New display name already exists');
        return null;
      }

      // Update the existing player record
      await existingPlayerRef.update({
        displayName: player.displayName,
        peerID: player.peerID,
        skillLevel: player.skillLevel,
        languages: player.languages,
        lastOnline: Date.now(),
        inGame: false,
      });
      console.log('Player updated successfully!');
      return key;
    }
  } catch (error) {
    console.error('Error handling player record: ', error);
    return null;
  }
}

export async function fetchPlayers(languageFilter = 'none') {
  const playersRef = database.ref('players');

  try {
    const snapshot = await playersRef.once('value');
    const playersObject = snapshot.val();

    if (!playersObject) {
      console.log('No players found.');
      return [];
    }

    // Convert object to array and include keys
    const playersArray = Object.keys(playersObject).map((key) => ({
      id: key, // Firebase-generated key
      ...playersObject[key], // Player data
    }));

    console.log('Players with keys:', playersArray);

    setTimeout(() => {
      if (languageFilter === 'none') {
        populatePlayers(playersArray);
      } else {
        populatePlayers(playersArray, languageFilter);
      }
    }, 1000);

    return playersArray;
  } catch (error) {
    console.error('Error retrieving players:', error);
    return [];
  }
}

async function fetchPlayerByKey(playerKey) {
  try {
    const playerRef = database.ref('players').child(playerKey);
    const snapshot = await playerRef.get();

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No player found with that key');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving player:', error);
    return null;
  }
}

export async function fetchRecentPlayers(languageFilter = 'none') {
  const playersRef = database.ref('players');
  const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 HOUR

  try {
    const snapshot = await playersRef
      .orderByChild('lastOnline')
      .startAt(oneHourAgo)
      .once('value');
    const playersObject = snapshot.val();

    const numberOfPlayers = Object.keys(playersObject).length;
    console.log(numberOfPlayers);
    if (numberOfPlayers < 2) {
      console.log('No players online in the last hour.');
      if (firstPlayerRefreshFlag === true);
      changeModalContent('noPlayersOnline');
      firstPlayerRefreshFlag = false;
      return [];
    }

    // Convert object to an array with keys
    const playersArray = Object.keys(playersObject).map((key) => ({
      id: key,
      ...playersObject[key],
    }));

    setTimeout(() => {
      if (languageFilter === 'none') {
        populatePlayers(playersArray);
      } else {
        populatePlayers(playersArray, languageFilter);
      }
    }, 1000);

    return playersArray;
  } catch (error) {
    console.error('Error retrieving recent players:', error);
    return [];
  }
}

export async function connectToPlayer(opponent) {
  console.log(JSON.stringify(opponent));
  console.log(
    'Attempting to connect to ' +
      opponent.displayName +
      ' at ' +
      opponent.userKey
  );

  const playerRef = database.ref(`players/${opponent.userKey}`);
  console.log(opponent.userKey, typeof opponent.userKey);
  console.log(playerRef, typeof playerRef);

  try {
    const snapshot = await playerRef.get();

    if (!snapshot.exists()) {
      console.log('No player found with that username.');
      return null;
    }

    const remotePeerId = snapshot.val().peerID;
    console.log(remotePeerId);
    conn = await peer.connect(remotePeerId);

    console.log(conn);

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });

    conn.on('open', () => {
      console.log('Connected to peer:', remotePeerId);
      connOpen = true;
    });

    conn.on('data', (data) => {
      console.log('Received data:', data);

      const parsedData = JSON.parse(data);

      console.log(
        'Data received. method=' +
          parsedData.method +
          ', params=' +
          JSON.stringify(parsedData.params)
      );
      dispatchMessage(parsedData);
    });

    return conn;
  } catch (err) {
    console.error('Error fetching player data:', err);
    return null;
  }
}

export function shutDownRPC() {
  shutdownFlag = true;
  console.log(`shutdownFlag = ${shutdownFlag}`);
}

// Added a looping delay that will retry sending the message until the connOpen variable is true, this is controlled by the conn.on(open) event
export async function sendRPC(method, params) {
  shutdownFlag = false;
  // TODO - TESTING IN PROGRESS
  // setTimeout before sending messages with conn.send currently set at 100ms, might need to raise if we encounter issues

  if (connOpen === true) {
    attemptNo = 1;
    const rpcMessage = {
      method: method,
      params: params,
    };
    console.log(JSON.stringify(rpcMessage));
    setTimeout(() => {
      conn.send(JSON.stringify(rpcMessage));
    }, 100);
    return;
  } else {
    if (attemptNo < 11) {
      console.log(`shutdownFlag = ${shutdownFlag}`);
      if (shutdownFlag === true) {
        console.log(`Shutting down RPC message process.`);
        closeConn();
        shutdownFlag = false;
        return;
      }
      setTimeout(() => {
        console.log(
          `Waiting for open connection (5 seconds) Attempt ${attemptNo}`
        );
        attemptNo++;
        sendRPC(method, params);
      }, 1000);
    } else {
      attemptNo = 1;
      console.log(`Error: Connection cannot be made with the other player.`);
      alert(
        `Error: Connection cannot be made with the other player. Please refresh your session and try again.`
      );
      shutdownFlag = false;
      return;
    }
  }
}

function dispatchMessage(parsedData) {
  console.log(JSON.stringify(parsedData));
  console.log('dispatchMessage() Method:', parsedData.method);
  console.log('dispatchMessage() Params:', parsedData.params);

  if (blockProcessFlag) {
    return;
  }

  switch (parsedData.method) {
    case 'chat':
      console.log('Send ' + parsedData.params + ' data to eventChatMessage()');
      eventChatMessage(parsedData.params);
      break;
    case 'move':
      console.log(
        'Send ' + JSON.stringify(parsedData.params) + ' data to playbackMove()'
      );
      playbackMove(parsedData.params);
      break;
    case 'diceRoll':
      console.log(
        'Send ' +
          JSON.stringify(parsedData.params) +
          ' data to playbackDiceRoll()'
      );
      playbackDiceRoll(parsedData.params);
      break;
    case 'challengeSent':
      console.log(
        'Send ' + parsedData.params + ' data to eventChallengeSent()'
      );
      eventChallengeSent(parsedData.params);
      break;
    case 'challengeAccepted':
      console.log('Calling eventChallengeAccepted()');
      eventChallengeAccepted();
      break;
    case 'challengeRejected':
      console.log('Calling eventChallengeRejected()');
      eventChallengeRejected();
      break;
    case 'challengeCancel':
      console.log(`Calling eventChallengeCancel()`);
      eventChallengeCancel(parsedData.params);
      break;
    case 'forfeitGame':
      console.log('Send ' + parsedData.params + ' data to eventForfeitGame()');
      eventForfeitGame(parsedData.params);
      break;
    case 'gameOver':
      console.log('Send ' + parsedData.params + ' data to eventGameOver()');
      eventGameOver(parsedData.params);
      break;
  }
}

async function eventChallengeSent(message) {
  const activeChallengeTimeStamp = getActiveChallengeTimeStamp();
  const timeStamp = Date.now();

  console.log(`ActiveChallengeTimeStamp: ${activeChallengeTimeStamp}`);
  console.log(`Received TimeStamp: ${timeStamp}`);

  // TODO - Should skip this handling if a new challenge message is newer than an old one being processed
  if (activeChallengeTimeStamp !== 0) {
    if (timeStamp > activeChallengeTimeStamp) {
      closeConn();
      return;
    }
  }

  activeOpponent = await fetchPlayerByKey(message);
  console.log(activeOpponent);
  console.log(
    `Challenge received from ${activeOpponent.displayName} at ${timeStamp}`
  );
  changeModalContent('challengeReceived', [
    activeOpponent.displayName,
    timeStamp,
  ]);
  return;
}

function eventChallengeAccepted() {
  console.log(`Challenge accepted by ${challengerName}`);
  changeModalContent('challengeAccepted', challengerName);
  return;
}

function eventChallengeRejected() {
  console.log(`Challenge rejected by ${challengerName}`);
  changeModalContent('challengeRejected', challengerName);
  closeConn();
  return;
}

function eventChallengeCancel(challengerName) {
  console.log(`Challenge cancelled by ${challengerName}`);
  blockProcess();
  changeModalContent('challengeCancel', challengerName);
  closeConn();
  return;
}

function eventForfeitGame(message) {
  const opponentName = message;
  console.log(opponentName);
  forfeitMessage();
  console.log(`Game forfeitted by ${opponentName}`);
  changeModalContent('forfeitNotification', opponentName);
  return;
}

function eventChatMessage(data) {
  const chatMessage = data;
  console.log(`Chat message received: ${chatMessage}`);
  const opponentName = getOpponentName();
  opponentMessage(opponentName, chatMessage);
  return;
}

function eventGameOver(message) {
  let gameOverMessage = [];
  const opponentName = getOpponentName();
  gameOverMessage[0] = message;
  gameOverMessage[1] = opponentName;
  console.log(`Chat message received: ${JSON.stringify(gameOverMessage)}`);
  changeModalContent('eventGameOverLose', gameOverMessage);
  return;
}

export async function getOpponentUserKey(opponent) {
  const playersRef = database.ref('players');
  console.log(playersRef);

  try {
    // Query Firebase to check if displayName already exists
    const querySnapshot = await playersRef
      .orderByChild('displayName')
      .equalTo(opponent.displayName)
      .once('value');

    console.log(querySnapshot);
    if (querySnapshot.exists()) {
      querySnapshot.forEach((childSnapshot) => {
        // Access the key using childSnapshot.key
        opponent.userKey = childSnapshot.key;
      });
    } else {
      console.log(`Opponent not found.`);
      opponent.userKey = null;
      return null;
    }

    console.log(opponent);
    return opponent;
  } catch (error) {
    console.log(`Problem getting opponent record - ${error}`);
    return null;
  }
}

export async function assignConn(opponent) {
  conn = await connectToPlayer(opponent);
  return conn;
}

export async function defineOpponent(opponentName) {
  const playersRef = database.ref('players');
  console.log(playersRef);

  try {
    // Query Firebase to check if displayName already exists
    const querySnapshot = await playersRef
      .orderByChild('displayName')
      .equalTo(opponentName)
      .once('value');

    console.log(querySnapshot);
    if (querySnapshot.exists()) {
      const opponentData = querySnapshot.val();
      const opponentKey = Object.keys(opponentData)[0];
      const opponent = opponentData[opponentKey];
      console.log(`Opponent found: ${JSON.stringify(opponent)}`);
      return opponent;
    } else {
      console.log(`Opponent not found.`);
      return null;
    }
  } catch (error) {
    console.log(`Problem getting opponent record - ${error}`);
    return null;
  }
}

export function closeConn() {
  connOpen = false;
  return;
}

export function blockProcess() {
  blockProcessFlag = true;
  return;
}

export function enableProcess() {
  blockProcessFlag = false;
  return;
}

// CODE END
/////////////////////////////////////////////////////////////////////////////////////////
