//////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Handles the DOM elements and logic for the welcome section of the webpage

'use strict';
console.log(`welcome.js running`);

//////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS

import { playClickSound } from './sounds.js';
import { loadLocalStorage, setLocalStorage } from './localStorage.js';
import { changeModalContent } from './modals.js';
import {
  fetchRecentPlayers,
  getOpponentUserKey,
  peer,
  registerForChat,
  checkForName,
} from './chat.js';

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
const youName = document.querySelector('.you_name');
const youSkill = document.querySelector('.you_skill');
const youFlags = document.querySelector('.you_flags');

// Step elements
const step2Div = document.querySelector('.step2');
const step3Div = document.querySelector('.step3');
const step4Div = document.querySelector('.step4');

// Continue button
const continueButton = document.querySelector('.welcome_continue_button');

// Return section elements
const returnYouName = document.querySelector('.return_you_name');
const returnYouSkill = document.querySelector('.return_you_skill');
const returnYouFlags = document.querySelector('.return_you_flags');
const notYouButton = document.querySelector('.not_you_button');
const continueButtonReturn = document.querySelector('.return_continue_button');

// Players section elements
const nextYouName = document.querySelector('.next_you_name');
const nextYouSkill = document.querySelector('.next_you_skill');
const nextYouFlags = document.querySelector('.next_you_flags');
const playersXButton = document.querySelector('.players_x_button');
const playersDisplay = document.querySelector('.players_active');
const playersChallengeButton = document.querySelector('.challenge_button');

const welcomeSection = document.querySelector('.welcome_section');
const playersSection = document.querySelector('.players_section');

const boardAnnotationsSection = document.querySelector(
  '.board_annotations_section'
);

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

// Challenger variables
export let activeOpponent = '';
export let challengerName = '';

// Variable to enable going back to change your details
let changeDetailsFlag = false;

let continueInterval;
let returnContinueInterval;

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
  changeModalContent('eventGameOverWin', 'backgammon');
});

testButton4.addEventListener('click', () => {
  playClickSound();
  changeModalContent('movesRemaining', [4, 2]);
});

testButton5.addEventListener('click', () => {
  playClickSound();
  changeModalContent('forfeitGame');
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
          changeModalContent('nameProblem');
          return;
        } else {
          youName.textContent = welcomeName;
          sessionDisplayName = welcomeName;
          step2Div.classList.add('reveal');
          welcomeNameForm.classList.remove('focus_element');
          skillLevelAccordion.classList.add('focus_element');
          return;
        }
      } else {
        changeModalContent('nameProblem');
        return;
      }
    } else {
      changeModalContent('noName');
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
  youSkill.textContent = '🏆';
  sessionSkillLevel = '🏆';
  step3Div.classList.add('reveal');
  closeAccordion(skillLevelPanel, skillLevelSvg);
  skillLevelAccordion.classList.remove('focus_element');
  languageAccordion.classList.add('focus_element');
});

skillAdvanced.addEventListener('click', () => {
  playClickSound();
  skillAdvanced.classList.add('accordion_selected');
  skillBeginner.classList.remove('accordion_selected');
  skillMaster.classList.remove('accordion_selected');
  skillLevelText.textContent = 'Advanced 🏆🏆';
  youSkill.textContent = '🏆🏆';
  sessionSkillLevel = '🏆🏆';
  step3Div.classList.add('reveal');
  closeAccordion(skillLevelPanel, skillLevelSvg);
  skillLevelAccordion.classList.remove('focus_element');
  languageAccordion.classList.add('focus_element');
});

skillMaster.addEventListener('click', () => {
  playClickSound();
  skillMaster.classList.add('accordion_selected');
  skillBeginner.classList.remove('accordion_selected');
  skillAdvanced.classList.remove('accordion_selected');
  skillLevelText.textContent = 'Master 🏆🏆🏆';
  youSkill.textContent = '🏆🏆🏆';
  sessionSkillLevel = '🏆🏆🏆';
  step3Div.classList.add('reveal');
  closeAccordion(skillLevelPanel, skillLevelSvg);
  skillLevelAccordion.classList.remove('focus_element');
  languageAccordion.classList.add('focus_element');
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
      languageAccordion.classList.remove('focus_element');
      continueButton.classList.add('focus_element');
      return;
    }
  });
});

// Continue button event listeners
continueButton.addEventListener('click', () => {
  playClickSound();
  createUserData();
  continueButton.classList.remove('focus_element');
  boardAnnotationsSection.classList.remove('reveal_translucent');
  continueInterval = setInterval(refreshPopulatePlayers, 10000);
});

