// CODE START

// NOTES
// Inter-player communication logic

// IMPORTS
import { firebaseApp, analytics, database } from '../scripts/firebaseConfig.js';
import * as storage from '../scripts/localStorage.js';
import { populatePlayers } from './welcome.js';

('use strict');

console.log('chat.js running');

console.log('Using Firebase in chat.js:', firebaseApp);
const db = database;
console.log(analytics);
console.log(db);

let peer;

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

let remotePeerId = '';
let conn;

// Register on Firebase
function registerForChat(playerObject) {
  // if (!player.displayName) {
  //   console.error('Error: user display name cannot be empty');
  //   return;
  // }

  let players;

  console.log('Registering ' + playerObject.displayName);

  const playerData = {
    displayName: playerObject.displayName,
    peerID: playerObject.peerId,
    skillLevel: playerObject.skillLevel,
    languages: playerObject.languages,
    lastOnline: Math.floor(Date.now() / 1000),
    inGame: false,
  };

  console.log(`Demo register for chat: ${JSON.stringify(playerData)}`);
  const playersRef = database.ref('players'); // Reference to the 'players' node

  // playersRef.on('value', (snapshot) => {
  //   setTimeout(() => {
  //     players = snapshot.val(); // Get all players as an object
  //     console.log('Players:', players);
  //   }, 1000);
  // });

  // Object.entries(playersRef).forEach(([key, value]) => {
  //   console.log(playerData);
  //   console.log(value);
  //   if (value === playerData) {
  //     console.log(`Not adding player as record already exists`);
  //     demoFetchPlayers();
  //     return;
  //   }
  // });

  // console.log(playersRef);

  // Push the player record to Firebase, which generates a unique key
  const newPlayerRef = playersRef.push();

  // Set the player data under the generated key
  newPlayerRef
    .set(playerData)
    .then(() => {
      console.log('Player saved successfully!');
    })
    .catch((error) => {
      console.error('Error saving player: ', error);
    });

  demoFetchPlayers();
  return;
}

export async function fetchPlayers(languageFilter = 'none') {
  const playersRef = database.ref('players');
  let players;

  playersRef.on('value', (snapshot) => {
    players = snapshot.val(); // Get all players as an object
    console.log('Players:', players);
  });

  setTimeout(() => {
    if (languageFilter === 'none') {
      populatePlayers(players);
    } else {
      populatePlayers(players, languageFilter);
    }
  }, 1000);
}

async function fetchPlayer(remoteName) {
  const playerRef = database.ref('players/' + remoteName);

  try {
    const snapshot = await playerRef.once('value');

    if (snapshot.exists()) {
      const remoteUserObject = snapshot.val();
      remotePeerId = remoteUserObject.uniqueCode;
      console.log(remoteName + ' PeerJS code:', remotePeerId);
      return remoteUserObject;
    } else {
      console.log('No player found with that username.');
      return null;
    }
  } catch (err) {
    console.error('Error fetching player data:', err);
    return null;
  }
}

async function connectToPlayer(remoteName) {
  console.log('Attempting to connect to ' + remoteName);

  const playerRef = database.ref('players/' + remoteName);

  try {
    const snapshot = await playerRef.once('value');

    if (!snapshot.exists()) {
      console.log('No player found with that username.');
      return null;
    }

    const remotePeerId = snapshot.val().uniqueCode;
    const conn = peer.connect(remotePeerId);

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

function sendRPC(method, params) {
  const rpcMessage = {
    method: method,
    params: params,
  };
  conn.send(JSON.stringify(rpcMessage));
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
}

// DEMO functions

// Step 1: When displayName is set, registerForChat(your_display_name)
export function demoRegisterForChat() {
  let storedObject = storage.loadLocalStorage();

  const name = storedObject.displayName;
  console.log('Attempting to save user record for ' + name + ' into Firebase');

  // create a user object
  let playerObject = {
    displayName: name,
    languages: storedObject.languages,
    peerId: peer.id,
    skillLevel: storedObject.skillLevel,
  };

  console.log(`Demo register for chat: ${JSON.stringify(playerObject)}`);
  registerForChat(playerObject);
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

// CODE END
