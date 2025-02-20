//////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Handles the DOM elements and logic for the welcome section of the webpage

"use strict";
console.log(`welcome.js running`);

//////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS

import { playClickSound } from "./script.js";
import * as storage from "./localStorage.js";

//////////////////////////////////////////////////////////////////////////////////////////
// DOM ELEMENT SELECTION

// Player name form elements
export const welcomeNameForm = document.querySelector(".welcome_name_form");
const welcomeNameInput = document.getElementById("welcome_name_input");

// Skill section elements
const skillLevelAccordion = document.getElementById("skill_level_accordion");
const skillLevelPanel = skillLevelAccordion.nextElementSibling;
const skillLevelText = document.getElementById("skill_level_text");
const skillLevelSvg = document.getElementById("skill_level_svg");

// Skill choice elements
const skillBeginner = document.querySelector(".skill_beginner");
const skillAdvanced = document.querySelector(".skill_advanced");
const skillMaster = document.querySelector(".skill_master");

// Language section elements
const languageAccordion = document.getElementById("language_accordion");
const languagePanel = languageAccordion.nextElementSibling;
const languageText = document.getElementById("language_text");
const languageSvg = document.getElementById("language_svg");

// Language choice elements
const languageChoices = document.querySelectorAll(".language_choice");

// You section elements
const playerInfoName = document.querySelector(".player_info_name");
const playerInfoSkill = document.querySelector(".player_info_skill");
const playerInfoFlags = document.getElementById("player_info_flags");

// Step elements
const step2Div = document.querySelector(".step2");
const step3Div = document.querySelector(".step3");
const step4Div = document.querySelector(".step4");

// Challenge button
const challengeButton = document.querySelector(".welcome_button_challenge");

// Step return elements
const playerInfoNameReturn = document.querySelector(".player_info_name_return");
const playerInfoSkillReturn = document.querySelector(
  ".player_info_skill_return"
);
const playerInfoFlagsReturn = document.getElementById(
  "player_info_flags_return"
);
const notYouButton = document.querySelector(".not_you_button");
const challengeButtonReturn = document.querySelector(
  ".welcome_button_challenge_return"
);

//////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES

// Language section variables
let languagesChosen = [];
let languagesChosenReturn = [];
const maxLanguages = 3;

let sessionDisplayName = "Guest";
let sessionSkillLevel = "Beginner";
let sessionLanguages = [];

//////////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS

