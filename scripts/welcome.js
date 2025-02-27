//////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Handles the DOM elements and logic for the welcome section of the webpage

'use strict';
console.log(`welcome.js running`);

//////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS

import { playClickSound, toggleClass } from './script.js';
import * as storage from './localStorage.js';
import * as modals from './modals.js';

//////////////////////////////////////////////////////////////////////////////////////////
// DOM ELEMENT SELECTION

// Player name form elements
const welcomeSection = document.querySelector('.welcome_section');
export const welcomeNameForm = document.querySelector('.welcome_name_form');
const welcomeNameInput = document.getElementById('welcome_name_input');

// Skill section elements
const skillLevelAccordion = document.getElementById('skill_level_accordion');
const skillLevelPanel = skillLevelAccordion.nextElementSibling;
const skillLevelText = document.getElementById('skill_level_text');
const skillLevelSvg = document.getElementById('skill_level_svg');

// Skill choice elements
const skillBeginner = document.querySelector('.skill_beginner');
const skillAdvanced = document.querySelector('.skill_advanced');
const skillMaster = document.querySelector('.skill_master');

// Language section elements
const languageAccordion = document.getElementById('language_accordion');
const languagePanel = languageAccordion.nextElementSibling;
const languageText = document.getElementById('language_text');
const languageSvg = document.getElementById('language_svg');

// Language choice elements
const languageChoices = document.querySelectorAll('.language_choice');
const playersLanguageChoices = document.querySelectorAll(
  '.players_language_choice'
);

// You section elements
const playerInfoName = document.querySelector('.player_info_name');
const playerInfoSkill = document.querySelector('.player_info_skill');
const playerInfoFlags = document.getElementById('player_info_flags');

// Step elements
const step2Div = document.querySelector('.step2');
const step3Div = document.querySelector('.step3');
const step4Div = document.querySelector('.step4');

// Challenge button
const continueButton = document.querySelector('.welcome_continue_button');

// Step return elements
const returnSection = document.querySelector('.return_section');
const playerInfoNameReturn = document.querySelector('.player_info_name_return');
const playerInfoSkillReturn = document.querySelector(
  '.player_info_skill_return'
);
const playerInfoFlagsReturn = document.getElementById(
  'player_info_flags_return'
);
const notYouButton = document.querySelector('.not_you_button');
const continueButtonReturn = document.querySelector('.return_continue_button');

// Players section elements
const playersSection = document.querySelector('.players_section');

const playerInfoNameNext = document.querySelector('.player_info_name_next');
const playerInfoSkillNext = document.querySelector('.player_info_skill_next');
const playerInfoFlagsNext = document.getElementById('player_info_flags_next');
// const challengeButton = document.querySelector('.challenge_button');

// Players section elements
const playersXButton = document.querySelector('.players_x_button');
const playersDisplay = document.querySelector('.players_active');
const playersChallengeButton = document.querySelector('.challenge_button');

// Language section elements
const playersLanguageAccordion = document.getElementById(
  'players_language_accordion'
);
const playersLanguagePanel = playersLanguageAccordion.nextElementSibling;
export const playersLanguageText = document.getElementById(
  'players_language_text'
);
const playersLanguageSvg = document.getElementById('players_language_svg');

// Test button elements
const testButton2 = document.querySelector('.test_button2');
const testButton3 = document.querySelector('.test_button3');
const testButton4 = document.querySelector('.test_button4');
const testButton5 = document.querySelector('.test_button5');

//////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES

// Language section variables
let languagesChosen = [];
let languagesChosenReturn = [];
const maxLanguages = 3;

let languageItems;
let languageFilter = 'en';

let sessionDisplayName = 'Guest';
let sessionSkillLevel = 'Beginner';
let sessionLanguages = [];

// TODO
// Mock variables to test player section population
const mockPlayer1 = {
  displayName: 'Bob',
  skillLevel: 'Beginner',
  languages: ['en', 'zh'],
  lastOnline: 1740486329,
};

const mockPlayer2 = {
  displayName: 'Jubilee',
  skillLevel: 'Master',
  languages: ['ja', 'es'],
  lastOnline: 1740481329,
};

const mockPlayer3 = {
  displayName: 'Arcturus',
  skillLevel: 'Beginner',
  languages: ['en', 'ja'],
  lastOnline: 1740483329,
};

