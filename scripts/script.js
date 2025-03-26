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

// Debug button event listeners
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
  }, 1000);
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
  }, 500);
}

export function toggleClass(pageElement, property) {
  pageElement.classList.contains(property)
    ? pageElement.classList.remove(property)
    : pageElement.classList.add(property);
}

// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
