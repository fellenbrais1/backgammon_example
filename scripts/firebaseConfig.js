// CODE START
/////////////////////////////////////////////////////////////////////////////////////////

// NOTES
// Sets up and exports the variables needed to connect to firebase

'use strict';
console.log(`firebaseConfig.js running`);

/////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS

// import { apiKey } from './config.js';

/////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES

exports.handler = async function (event, context) {
  const apiKey = process.env.API_KEY;

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Value of API_KEY is ${value}.` }),
  };
};

// const apiKey = process.env.API_KEY;

if (!apiKey || apiKey === undefined) {
  console.error(`No apiKey value detected`);
}
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: 'backgammon-b1e25.firebaseapp.com',
  projectId: 'backgammon-b1e25',
  storageBucket: 'backgammon-b1e25.firebasestorage.app',
  messagingSenderId: '933438650220',
  appId: '1:933438650220:web:7cfd8f56a2aef998e46549',
  measurementId: 'G-ST0Z166K8V',
};

export const firebaseApp = window.firebase.initializeApp(firebaseConfig);
export const analytics = window.firebase.analytics();
export const database = window.firebase.database();

/////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

console.log('Firebase initialized successfully.');

// CODE END
/////////////////////////////////////////////////////////////////////////////////////////