const mockPlayer4 = {
  displayName: 'Jesper',
  skillLevel: 'Master',
  languages: ['en'],
  lastOnline: 1740484329,
};

const mockPlayer5 = {
  displayName: 'Ellim',
  skillLevel: 'Advanced',
  languages: ['en', 'zh', 'es'],
  lastOnline: 1740482329,
};

const mockPlayer6 = {
  displayName: 'Tariger12345',
  skillLevel: 'Beginner',
  languages: ['en', 'zh', 'ja'],
  lastOnline: 1740644195,
};

export let mockPlayerObjects = [
  mockPlayer1,
  mockPlayer2,
  mockPlayer3,
  mockPlayer4,
  mockPlayer5,
  mockPlayer6,
];

let playersInGame = [mockPlayer3];
let playersOnline = [
  mockPlayer1,
  mockPlayer2,
  mockPlayer3,
  mockPlayer5,
  mockPlayer6,
];
let DOMElement;

//////////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS

// Test button event listeners
testButton3.addEventListener('click', () => {
  playClickSound();
  modals.changeModalContent('Challenge');
});

testButton4.addEventListener('click', () => {
  playClickSound();
  modals.changeModalContent('ChallengeReceived');
});

testButton5.addEventListener('click', () => {
  playClickSound();
  modals.changeModalContent('ForfeitRequest');
});

// Player name form event listeners
welcomeNameForm.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    playClickSound();
    const welcomeName = welcomeNameInput.value;
    if (welcomeNameInput.value !== '') {
      if (welcomeName.length >= 3) {
        if (welcomeName.length > 12) {
          modals.changeModalContent('NameProblem');
          return;
        } else {
          playerInfoName.textContent = welcomeName;
          sessionDisplayName = welcomeName;
          step2Div.classList.add('reveal');
          return;
        }
      } else {
        modals.changeModalContent('NameProblem');
        return;
      }
    } else {
      modals.changeModalContent('NoName');
      welcomeNameInput.value = sessionDisplayName;
      return;
    }
  }
});

// Skill section event listeners
skillLevelAccordion.addEventListener('click', function () {
  playClickSound();
  if (skillLevelPanel.style.display === 'block') {
    skillLevelPanel.style.display = 'none';
    skillLevelSvg.style.transform = 'rotate(0deg)';
  } else {
    skillLevelPanel.style.display = 'block';
    skillLevelSvg.style.transform = 'rotate(180deg)';
  }
});

// Skill choice event listeners
skillBeginner.addEventListener('click', () => {
  playClickSound();
  skillBeginner.classList.add('accordion_selected');
  skillAdvanced.classList.remove('accordion_selected');
  skillMaster.classList.remove('accordion_selected');
  skillLevelText.textContent = 'Beginner 🏆';
  playerInfoSkill.textContent = 'Beginner 🏆';
  sessionSkillLevel = 'Beginner';
  step3Div.classList.add('reveal');
  closeAccordion(skillLevelPanel, skillLevelSvg);
});

skillAdvanced.addEventListener('click', () => {
  playClickSound();
  skillAdvanced.classList.add('accordion_selected');
  skillBeginner.classList.remove('accordion_selected');
  skillMaster.classList.remove('accordion_selected');
  skillLevelText.textContent = 'Advanced 🏆🏆';
  playerInfoSkill.textContent = 'Advanced 🏆🏆';
  sessionSkillLevel = 'Advanced';
  step3Div.classList.add('reveal');
  closeAccordion(skillLevelPanel, skillLevelSvg);
});

skillMaster.addEventListener('click', () => {
  playClickSound();
  skillMaster.classList.add('accordion_selected');
  skillBeginner.classList.remove('accordion_selected');
  skillAdvanced.classList.remove('accordion_selected');
  skillLevelText.textContent = 'Master 🏆🏆🏆';
  playerInfoSkill.textContent = 'Master 🏆🏆🏆';
  sessionSkillLevel = 'Master';
  step3Div.classList.add('reveal');
  closeAccordion(skillLevelPanel, skillLevelSvg);
});