continueButtonReturn.addEventListener('click', async () => {
  playClickSound();
  const storedObjectProto = loadLocalStorage();
  console.log(storedObjectProto);
  setLocalStorage({
    displayName: storedObjectProto.displayName,
    skillLevel: storedObjectProto.skillLevel,
    languages: storedObjectProto.languages,
    languagesChosen: storedObjectProto.languages,
    userKey: storedObjectProto.userKey,
    peerID: peer.id,
  });
  const storedObject = loadLocalStorage();
  console.log(storedObject);
  const data = {
    displayName: storedObject.displayName,
    skillLevel: storedObject.skillLevel,
    languages: storedObject.languages,
    languagesChosen: storedObject.languages,
    userKey: storedObject.userKey,
    peerID: storedObject.peerID,
  };

  populatePlayersSectionData();
  populatePlayerSectionLanguages(data.languages);
  console.log(JSON.stringify(data));

  try {
    await registerForChat(data.userKey, data, changeDetailsFlag);

    fetchRecentPlayers();
    setTimeout(() => {
      boardAnnotationsSection.classList.remove('reveal_translucent');
      welcomeSection.classList.remove('reveal');
      playersSection.classList.add('reveal');
    }, 1000);
    returnContinueInterval = setInterval(refreshPopulatePlayers, 10000);
    return;
  } catch (error) {
    console.error(`Error registering for chat:`, error);
    return;
  }
});

// Welcome back return section event listeners
notYouButton.addEventListener('click', () => {
  playClickSound();
  changeModalContent('notYou');
});

// Players section event listeners
playersXButton.addEventListener('click', () => {
  playClickSound();
  changeModalContent('return');
});

playersChallengeButton.addEventListener('click', () => {
  playClickSound();
  if (challengerName === '') {
    changeModalContent('noChallenger');
  } else {
    changeModalContent('challengeSent', challengerName);
    const storedObject = loadLocalStorage();
    storedObject.lastOnline = Date.now();
  }
});

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// General accordion functions

// Closes the accordion specified and rotates its svg icon
// Called by event listeners on skillBeginner, skillAdvanced, skillMaster
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
export function addLanguageFlags(flag = 0, changeDetails = false) {
  let flag1,
    flag2,
    flag3 = '<p></p>';
  let flags = [flag1, flag2, flag3];
  let flagYou1, flagYou2, flagYou3;
  let flagsYou = [flagYou1, flagYou2, flagYou3];
  let workingLanguages;

  if (changeDetails) {
    let storedObject = loadLocalStorage();
    workingLanguages = storedObject.languages;
    console.log(workingLanguages);
  } else {
    sessionLanguages = languagesChosen;
    if (flag === 0) {
      workingLanguages = languagesChosen;
    } else {
      workingLanguages = languagesChosenReturn;
    }
  }

  for (let i = 0; i < workingLanguages.length; i++) {
    if (workingLanguages[i].includes('en')) {
      flags[i] = `<img
                class="player_flag_img"
                data-language="en"
                src="./images/flags/english_flag.png"
              />`;
      flagsYou[i] = `<img
              class="player_flag_bigger"
              data-language="en"
              src="./images/flags/english_flag.png"
            />`;
    }
    if (workingLanguages[i].includes('es')) {
      flags[i] = `<img
                class="player_flag_img"
                data-language="es"
                src="./images/flags/spanish_flag.png"
              />`;
      flagsYou[i] = `<img
              class="player_flag_bigger"
              data-language="es"
              src="./images/flags/spanish_flag.png"
            />`;
    }
    if (workingLanguages[i].includes('zh')) {
      flags[i] = `<img
                class="player_flag_img"
                data-language="zh"
                src="./images/flags/chinese_flag.png"
              />`;
      flagsYou[i] = `<img
              class="player_flag_bigger"
              data-language="zh"
              src="./images/flags/chinese_flag.png"
            />`;
    }
    if (workingLanguages[i].includes('ja')) {
      flags[i] = `<img
                class="player_flag_img"
                data-language="ja"
                src="./images/flags/japanese_flag.png"
              />`;
      flagsYou[i] = `<img
              class="player_flag_bigger"
              data-language="ja"
              src="./images/flags/japanese_flag.png"
            />`;
    }
    if (workingLanguages[i].includes('it')) {
      flags[i] = `<img
                class="player_flag_img"
                data-language="it"
                src="./images/flags/italy_flag.png"
              />`;
      flagsYou[i] = `<img
              class="player_flag_bigger"
              data-language="it"
              src="./images/flags/italy_flag.png"
            />`;
    }
  }
  if (flags.length > 1) {
    flags.sort((a, b) => {
      const matchA = a.match(/data-language="([^"]+)"/);
      const matchB = b.match(/data-language="([^"]+)"/);

      if (matchA && matchB) {
        const langA = matchA[1];
        const langB = matchB[1];
        return langA.localeCompare(langB);
      } else if (matchA) {
        return -1;
      } else if (matchB) {
        return 1;
      } else {
        return 0;
      }
    });
  }
  if (flagsYou.length > 1) {
    flagsYou.sort((a, b) => {
      const matchA = a.match(/data-language="([^"]+)"/);
      const matchB = b.match(/data-language="([^"]+)"/);

      if (matchA && matchB) {
        const langA = matchA[1];
        const langB = matchB[1];
        return langA.localeCompare(langB);
      } else if (matchA) {
        return -1;
      } else if (matchB) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  if (changeDetails) {
    youFlags.innerHTML = flagsYou.join('');
    languageText.innerHTML = flags.join('');
  } else {
    if (flag === 0) {
      youFlags.innerHTML = flagsYou.join('');
      if (languagesChosen.length === 0) {
        languageText.textContent = `Select Language`;
        return;
      } else {
        step4Div.classList.add('reveal');
        languageText.innerHTML = flags.join('');
        return;
      }
    } else {
      returnYouFlags.innerHTML = flagsYou.join('');
      nextYouFlags.innerHTML = flagsYou.join('');
    }
  }
}

