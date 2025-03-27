/////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Inter-player communication logic

'use strict';
console.log(`chat.js running`);

/////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS

import { firebaseApp, analytics, database } from '../scripts/firebaseConfig.js';
import { challengerName, populatePlayers } from './welcome.js';
import {
  forfeitMessage,
  getOpponentName,
  opponentMessage,
} from './messages.js';
import { changeModalContent } from './modals.js';

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
      // processMessage(parsedData);
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
    // removePeerIdFromDatabase(peer.id);
  });
});

let conn;

export async function checkForName(playerName) {
  const playersRef = database.ref('players');

  try {
    // Query Firebase to check if displayName already exists
    const querySnapshot = await playersRef
      .orderByChild('displayName')
      .equalTo(playerName)
      .once('value');
    const nameExists = querySnapshot.exists();

    if (nameExists) {
      console.error('Error: display name already exists');
      return 0;
    } else {
      return 1;
    }
  } catch (error) {
    console.error('Error handling player record: ', error);
    return null;
  }
}

export async function registerForChat(key, player) {
  const playersRef = database.ref('players');

  try {
    // Query Firebase to check if displayName already exists
    const querySnapshot = await playersRef
      .orderByChild('displayName')
      .equalTo(player.displayName)
      .once('value');
    const nameExists = querySnapshot.exists();

    if (key === null) {
      if (nameExists) {
        console.error('Error: display name already exists');
        changeModalContent('nameExists', player.displayName);
        return null;
      }

      // Create a new player record
      const newPlayerRef = playersRef.push();
      await newPlayerRef.set({
        displayName: player.displayName,
        peerID: player.peerID,
        skillLevel: player.skillLevel,
        languages: player.languages,
        lastOnline: Date.now(),
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

    // TODO - This isn't useful in its current form as it will never display, it needs to display if the length of playersObject is less than 2, as there will always be at least 1 record in there when called.
    if (!playersObject) {
      console.log('No players online in the last hour.');
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
      // console.log('Received data:', JSON.parse(data));
      // processMessage(parsedData);
      dispatchMessage(parsedData);
    });

    return conn;
  } catch (err) {
    console.error('Error fetching player data:', err);
    return null;
  }
}

// Added a looping delay that will retry sending the message until the connOpen variable is true, this is controlled by the conn.on(open) event
export async function sendRPC(method, params) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  await delay(1000);

  if (connOpen === true) {
    attemptNo = 1;
    const rpcMessage = {
      method: method,
      params: params,
    };
    console.log(JSON.stringify(rpcMessage));
    setTimeout(() => {
      conn.send(JSON.stringify(rpcMessage));
    }, 1000);
    return;
  } else {
    if (attemptNo < 11) {
      setTimeout(() => {
        console.log(
          `Waiting for open connection (5 seconds) Attempt ${attemptNo}`
        );
        attemptNo++;
        sendRPC(method, params);
      }, 5000);
    } else {
      attemptNo = 1;
      console.log(`Error: Connection cannot be made with the other player.`);
      alert(
        `Error: Connection cannot be made with the other player. Please refresh your session and try again.`
      );
      return;
    }
  }
}

// async function processMessage(message) {
//   console.log('processMessage function called');

//   // const rpcMessage = JSON.parse(data);

//   console.log(JSON.stringify(message));
//   console.log('RPC Method:', message.method);
//   console.log('RPC Params:', message.params);

//   // Handle the RPC message based on the contents of its method property
//   if (message.method === 'move') {
//     playbackMove(message.params);
//     // console.log('Player moved to:', parsedParams.position);
//   }

//   if (message.method === 'diceRoll') {
//     playbackDiceRoll(message.params);
//   }

//   if (message.method === 'challenge') {
//     activeOpponent = await fetchPlayerByKey(message.params);
//     console.log(activeOpponent);
//     console.log(`Challenge received from ${activeOpponent.displayName}`);
//     changeModalContent('challengeReceived', activeOpponent.displayName);
//   }

//   if (message.method === 'challengeAccepted') {
//     console.log(`Challenge accepted by ${challengerName}`);
//     changeModalContent('challengeAccepted', challengerName);
//   }

//   if (message.method === 'challengeRejected') {
//     console.log(`Challenge rejected by ${challengerName}`);
//     changeModalContent('challengeRejected', challengerName);
//   }

//   if (message.method === 'forfeitGame') {
//     const opponentName = message.params;
//     console.log(opponentName);
//     forfeitMessage();
//     console.log(`Game forfeitted by ${opponentName}`);
//     changeModalContent('forfeitNotification', opponentName);
//   }

//   if (message.method === 'chat') {
//     const chatMessage = message.params;
//     console.log(`Chat message received: ${chatMessage}`);
//     const opponentName = getOpponentName();
//     opponentMessage(opponentName, chatMessage);
//   }

//   if (message.method === 'eventGameOverLose') {
//     let gameOverMessage = [];
//     const opponentName = getOpponentName();
//     gameOverMessage[0] = message.params;
//     gameOverMessage[1] = opponentName;
//     console.log(`Chat message received: ${JSON.stringify(gameOverMessage)}`);
//     changeModalContent('eventGameOverLose', gameOverMessage);
//   }
// }

async function eventChallengeSent(message) {
  activeOpponent = await fetchPlayerByKey(message);
  console.log(activeOpponent);
  console.log(`Challenge received from ${activeOpponent.displayName}`);
  changeModalContent('challengeReceived', activeOpponent.displayName);
}

function eventChallengeAccepted() {
  console.log(`Challenge accepted by ${challengerName}`);
  changeModalContent('challengeAccepted', challengerName);
}

function eventChallengeRejected() {
  console.log(`Challenge rejected by ${challengerName}`);
  changeModalContent('challengeRejected', challengerName);
}

function eventForfeitGame(message) {
  const opponentName = message.params;
  console.log(opponentName);
  forfeitMessage();
  console.log(`Game forfeitted by ${opponentName}`);
  changeModalContent('forfeitNotification', opponentName);
}

function eventChatMessage(data) {
  const chatMessage = data;
  console.log(`Chat message received: ${chatMessage}`);
  const opponentName = getOpponentName();
  opponentMessage(opponentName, chatMessage);
}

function eventGameOver(message) {
  let gameOverMessage = [];
  const opponentName = getOpponentName();
  gameOverMessage[0] = message;
  gameOverMessage[1] = opponentName;
  console.log(`Chat message received: ${JSON.stringify(gameOverMessage)}`);
  changeModalContent('eventGameOverLose', gameOverMessage);
}

function dispatchMessage(parsedData) {
  console.log(JSON.stringify(parsedData));
  console.log('dispatchMessage() Method:', parsedData.method);
  console.log('dispatchMessage() Params:', parsedData.params);

  switch (parsedData.method) {
    case 'chat':
      console.log('Send ' + parsedData.params + ' data to eventChatMessage()');
      eventChatMessage(parsedData.params);
      break;
    case 'move':
      console.log('Send ' + parsedData.params + ' data to playbackMove()');
      playbackMove(parsedData.params);
      break;
    case 'diceRoll':
      console.log('Send ' + parsedData.params + ' data to playbackDiceRoll()');
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

// NOTES
// DEMO functions

// Step 1: When displayName is set, registerForChat(your_display_name)
// export async function demoRegisterForChat() {
//   function delay(ms) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   let player;
//   let key;
//   let mike_key;

//   // Trial 1 - Register Mike (should succeed)
//   player = {
//     displayName: 'Mike',
//     languages: ['English', 'Spanish'],
//     peerId: peer.id,
//     skillLevel: 'beginner',
//   };

//   key = await registerForChat(null, player);

//   if (key) {
//     mike_key = key;
//     console.log('Mike - New player created with key:', key);
//   } else {
//     console.error('Mike - Error creating record');
//   }

//   await delay(3000); // Wait 3 seconds

//   // Trial 2 - Register Tom (should succeed)
//   player.displayName = 'Tom';

//   key = await registerForChat(null, player);

//   if (key) {
//     console.log('Tom - New player created with key:', key);
//   } else {
//     console.error('Tom - Error creating record');
//   }

//   await delay(3000); // Wait 3 seconds

//   // Trial 3 - Register Mike again (should fail)
//   player.displayName = 'Mike';

//   key = await registerForChat(null, player);

//   if (key) {
//     console.log('Mike (2) - New player created with key:', key);
//   } else {
//     console.error('Mike (2) - Error creating record');
//   }

//   await delay(3000); // Wait 3 seconds

//   // Trial 4 - Updating Mike to speak Swahili (should succeed)
//   if (mike_key) {
//     player.languages = ['Swahili'];
//     player.displayName = 'Tom';

//     const key = await registerForChat(mike_key, player);
//     if (key) {
//       console.log('Mike updated to speak Swahili, key:', key);
//     } else {
//       console.error('Mike update - Error updating record');
//     }
//   }

//   await delay(3000); // Wait 3 seconds

//   fetchPlayers();

//   await delay(3000); // Wait 3 seconds

//   let mike_player = await fetchPlayerByKey(mike_key);
//   console.log('Mike record is: ', mike_player);

//   await delay(3000); // Wait 3 seconds

//   let recent_players = await fetchRecentPlayers();
//   console.log('Recent players are: ', recent_players);
// }

// // Step 2: Get the records of other players
// function demoFetchPlayers() {
//   fetchPlayers();
// }

// // Step 3: User picks a player from the list, then connects to that player
// async function demoConnectToPlayer() {
//   const remoteName = document.getElementById('remoteName').value.trim();
//   conn = await connectToPlayer(remoteName);
// }

// // Step 4.1: Send an RPC message, e.g. send a chat message
// function demoChat() {
//   // Get the message to send
//   const message = document.getElementById('p2pMessage').value.trim();

//   sendRPC('chat', { message });
// }

// // Step 4.2: Send an RPC message, e.g. a challenge
// async function demoChallenge() {
//   const userName = document.getElementById('userName').value.trim();
//   const remoteName = document.getElementById('remoteName').value.trim();

//   console.log('Attempting to challenge ' + remoteName);
//   const user = await fetchPlayers(userName);
//   console.log('User record for ' + userName + ': ', user);

//   if (user) {
//     // Get my user object to send as part of the challenge
//     sendRPC('challengeSent', user);
//   }
// }

// // Step 4.3: Send an RPC response to challenge - accept
// function demoChallengeResponse() {
//   sendRPC('challengeResponse', 'accept'); // Or 'reject'
// }

// // Step 4.4: send a dice roll
// function demoSendDiceRoll() {
//   let sampleRoll = [2, 0, 0, 0];
//   sendRPC('diceRoll', sampleRoll);
// }

// // Step 4.5: send a move
// function demoSendMove() {
//   let sampleMove = {
//     player: 'r',
//     from: 24,
//     to: 22,
//   };

//   sendRPC('pieceMove', sampleMove);
// }

// async function demoFetchPlayer() {
//   const remoteName = document.getElementById('remoteName').value.trim();
//   const remotePlayer = await fetchPlayers(remoteName);
//   console.log('remotePlayer:', remotePlayer);
// }

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

// CODE END
/////////////////////////////////////////////////////////////////////////////////////////