// Language section event listeners
languageAccordion.addEventListener('click', function () {
  playClickSound();
  if (languagePanel.style.display === 'block') {
    languagePanel.style.display = 'none';
    languageSvg.style.transform = 'rotate(0deg)';
  } else {
    languagePanel.style.display = 'block';
    languageSvg.style.transform = 'rotate(180deg)';
  }
});

playersLanguageAccordion.addEventListener('click', function () {
  playClickSound();
  if (playersLanguagePanel.style.display === 'block') {
    playersLanguagePanel.style.display = 'none';
    playersLanguageSvg.style.transform = 'rotate(0deg)';
  } else {
    playersLanguagePanel.style.display = 'block';
    playersLanguageSvg.style.transform = 'rotate(180deg)';
  }
});

// Language choices event listeners
languageChoices.forEach((current) => {
  current.addEventListener('click', () => {
    playClickSound();

    const languageValue = current.dataset.language;

    if (current.classList.contains('accordion_selected')) {
      current.classList.remove('accordion_selected');
      languagesChosen = languagesChosen.filter(
        (element) => element !== languageValue
      );
      threeLanguagesChosen();
      addLanguageFlags();
      return;
    }
    if (
      languagesChosen.length < maxLanguages &&
      !languagesChosen.includes(languageValue)
    ) {
      current.classList.add('accordion_selected');
      languagesChosen.push(languageValue);
      threeLanguagesChosen();
      addLanguageFlags();
      return;
    }
  });
});

// Continue button event listeners
continueButton.addEventListener('click', () => {
  playClickSound();
  createUserData();
});

continueButtonReturn.addEventListener('click', () => {
  playClickSound();
  const storedObject = storage.loadLocalStorage();
  const data = {
    displayName: storedObject.displayName,
    skillLevel: storedObject.skillLevel,
    languages: storedObject.languages,
    languagesChosen: languagesChosenReturn,
  };
  modals.changeModalContent('ConfirmName', data);
  // const data = storage.loadLocalStorage();
  // modals.changeModalContent('ReturnConfirmName', data);
  // populatePlayersSectionData();
  // populatePlayers(mockPlayerObjects);

  // returnSection.classList.remove('reveal');
  // playersSection.classList.add('reveal');
  // populatePlayerSectionLanguages(languagesChosenReturn);
});

// Welcome back return section event listeners
notYouButton.addEventListener('click', () => {
  playClickSound();
  modals.changeModalContent('NotYou');
});

// Players section event listeners
playersXButton.addEventListener('click', () => {
  playClickSound();
  modals.changeModalContent('Return');
});

playersChallengeButton.addEventListener('click', () => {
  playClickSound();
  modals.changeModalContent('NoChallenger');
});

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// General accordion functions
// Closes the accordion specified and inverts its svg
function closeAccordion(accordionPanel, accordionSvg) {
  setTimeout(() => {
    accordionPanel.style.display = 'none';
    accordionSvg.style.transform = 'rotate(0deg)';
  }, 500);
}

// Language section functions
// Adds language flag images to the relevant section of the you section
function addLanguageFlags(flag = 0) {
  let flag1,
    flag2,
    flag3 = '<p></p>';
  let flags = [flag1, flag2, flag3];
  let workingLanguages;

  sessionLanguages = languagesChosen;
  if (flag === 0) {
    workingLanguages = languagesChosen;
  } else {
    workingLanguages = languagesChosenReturn;
  }
  for (let i = 0; i < workingLanguages.length; i++) {
    if (workingLanguages[i].includes('en')) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/english_flag.png"
              />`;
    }
    if (workingLanguages[i].includes('es')) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/spanish_flag.png"
              />`;
    }
    if (workingLanguages[i].includes('zh')) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/chinese_flag.png"
              />`;
    }
    if (workingLanguages[i].includes('ja')) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/japanese_flag.png"
              />`;
    }
  }
  if (flag === 0) {
    playerInfoFlags.innerHTML = flags.join('');
    if (languagesChosen.length === 0) {
      languageText.textContent = `Select Language`;
      return;
    } else {
      step4Div.classList.add('reveal');
      languageText.innerHTML = flags.join('');
      return;
    }
  } else {
    playerInfoFlagsReturn.innerHTML = flags.join('');
    playerInfoFlagsNext.innerHTML = flags.join('');
  }
}

