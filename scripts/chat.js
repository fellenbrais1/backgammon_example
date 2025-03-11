// CODE START

// NOTES
// Inter-player communication logic

'use strict';

// IMPORTS
import { firebaseApp, analytics, database } from '../scripts/firebaseConfig.js';
import { populatePlayers } from './welcome.js';
import * as messages from './messages.js';

console.log('Using Firebase in chat.js:', firebaseApp);
const db = database;
console.log(analytics);
console.log(db);

export let peer;
// let remotePeerId = '';

// BUG
// Linter does not like the 'Peer' constructor in this function but it DOES work
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
    });

    conn.on('data', (data) => {
      console.log('Received data:', data);
      // handleRPC(data);
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

// NOTES
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

    return playersArray; // Now correctly in scope
  } catch (error) {
    console.error('Error retrieving players:', error);
    return [];
  }
}

async function fetchPlayerByKey(playerKey) {
  try {
    const playerRef = database.ref('players').child(playerKey);

    // Modern approach with get()
    const snapshot = await playerRef.get();

    // Older approach with once()
    // const snapshot = await playerRef.once('value');

    if (snapshot.exists()) {
      return snapshot.val(); // Returns the player data object
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
  const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour ago in milliseconds

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

    // console.log('Players online in the last hour:', playersArray);
    return playersArray;
  } catch (error) {
    console.error('Error retrieving recent players:', error);
    return [];
  }
}

export async function connectToPlayer(opponent) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

    delay(1000);

    console.log(conn);

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });

    conn.on('open', () => {
      console.log('Connected to peer:', remotePeerId);
      // Send a test message
      // conn.send(message);
    });

    conn.on('data', (data) => {
      console.log('Received data:', data);
    });

    return conn;
  } catch (err) {
    console.error('Error fetching player data:', err);
    return null;
  }
}

export function sendRPC(method, params) {
  const rpcMessage = {
    method: method,
    params: params,
  };
  console.log(JSON.stringify(rpcMessage));
  setTimeout(() => {
    conn.send(JSON.stringify(rpcMessage));
  }, 5000);
}

function handleRPC(data) {
  console.log('handleRPC function called');
  const rpcMessage = JSON.parse(data);
  console.log('RPC Method:', rpcMessage.method);
  console.log('RPC Params:', rpcMessage.params);

  // Handle the RPC method
  if (rpcMessage.method === 'move') {
    console.log('Player moved to:', rpcMessage.params.position);
  }
  if (rpcMessage.method === 'challenge') {
    console.log(`Challenge sent to ${rpcMessage.params.displayName}`);
  }
  if (rpcMessage.method === 'chat') {
    console.log(`Chat message received: ${rpcMessage.params}`);
    // const opponentName = messages.getOpponentName();
    // messages.pretendOpponentMessage(opponentName, rpcMessage.params);
  }
}

// NOTES
// DEMO functions

// Step 1: When displayName is set, registerForChat(your_display_name)
export async function demoRegisterForChat() {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let player;
  let key;
  let mike_key;

  // Trial 1 - Register Mike (should succeed)
  player = {
    displayName: 'Mike',
    languages: ['English', 'Spanish'],
    peerId: peer.id,
    skillLevel: 'beginner',
  };

  key = await registerForChat(null, player);

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  if (key) {
    mike_key = key;
    console.log('Mike - New player created with key:', key);
  } else {
    console.error('Mike - Error creating record');
  }

  await delay(3000); // Wait 3 seconds

  // Trial 2 - Register Tom (should succeed)
  player.displayName = 'Tom';

  key = await registerForChat(null, player);

  if (key) {
    console.log('Tom - New player created with key:', key);
  } else {
    console.error('Tom - Error creating record');
  }

  await delay(3000); // Wait 3 seconds

  // Trial 3 - Register Mike again (should fail)
  player.displayName = 'Mike';

  key = await registerForChat(null, player);

  if (key) {
    console.log('Mike (2) - New player created with key:', key);
  } else {
    console.error('Mike (2) - Error creating record');
  }

  await delay(3000); // Wait 3 seconds

  // Trial 4 - Updating Mike to speak Swahili (should succeed)
  if (mike_key) {
    player.languages = ['Swahili'];
    player.displayName = 'Tom';

    const key = await registerForChat(mike_key, player);
    if (key) {
      console.log('Mike updated to speak Swahili, key:', key);
    } else {
      console.error('Mike update - Error updating record');
    }
  }

  await delay(3000); // Wait 3 seconds

  fetchPlayers();

  await delay(3000); // Wait 3 seconds

  let mike_player = await fetchPlayerByKey(mike_key);
  console.log('Mike record is: ', mike_player);

  await delay(3000); // Wait 3 seconds

  let recent_players = await fetchRecentPlayers();
  console.log('Recent players are: ', recent_players);
}

// Step 2: Get the records of other players
function demoFetchPlayers() {
  fetchPlayers();
}

// Step 3: User picks a player from the list, then connects to that player
async function demoConnectToPlayer() {
  const remoteName = document.getElementById('remoteName').value.trim();
  conn = await connectToPlayer(remoteName);
}

// Step 4.1: Send an RPC message, e.g. send a chat message
function demoChat() {
  // get the message to send
  const message = document.getElementById('p2pMessage').value.trim();

  sendRPC('chat', { message });
}

// Step 4.2: Send an RPC message, e.g. a challenge
async function demoChallenge() {
  const userName = document.getElementById('userName').value.trim();
  const remoteName = document.getElementById('remoteName').value.trim();

  console.log('Attempting to challenge ' + remoteName);
  const user = await fetchPlayer(userName);
  console.log('User record for ' + userName + ': ', user);

  if (user) {
    // Get my user object to send as part of the challenge
    sendRPC('challenge', user);
  }
}

// Step 4.3: Send an RPC response to challenge - accept
function demoChallengeResponse() {
  sendRPC('challengeResponse', 'accept'); // or 'reject'
}

// Step 4.4: send a dice roll
function demoSendDiceRoll() {
  let sampleRoll = [2, 0, 0, 0];
  sendRPC('diceRoll', sampleRoll);
}

// Step 4.5: send a move
function demoSendMove() {
  let sampleMove = {
    player: 'r',
    from: 24,
    to: 22,
  };

  sendRPC('pieceMove', sampleMove);
}

async function demoFetchPlayer() {
  const remoteName = document.getElementById('remoteName').value.trim();
  const remotePlayer = await fetchPlayer(remoteName);
  console.log('remotePlayer:', remotePlayer);
}

export async function getOpponentUserKey(opponent) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const playersRef = database.ref('players');

  try {
    // Query Firebase to check if displayName already exists
    const querySnapshot = await playersRef
      .orderByChild('displayName')
      .equalTo(opponent.displayName)
      .once('value');

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

    // const opponentRecord = querySnapshot.exists();
    // opponent.userKey = opponentRecord.key;

    await delay(2000);

    console.log(opponent);
    return opponent;
  } catch (error) {
    console.log(`Problem getting opponent record - ${error}`);
    return null;
  }
}

export async function assignConn(opponent) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  conn = await connectToPlayer(opponent);
  delay(2000);
  return conn;
}
// CODE END