// Automatically closes the languages accordion when three languages have been selected
// Called by an event listener on languageChoices
function threeLanguagesChosen() {
  if (languagesChosen.length === 3) {
    closeAccordion(languagePanel, languageSvg);
    return;
  } else {
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

// If the data provided by the user is valid, it writes data to the local storage object by calling changeModalContent()
// Called by an event listener on continueButton
async function createUserData() {
  let allowedName = '';

  if (changeDetailsFlag) {
    const storedObject = loadLocalStorage();
    allowedName = storedObject.displayName;
  }

  if (
    sessionDisplayName !== '' &&
    sessionDisplayName.length >= 3 &&
    sessionDisplayName.length < 13 &&
    sessionSkillLevel !== '' &&
    sessionLanguages.length > 0
  ) {
    console.log(`CREATE USER DATA PEER.ID = ${peer.id}`);
    const data = {
      displayName: sessionDisplayName,
      skillLevel: sessionSkillLevel,
      languages: sessionLanguages,
      languagesChosen: languagesChosen,
      peerID: peer.id,
      inGame: false,
    };
    console.log(JSON.stringify(data));

    console.log(`LANGUAGES = ${data.languages}`);
    console.log(`PEERID = ${data.peerID}`);

    const result = await checkForName(data.displayName, allowedName);
    console.log(`RESULT IS: ${result}`);
    if (result === 0) {
      if (changeDetailsFlag) {
        console.log(`Allowed name is: ${storedObject.displayName}`);
      } else {
        changeModalContent('nameExists', data.displayName);
        return;
      }
    } else {
      try {
        let userKey;
        if (changeDetailsFlag) {
          const storedObject = loadLocalStorage();
          userKey = await registerForChat(
            storedObject.userKey,
            data,
            allowedName
          );
        } else {
          userKey = await registerForChat(null, data, allowedName);
        }
        changeDetailsFlag = false;
        console.log(userKey);

        setLocalStorage({
          displayName: data.displayName,
          skillLevel: data.skillLevel,
          languages: data.languages,
          peerID: data.peerID,
          userKey: userKey,
        });

        populatePlayersSectionData();
        populatePlayerSectionLanguages(data.languages);

        fetchRecentPlayers();
        setTimeout(() => {
          welcomeSection.classList.remove('reveal');
          playersSection.classList.add('reveal');
        }, 1000);
        return;
      } catch (error) {
        console.error(`Error registering for chat:`, error);
        changeDetailsFlag = false;
        return;
      }
    }
  } else {
    console.log(sessionDisplayName);
    console.log(sessionSkillLevel);
    console.log(sessionLanguages);
    changeModalContent('incompleteData');
    return;
  }
}

// Checks to see if there is data already written into local storage and returns true or false
// Called by showMain() in script.js
export function checkForLocalStorageObject() {
  const storedObject = loadLocalStorage();
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
export function welcomeBackPopulateFields() {
  const storedObject = loadLocalStorage();
  returnYouName.textContent = storedObject.displayName;
  returnYouSkill.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  console.log(storedObject.languages);
  console.log(languagesChosenReturn);
  addLanguageFlags(1);
}

// Populates the players section's you elements with data from the local storage object
// Called by changeModalContent() in modals.js
export function populatePlayersSectionData() {
  const storedObject = loadLocalStorage();
  console.log(JSON.stringify(storedObject));
  nextYouName.textContent = storedObject.displayName;
  nextYouSkill.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  console.log(storedObject.languages);
  console.log(languagesChosenReturn);
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
        return;
      }
    });
  });
}