function threeLanguagesChosen() {
  if (languagesChosen.length === 3) {
    console.log(languagesChosen);
    closeAccordion(languagePanel, languageSvg);
    return;
  } else {
    console.log(languagesChosen);
    return;
  }
}

function retrieveLanguageName(languageData) {
  let languageName = '';
  switch (languageData) {
    case 'en':
      languageName = 'English';
      break;
    case 'es':
      languageName = 'Espanol';
      break;
    case 'zh':
      languageName = '中文';
      break;
    case 'ja':
      languageName = '日本語';
      break;
  }
  return languageName;
}

function createUserData() {
  if (
    sessionDisplayName !== '' &&
    sessionDisplayName.length > 3 &&
    sessionDisplayName.length < 13 &&
    sessionSkillLevel !== '' &&
    sessionLanguages.length > 0
  ) {
    const data = {
      displayName: sessionDisplayName,
      skillLevel: sessionSkillLevel,
      languages: sessionLanguages,
      languagesChosen: languagesChosen,
    };
    modals.changeModalContent('ConfirmName', data);
  } else {
    modals.changeModalContent('IncompleteData');
    return;
  }
}

export function checkForLocalStorageObject() {
  const storedObject = storage.loadLocalStorage();
  if (
    storedObject.displayName !== '' &&
    storedObject.displayName.length > 3 &&
    storedObject.displayName.length < 13 &&
    storedObject.skillLevel !== '' &&
    storedObject.languages.length > 0
  ) {
    welcomeBackPopulateFields();
    return true;
  } else {
    return false;
  }
}

function welcomeBackPopulateFields() {
  const storedObject = storage.loadLocalStorage();
  playerInfoNameReturn.textContent = storedObject.displayName;
  playerInfoSkillReturn.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  addLanguageFlags(1);
}

export function populatePlayersSectionData() {
  const storedObject = storage.loadLocalStorage();
  playerInfoNameNext.textContent = storedObject.displayName;
  playerInfoSkillNext.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  addLanguageFlags(1);
}

populatePlayersSectionData();

const englishHTML = `<p
class="players_language_choice no_select"
data-language="en"
title="English"
>
English
</p>`;

const spanishHTML = `<p
                      class="players_language_choice no_select"
                      data-language="es"
                      title="Spanish"
                    >
                      Espanol
                    </p>`;

const chineseHTML = `<p
                      class="players_language_choice no_select"
                      data-language="zh"
                      title="Chinese"
                    >
                      中文
                    </p>`;

const japaneseHTML = `<p
                      class="players_language_choice no_select"
                      data-language="ja"
                      title="Japanese"
                    >
                      日本語
                    </p>`;

export function populatePlayerSectionLanguages(languagesChosen) {
  let languagesHTML = '';
  if (languagesChosen.includes('en')) {
    languagesHTML += englishHTML;
  }
  if (languagesChosen.includes('es')) {
    languagesHTML += spanishHTML;
  }
  if (languagesChosen.includes('zh')) {
    languagesHTML += chineseHTML;
  }
  if (languagesChosen.includes('ja')) {
    languagesHTML += japaneseHTML;
  }
  playersLanguagePanel.innerHTML = languagesHTML;
  languageItems = playersLanguagePanel.querySelectorAll(
    '.players_language_choice'
  );
  languageItems.forEach((current) => {
    current.addEventListener('click', () => {
      playClickSound();

      const languageValue = current.dataset.language;
      const languageName = retrieveLanguageName(languageValue);

      if (current.classList.contains('accordion_selected')) {
        languageItems.forEach((current2) => {
          current2.classList.remove('accordion_selected');
        });
        languageFilter = 'none';
        playersLanguageText.textContent = `Select`;
        closeAccordion(playersLanguagePanel, playersLanguageSvg);
        filterPlayersByLanguage(languageFilter);
        return;
      } else {
        languageItems.forEach((current2) => {
          current2.classList.remove('accordion_selected');
        });
        current.classList.add('accordion_selected');
        languageFilter = languageValue;

        playersLanguageText.textContent = languageName;
        closeAccordion(playersLanguagePanel, playersLanguageSvg);
        filterPlayersByLanguage(languageFilter);
        console.log(languageFilter);
        return;
      }
    });
  });
}