// Player name form event listeners
welcomeNameForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    playClickSound();
    const welcomeName = welcomeNameInput.value;
    if (welcomeName !== "") {
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
          step2Div.classList.add("reveal");
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
skillLevelAccordion.addEventListener("click", function () {
  playClickSound();
  if (skillLevelPanel.style.display === "block") {
    skillLevelPanel.style.display = "none";
    skillLevelSvg.style.transform = "rotate(0deg)";
  } else {
    skillLevelPanel.style.display = "block";
    skillLevelSvg.style.transform = "rotate(180deg)";
  }
});

// Skill choice event listeners
skillBeginner.addEventListener("click", () => {
  playClickSound();
  skillBeginner.classList.add("accordion_selected");
  skillAdvanced.classList.remove("accordion_selected");
  skillMaster.classList.remove("accordion_selected");
  skillLevelText.textContent = "Beginner";
  playerInfoSkill.textContent = "BEGINNER";
  sessionSkillLevel = "Beginner";
  step3Div.classList.add("reveal");
  closeAccordion(skillLevelPanel, skillLevelSvg);
});

skillAdvanced.addEventListener("click", () => {
  playClickSound();
  skillAdvanced.classList.add("accordion_selected");
  skillBeginner.classList.remove("accordion_selected");
  skillMaster.classList.remove("accordion_selected");
  skillLevelText.textContent = "Advanced";
  playerInfoSkill.textContent = "ADVANCED";
  sessionSkillLevel = "Advanced";
  step3Div.classList.add("reveal");
  closeAccordion(skillLevelPanel, skillLevelSvg);
});

skillMaster.addEventListener("click", () => {
  playClickSound();
  skillMaster.classList.add("accordion_selected");
  skillBeginner.classList.remove("accordion_selected");
  skillAdvanced.classList.remove("accordion_selected");
  skillLevelText.textContent = "Master";
  playerInfoSkill.textContent = "MASTER";
  sessionSkillLevel = "Master";
  step3Div.classList.add("reveal");
  closeAccordion(skillLevelPanel, skillLevelSvg);
});

// Language section event listeners
languageAccordion.addEventListener("click", function () {
  playClickSound();
  if (languagePanel.style.display === "block") {
    languagePanel.style.display = "none";
    languageSvg.style.transform = "rotate(0deg)";
  } else {
    languagePanel.style.display = "block";
    languageSvg.style.transform = "rotate(180deg)";
  }
});

// Language choices event listeners
languageChoices.forEach((current) => {
  current.addEventListener("click", () => {
    playClickSound();

    const languageValue = current.dataset.language;

    if (current.classList.contains("accordion_selected")) {
      current.classList.remove("accordion_selected");
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
      current.classList.add("accordion_selected");
      languagesChosen.push(languageValue);
      threeLanguagesChosen();
      addLanguageFlags();
      return;
    }
  });
});

// Challenge button event listeners
challengeButton.addEventListener("click", () => {
  playClickSound();
  createUserData();
});

// Welcome back return section event listeners
notYouButton.addEventListener("click", () => {
  storage.clearLocalStorage();
  window.location.reload();
});

challengeButtonReturn.addEventListener("click", () => {
  playClickSound();
  // createUserData();
});

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// General accordion functions
// Closes the accordion specified and inverts its svg
function closeAccordion(accordionPanel, accordionSvg) {
  setTimeout(() => {
    accordionPanel.style.display = "none";
    accordionSvg.style.transform = "rotate(0deg)";
  }, 500);
}

// Language section functions
// Adds language flag images to the relevant section of the you section
function addLanguageFlags(flag = 0) {
  let flag1,
    flag2,
    flag3 = "<p></p>";
  let flags = [flag1, flag2, flag3];
  let workingLanguages;
  // Adding languages to the user storage object
  sessionLanguages = languagesChosen;
  if (flag === 0) {
    workingLanguages = languagesChosen;
  } else {
    workingLanguages = languagesChosenReturn;
  }
  for (let i = 0; i < workingLanguages.length; i++) {
    if (workingLanguages[i].includes("en")) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/english_flag.png"
              />`;
      console.log(`includes english`);
    }
    if (workingLanguages[i].includes("es")) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/spanish_flag.png"
              />`;
      console.log(`includes spanish`);
    }
    if (workingLanguages[i].includes("zh")) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/chinese_flag.png"
              />`;
      console.log(`includes chinese`);
    }
    if (workingLanguages[i].includes("ja")) {
      flags[i] = `<img
                class="player_flag_img"
                src="./images/flags/japanese_flag.png"
              />`;
      console.log(`includes japanese`);
    }
  }
  if (flag === 0) {
    playerInfoFlags.innerHTML = flags.join("");
    if (languagesChosen.length === 0) {
      languageText.textContent = `Select Language`;
      return;
    } else {
      step4Div.classList.add("reveal");
      languageText.innerHTML = flags.join("");
      return;
    }
  } else {
    playerInfoFlagsReturn.innerHTML = flags.join("");
  }
}

// Automatically closes the language choices accordion when three have been selected
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

function createUserData() {
  console.log(`Session display name: ${sessionDisplayName}`);
  console.log(`Session skill level: ${sessionSkillLevel}`);
  console.log(`Session languages: ${sessionLanguages}`);
  if (
    sessionDisplayName !== "" &&
    sessionDisplayName.length > 3 &&
    sessionDisplayName.length < 13 &&
    sessionSkillLevel !== "" &&
    sessionLanguages.length > 0
  ) {
    const userConfirmed = window.confirm(
      `Are you sure you want to be known as ${sessionDisplayName}?`
    );
    if (userConfirmed) {
      const storageData = storage.loadLocalStorage();
      console.log(`Storage data = ${JSON.stringify(storageData)}`);
      storage.setLocalStorage(
        sessionDisplayName,
        sessionSkillLevel,
        sessionLanguages
      );
      const updatedStorageData = storage.loadLocalStorage();
      console.log(
        `Updated storage data = ${JSON.stringify(updatedStorageData)}`
      );
      console.log(updatedStorageData.displayName);
      console.log(updatedStorageData.skillLevel);
      console.log(...updatedStorageData.languages);
      return;
    } else {
      return;
    }
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
    storedObject.displayName !== "" &&
    storedObject.displayName.length > 3 &&
    storedObject.displayName.length < 13 &&
    storedObject.skillLevel !== "" &&
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
  console.log(`Nothing`);
  const storedObject = storage.loadLocalStorage();
  playerInfoNameReturn.textContent = storedObject.displayName;
  playerInfoSkillReturn.textContent = storedObject.skillLevel;
  languagesChosenReturn = storedObject.languages;
  console.log(languagesChosenReturn);
  addLanguageFlags(1);
  // divReturn.classList.add("reveal");
}

// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