// Populates the players section's player_display element with available players
// Called by filterPlayersByLanguage()
export function populatePlayers(playerList, filter = 'none') {
  const storedObject = loadLocalStorage();
  playersDisplay.innerHTML = '';
  let HTML;
  playerList.forEach((value) => {
    let skillMarker = value.skillLevel;
    let playerFlags = [];

    value.languages.forEach((current) => {
      const languageData = current;
      switch (languageData) {
        case 'en':
          playerFlags.push(
            `<img class='player_flag' data-language="en" src='./images/flags/english_flag.png'>`
          );
          break;
        case 'es':
          playerFlags.push(
            `<img class='player_flag' data-language="es" src='./images/flags/spanish_flag.png'>`
          );
          break;
        case 'zh':
          playerFlags.push(
            `<img class='player_flag' data-language="zh" src='./images/flags/chinese_flag.png'>`
          );
          break;
        case 'ja':
          playerFlags.push(
            `<img class='player_flag' data-language="ja" src='./images/flags/japanese_flag.png'>`
          );
          break;
        case 'it':
          playerFlags.push(
            `<img class='player_flag' data-language="it" src='./images/flags/italy_flag.png'>`
          );
          break;
      }
    });
    playerFlags.sort((a, b) => {
      const langA = a.match(/data-language="([^"]+)"/)[1];
      const langB = b.match(/data-language="([^"]+)"/)[1];
      return langA.localeCompare(langB);
    });

    const joinedPlayerFlags = playerFlags.join('');
    const newName = value.displayName.replace(' ', '_');
    const specificClass = 'player_is_' + newName;

    if (filter !== 'none') {
      if (!value.languages.includes(filter)) {
        console.log(
          `Skipping player ${value.displayName} - Does not speak a common language`
        );
      } else if (value.displayName === storedObject.displayName) {
        console.log(`Skipping player ${value.displayName} - Same name`);
      } else {
        checkPlayerOnline(value.lastOnline)
          ? (() => {
              checkPlayerInGame(value.inGame)
                ? (HTML = `<div class='player_online_display not_free ${specificClass}'><p class='is_player_active player_ingame'></p><p class='player_text'>${value.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`)
                : (HTML = `<div class='player_online_display ${specificClass}'><p class='is_player_active'></p><p class='player_text'>${value.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`);
              playersDisplay.insertAdjacentHTML('afterbegin', HTML);
            })()
          : console.log(`Nothing to do for ${value.displayName} - Offline`);
      }
    } else {
      const userLanguages = storedObject.languages;
      if (hasLanguageMatch(userLanguages, value.languages) === true) {
        if (value.displayName === storedObject.displayName) {
          console.log(`Skipping player ${value.displayName} - Same name`);
        } else {
          checkPlayerOnline(value.lastOnline)
            ? (() => {
                checkPlayerInGame(value.inGame)
                  ? (HTML = `<div class='player_online_display not_free ${specificClass}'><p class='is_player_active player_ingame'></p><p class='player_text'>${value.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`)
                  : (HTML = `<div class='player_online_display ${specificClass}'><p class='is_player_active'></p><p class='player_text'>${value.displayName}</p><p class='player_text skill_marker'>${skillMarker}</p><p class='player_text'>${joinedPlayerFlags}</p></div>`);
                playersDisplay.insertAdjacentHTML('afterbegin', HTML);
              })()
            : console.log(`Nothing to do for ${value.displayName} - Offline`);
        }
      } else {
        console.log(
          `Nothing to do for ${value.displayName} - Does not speak a common language`
        );
      }
    }
  });

  addPlayerEventListeners(playerList);
}

// Checks if a player is in the online list or not and returns true or false
// Called by populatePlayers()
function checkPlayerOnline(lastOnline) {
  const now = Date.now();
  const difference = now - lastOnline;
  console.log(`RESULT IS: ${difference}`);

  const onlineThreshold = 60 * 60 * 1000 * 2; // 2 HOURS

  return difference < onlineThreshold;
}