export function populatePlayers(playerList, filter = 'none') {
  let HTML;
  mockPlayerObjects.forEach((player) => {
    let skillMarker = '🏆';
    switch (player.skillLevel) {
      case 'Beginner':
        skillMarker = '🏆';
        break;
      case 'Advanced':
        skillMarker = '🏆🏆';
        break;
      case 'Master':
        skillMarker = '🏆🏆🏆';
        break;
    }

    let playerFlags = [];
    player.languages.forEach((current) => {
      const languageData = current;
      switch (languageData) {
        case 'en':
          playerFlags.push(
            `<img class='player_flag' src='./images/flags/english_flag.png'>`
          );
          break;
        case 'es':
          playerFlags.push(
            `<img class='player_flag' src='./images/flags/spanish_flag.png'>`
          );
          break;
        case 'zh':
          playerFlags.push(
            `<img class='player_flag' src='./images/flags/chinese_flag.png'>`
          );
          break;
        case 'ja':
          playerFlags.push(
            `<img class='player_flag' src='./images/flags/japanese_flag.png'>`
          );
          break;
      }
    });
    const joinedPlayerFlags = playerFlags.join('');
    const specificClass = 'player_is_' + player.displayName;

    if (filter !== 'none') {
      console.log(player.languages);
      if (!player.languages.includes(filter)) {
        console.log(`Skipping player`);
      } else {
        checkPlayerOnline(player, playersOnline)
          ? (() => {
              checkPlayerInGame(player, playersInGame)
                ? (HTML = `<div class='player_online_display not_free ${specificClass}'><p class='is_player_active player_ingame'></p><p class='player_text'>${player.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`)
                : (HTML = `<div class='player_online_display ${specificClass}'><p class='is_player_active'></p><p class='player_text'>${player.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`);
              playersDisplay.insertAdjacentHTML('afterbegin', HTML);
            })()
          : console.log(`Nothing to do here!`);
      }
    } else {
      checkPlayerOnline(player, playersOnline)
        ? (() => {
            checkPlayerInGame(player, playersInGame)
              ? (HTML = `<div class='player_online_display not_free ${specificClass}'><p class='is_player_active player_ingame'></p><p class='player_text'>${player.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`)
              : (HTML = `<div class='player_online_display ${specificClass}'><p class='is_player_active'></p><p class='player_text'>${player.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`);
            playersDisplay.insertAdjacentHTML('afterbegin', HTML);
          })()
        : console.log(`Nothing to do here!`);
    }
    // (HTML = `<div class='player_online_display no_pointer_events ${specificClass}'><p class='is_player_active player_offline'></p><p class='player_text'>${player.displayName}</p><p class='player_text'>${skillMarker}</p><p class='player_text'>${player.languages}</p></div>`);
  });
  addPlayerEventListeners(playerList);
}

function checkPlayerOnline(player, playersOnline) {
  if (playersOnline.includes(player)) {
    return true;
  } else {
    return false;
  }
}

function checkPlayerInGame(player, playersInGame) {
  if (playersInGame.includes(player)) {
    return true;
  } else {
    return false;
  }
}

function addPlayerEventListeners(playerList) {
  playerList.forEach((player) => {
    const element = '.player_is_' + player.displayName;
    const DOMElement = document.querySelectorAll(element);
    const timeNow = Math.floor(Date.now() / 1000);
    DOMElement.forEach((current) => {
      const timeSinceLastLoggedIn = Math.floor(timeNow - player.lastOnline);
      const hours = Math.floor(timeSinceLastLoggedIn % (3600 * 24)) / 3600;
      const minutes = Math.floor((timeSinceLastLoggedIn % 3600) / 60);
      const status = current.classList.contains('not_free')
        ? 'IN GAME'
        : 'FREE';
      current.setAttribute(
        'data-tooltip',
        `${status} Last Active: ${Math.floor(hours)} h, ${minutes} m ago`
      );
      current.addEventListener('click', () => {
        const newDOMElements = document.querySelectorAll(
          '.player_online_display'
        );
        newDOMElements.forEach((current2) => {
          current2.classList.remove('accordion_selected');
        });
        current.classList.toggle('accordion_selected');
      });
    });
  });
}

function filterPlayersByLanguage(languageFilter) {
  playersDisplay.innerHTML = '';
  populatePlayers(mockPlayerObjects, languageFilter);
}

// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
