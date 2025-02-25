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
const challengeButton = document.querySelector('.challenge_button');

// Players section elements
const playersXButton = document.querySelector('.players_x_button');
const playersCurrentlyActive = document.querySelector('.players_active');
const availablePlayerToggleGraphic = document.querySelector(
  '.toggle_available_graphic'
);
const availablePlayersToggleButton = document.querySelector(
  '.toggle_available_graphic p'
);

const skillPlayersToggleGraphic = document.querySelector(
  '.toggle_skill_graphic'
);

const skillPlayersToggleButton = document.querySelector(
  '.toggle_skill_graphic p'
);

// Language section elements
const playersLanguageAccordion = document.getElementById(
  'players_language_accordion'
);
const playersLanguagePanel = playersLanguageAccordion.nextElementSibling;
const playersLanguageText = document.getElementById('players_language_text');
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
    if (welcomeName !== '') {
      if (welcomeName.length >= 3) {
        if (welcomeName.length > 12) {
          window.alert(
            `Please enter a display name of less than 13 characters`
          );
          return;
        } else {
          playerInfoName.textContent = welcomeName;
          // Adding display name to the user's storage object
          sessionDisplayName = welcomeName;
          step2Div.classList.add('reveal');
          return;
        }
      } else {
        window.alert(`Please enter a display name of at least 3 characters`);
        return;
      }
    } else {
      window.alert(`Please enter a display name to use in the game`);
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
  if (result === true) {
  } else {
    return;
  }
});

continueButtonReturn.addEventListener('click', () => {
  playClickSound();
  populatePlayersSectionData();

  const storedObject = storage.loadLocalStorage();
  const data = {
    displayName: storedObject.displayName,
    skillLevel: storedObject.skillLevel,
    languages: storedObject.languages,
    languagesChosen: languagesChosenReturn,
  };
  modals.changeModalContent('ConfirmName', data);

  returnSection.classList.remove('reveal');
  playersSection.classList.add('reveal');
  populatePlayerSectionLanguages(languagesChosenReturn);
});

// Welcome back return section event listeners
notYouButton.addEventListener('click', () => {
  storage.clearLocalStorage();
  window.location.reload();
});

// Players section event listeners
playersXButton.addEventListener('click', () => {
  playClickSound();
  const userConfirmed = window.confirm(
    `Would you like to return to enter your details again?`
  );
  if (userConfirmed) {
    setTimeout(() => {
      playersSection.classList.remove('reveal');
      storage.clearLocalStorage();
      welcomeSection.classList.add('reveal');
      playersLanguageText.textContent = `Select`;
    }, 60);
  } else {
    return;
  }
});

availablePlayersToggleButton.addEventListener('click', () => {
  playClickSound();
  // toggleOnlinePlayersOnly();
  toggleClass(availablePlayerToggleGraphic, 'toggled_right');
  toggleClass(availablePlayersToggleButton, 'toggled_right_button');
});

skillPlayersToggleButton.addEventListener('click', () => {
  playClickSound();
  // toggleFreePlayersOnly();
  toggleClass(skillPlayersToggleGraphic, 'toggled_right');
  toggleClass(skillPlayersToggleButton, 'toggled_right_button');
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
      console.log(`includes english`);
    }
    if (workingLanguages[i].includes('es')) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/spanish_flag.png"
              />`;
      console.log(`includes spanish`);
    }
    if (workingLanguages[i].includes('zh')) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/chinese_flag.png"
              />`;
      console.log(`includes chinese`);
    }
    if (workingLanguages[i].includes('ja')) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/japanese_flag.png"
              />`;
      console.log(`includes japanese`);
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
  console.log(`Session display name: ${sessionDisplayName}`);
  console.log(`Session skill level: ${sessionSkillLevel}`);
  console.log(`Session languages: ${sessionLanguages}`);
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
    window.alert(
      `Please make sure you have entered a name, chosen a skill level, and chosen at least one language`
    );
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
    console.log(`Character data detected`);
    console.log(JSON.stringify(storedObject));
    welcomeBackPopulateFields();
    return true;
  } else {
    console.log(`No character data detected`);
    return false;
  }
}

function welcomeBackPopulateFields() {
  const storedObject = storage.loadLocalStorage();
  playerInfoNameReturn.textContent = storedObject.displayName;
  playerInfoSkillReturn.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  console.log(languagesChosenReturn);
  addLanguageFlags(1);
}

export function populatePlayersSectionData() {
  const storedObject = storage.loadLocalStorage();
  playerInfoNameNext.textContent = storedObject.displayName;
  playerInfoSkillNext.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  console.log(languagesChosenReturn);
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
  console.log(languagesHTML);
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
        languageFilter = 'en';
        playersLanguageText.textContent = `Select`;
        closeAccordion(playersLanguagePanel, playersLanguageSvg);
        return;
      } else {
        languageItems.forEach((current2) => {
          current2.classList.remove('accordion_selected');
        });
        current.classList.add('accordion_selected');
        languageFilter = languageValue;

        playersLanguageText.textContent = languageName;
        closeAccordion(playersLanguagePanel, playersLanguageSvg);
        return;
      }
    });
  });
}

function populatePlayersCurrentlyActive() {
  console.log(`Populate players currently active div`);
}

// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