// Checks if a player is in a game or is free and returns true or false
// Called by populatePlayers()
function checkPlayerInGame(inGame) {
  if (inGame === true) {
    return true;
  } else {
    return false;
  }
}

// Adds event listeners to the programmatically created player choice elements
// Called by populatePlayers()
function addPlayerEventListeners(playerList) {
  Object.entries(playerList).forEach(([key, value]) => {
    console.log(JSON.stringify(value));
    const newName = value.displayName.replace(' ', '_');
    const element = '.player_is_' + newName;
    const DOMElement = document.querySelectorAll(element);
    const timeNow = Date.now();

    DOMElement.forEach((current) => {
      const timeSinceLastLoggedIn = timeNow - value.lastOnline;

      const totalSeconds = Math.floor(timeSinceLastLoggedIn / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      console.log(`Last Online (ms): ${value.lastOnline}`);
      console.log(`Time Since Last Login (ms): ${timeSinceLastLoggedIn}`);
      console.log(`Hours ago: ${hours}`);
      console.log(`Minutes ago: ${minutes}`);

      const status = current.classList.contains('not_free')
        ? 'IN GAME'
        : 'FREE';
      current.setAttribute(
        'data-tooltip',
        `${status} Last Active: ${Math.floor(hours)} h, ${minutes} m ago`
      );
      if (current.classList.contains('not_free')) {
        console.log(`Nothing to do for ${current.displayName} - In game`);
      } else {
        current.addEventListener('click', () => {
          playClickSound();
          const newDOMElements = document.querySelectorAll(
            '.player_online_display'
          );
          activeOpponent = value;
          challengerName = value.displayName;
          newDOMElements.forEach((current2) => {
            current2.classList.remove('accordion_selected');
          });
          current.classList.toggle('accordion_selected');
          pauseRefreshPopulatePlayers();
        });
      }
    });
  });
}

// Allows filtering of available player elements by chosen language
// Called by populatePlayerSectionLanguages()
function filterPlayersByLanguage(languageFilter) {
  challengerName = '';
  playersDisplay.innerHTML = '';
  fetchRecentPlayers(languageFilter);
}

// Determines whether the languages in a user's chosen languages match with the languages in another player's languages and populates the player_display field accordingly
// Called by populatePlayers()
function hasLanguageMatch(userLanguages, playerLanguages) {
  return userLanguages.some((element) => playerLanguages.includes(element));
}

export async function playerPairingUserChallenge() {
  const storedObject = loadLocalStorage();
  storedObject.lastOnline = Date.now();
  const playerWhite = storedObject;

  const playerRed = await getOpponentUserKey(activeOpponent);
  console.log(playerRed);

  console.log(`Player White: ${JSON.stringify(playerWhite)}`);
  console.log(`Player Red: ${JSON.stringify(playerRed)}`);

  return {
    you: playerWhite,
    opponent: playerRed,
  };
}

export async function playerPairingChallengee(activeOpponentHere) {
  const storedObject = loadLocalStorage();
  storedObject.lastOnline = Date.now();
  const playerRed = storedObject;
  console.log(activeOpponentHere);

  const playerWhite = await getOpponentUserKey(activeOpponentHere);
  console.log(playerWhite);

  console.log(`Player White: ${JSON.stringify(playerWhite)}`);
  console.log(`Player Red: ${JSON.stringify(playerRed)}`);
  return {
    you: playerRed,
    opponent: playerWhite,
  };
}

export function changeDetailsFlagStatus() {
  changeDetailsFlag = true;
  const storedObject = loadLocalStorage();
  sessionDisplayName = storedObject.displayName;
  sessionSkillLevel = storedObject.skillLevel;
  sessionLanguages = storedObject.languages;
  welcomeNameInput.classList.add('no_pointer_events');
  welcomeNameForm.classList.remove('focus_element');
  welcomeNameForm.classList.add('greyout');
}

function refreshPopulatePlayers() {
  console.log('refreshPopulatePlayers() is running');
  fetchRecentPlayers();
}

export function restartRefreshPopulatePlayers() {
  if (returnContinueInterval) {
    returnContinueInterval = setInterval(refreshPopulatePlayers, 10000);
  }
  if (continueInterval) {
    continueInterval = setInterval(refreshPopulatePlayers, 10000);
  }
}

// TODO - TEST TO SEE IF THIS WORKS
export function pauseRefreshPopulatePlayers() {
  console.log(
    `pauseRefreshPopulatePlayers() is running, auto update of players should be paused`
  );
  clearInterval(continueInterval);
  clearInterval(returnContinueInterval);
}

// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
