//////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Handles the DOM elements and logic for the welcome section of the webpage

'use strict';
console.log(`welcome.js running`);

//////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS

import { playClickSound } from './script.js';
import * as storage from './localStorage.js';
import * as modals from './modals.js';

//////////////////////////////////////////////////////////////////////////////////////////
// DOM ELEMENT SELECTION

// Player name form elements
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

const mockPlayer7 = {
  displayName: 'Juliano',
  skillLevel: 'Advanced',
  languages: ['it'],
  lastOnline: 1740649195,
};

export let mockPlayerObjects = [
  mockPlayer1,
  mockPlayer2,
  mockPlayer3,
  mockPlayer4,
  mockPlayer5,
  mockPlayer6,
  mockPlayer7,
];

let playersInGame = [mockPlayer3];
let playersOnline = [
  mockPlayer1,
  mockPlayer2,
  mockPlayer3,
  mockPlayer5,
  mockPlayer6,
  mockPlayer7,
];

// Challenger variables
let challengerName = '';

// Language HTML variables
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

const italianHTML = `<p
                      class="players_language_choice no_select"
                      data-language="it"
                      title="Italian"
                    >
                      Italiano
                    </p>`;

//////////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS

// Test button event listeners
testButton3.addEventListener('click', () => {
  playClickSound();
  modals.changeModalContent('Challenge');
});

testButton4.addEventListener('click', () => {
  playClickSound();
  modals.changeModalContent('ChallengeReceived', mockPlayer6.displayName);
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
languageAccordion.addEventListener('click', () => {
  playClickSound();
  if (languagePanel.style.display === 'block') {
    languagePanel.style.display = 'none';
    languageSvg.style.transform = 'rotate(0deg)';
  } else {
    languagePanel.style.display = 'block';
    languageSvg.style.transform = 'rotate(180deg)';
  }
});

playersLanguageAccordion.addEventListener('click', () => {
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
  if (challengerName === '') {
    modals.changeModalContent('NoChallenger');
  } else {
    modals.changeModalContent('Challenge', challengerName);
  }
});

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// General accordion functions

// Closes the accordion specified and rotates its svg icon
// Called by event listeners on skillBegginer, skillAdvanced, skillMaster
// Called by threeLanguagesChosen(), populatePlayerSectionLanguages()
function closeAccordion(accordionPanel, accordionSvg) {
  setTimeout(() => {
    accordionPanel.style.display = 'none';
    accordionSvg.style.transform = 'rotate(0deg)';
  }, 500);
}

// Language section functions

// Adds language flag images to the relevant section of the you section
// Called by an event listener on languageChoices
// Called by welcomeBackPopulateFields(), populatePlayersSectionData()
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
    if (workingLanguages[i].includes('it')) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/italy_flag.png"
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

// Automatically closes the languages accordion when three languages have been selected
// Called by an event listener on languageChoices
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

// Generates a language name based on a language choice element's data
// Called by populatePlayerSectionLanguages()
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
    case 'it':
      languageName = 'Italiano';
      break;
  }
  return languageName;
}

// If the data proviued by the user is valid, it writes data to the local storage object by calling changeModalContent()
// Called by an event listener on continueButton
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

// Checks to see if there is data already written into local storage and returns true or false
// Called by showMain() in script.js
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

// Populates page field's with user data if local storage has already been written to
// Called by checkForLocalStroageObject()
function welcomeBackPopulateFields() {
  const storedObject = storage.loadLocalStorage();
  playerInfoNameReturn.textContent = storedObject.displayName;
  playerInfoSkillReturn.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  addLanguageFlags(1);
}

// Populates the players section's you elements with data from the local storage object
// Called by changeModalContent() in modals.js
export function populatePlayersSectionData() {
  const storedObject = storage.loadLocalStorage();
  playerInfoNameNext.textContent = storedObject.displayName;
  playerInfoSkillNext.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  addLanguageFlags(1);
}

// Populates the available language options in the playersSection based on the languages chosen by the user
// Called by changeModalContent() in modals.js
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
  if (languagesChosen.includes('it')) {
    languagesHTML += italianHTML;
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

// Populates the players section's player_display element with available players
// Called by filterPlayersByLanguage()
export function populatePlayers(playerList, filter = 'none') {
  let HTML;
  playerList.forEach((player) => {
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
        case 'it':
          playerFlags.push(
            `<img class='player_flag' src='./images/flags/italy_flag.png'>`
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
      const storedObject = storage.loadLocalStorage();
      const userLanguages = storedObject.languages;
      console.log(userLanguages);
      console.log(player.languages);
      if (hasLanguageMatch(userLanguages, player.languages) === true) {
        console.log(`Match detected`);
        checkPlayerOnline(player, playersOnline)
          ? (() => {
              checkPlayerInGame(player, playersInGame)
                ? (HTML = `<div class='player_online_display not_free ${specificClass}'><p class='is_player_active player_ingame'></p><p class='player_text'>${player.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`)
                : (HTML = `<div class='player_online_display ${specificClass}'><p class='is_player_active'></p><p class='player_text'>${player.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`);
              playersDisplay.insertAdjacentHTML('afterbegin', HTML);
            })()
          : console.log(`Nothing to do here!`);
      } else {
        console.log(`Nothing to do here`);
      }
    }
  });
  addPlayerEventListeners(playerList);
}

// Checks if a player is in the online list or not and returns true or false
// Called by populatePlayers()
function checkPlayerOnline(player, playersOnline) {
  if (playersOnline.includes(player)) {
    return true;
  } else {
    return false;
  }
}

// Checks if a player is in a game or is free and returns true or false
// Called by populatePlayers()
function checkPlayerInGame(player, playersInGame) {
  if (playersInGame.includes(player)) {
    return true;
  } else {
    return false;
  }
}

// Adds event listeners to the programmatically created player choice elements
// Called by populatePlayers()
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
      console.log(current.classList);
      if (current.classList.contains('not_free')) {
        console.log(`Nothing to do here!`);
      } else {
        current.addEventListener('click', () => {
          playClickSound();
          const newDOMElements = document.querySelectorAll(
            '.player_online_display'
          );
          challengerName = player.displayName;
          newDOMElements.forEach((current2) => {
            current2.classList.remove('accordion_selected');
          });
          current.classList.toggle('accordion_selected');
        });
      }
    });
  });
}

// Allows filtering of available player elements by chosen language
// Called by populatePlayerSectionLanguages()
function filterPlayersByLanguage(languageFilter) {
  playersDisplay.innerHTML = '';
  populatePlayers(mockPlayerObjects, languageFilter);
}

// Determines whether the languages in a user's chosen languages match with the languages in another player's languages and populates the player_display field accordingly
// Called by populatePlayers()
function hasLanguageMatch(userLanguages, playerLanguages) {
  return userLanguages.some((element) => playerLanguages.includes(element));
}

// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
