// CODE START

'use strict';

import { playClickSound } from './script.js';
import {
  populatePlayersSectionData,
  populatePlayerSectionLanguages,
  playersLanguageText,
} from './welcome.js';
import * as storage from './localStorage.js';

const modalSection = document.querySelector('.modal_section');
const welcomeSection = document.querySelector('.welcome_section');

const playersSection = document.querySelector('.players_section');

const playerInfoNameNext = document.querySelector('.player_info_name_next');
const playerInfoSkillNext = document.querySelector('.player_info_skill_next');
const playerInfoFlagsNext = document.getElementById('player_info_flags_next');

let sessionDisplayName = '';

const confirmNameHTML = `<section class='modal_message_section'><p class="modal_section_message no_select">Are you sure you want to be known as <u class='modal_name'>${sessionDisplayName}</u>?</p>
              <div class='modal_section_buttons'>
              <p class="modal_section_button1 button no_select" title='Yes'>Yes</p>
              <p class="modal_section_button2 button no_select" title="No">
                No
              </p>
              </div>
              </section>`;

const goBackFromPlayersSectionHTML = `<section class='modal_message_section'><p class="modal_section_message no_select">Would you like to return to modify your details?</p>
              <div class='modal_section_buttons'>
              <p class="modal_section_button1 button no_select" title='Yes'>Yes</p>
              <p class="modal_section_button2 button no_select" title="No">
                No
              </p>
              </div>
              </section>`;

const challengeModalHTML = `<section class="challenge_section">
            <div class="challenge_block">
              <p class="challenge_text_big no_select">CHALLENGE SENT</p>
              <p class="challenge_text_names no_select"></p>
              <p class="challenge_text no_select">Waiting for a response...</p>
              <p class="challenge_button_cancel button no_select" title="Cancel Challenge">
                Cancel
              </p>
            </div>
          </section>`;

const challengeReceivedModalHTML = `<section class="challenge_received_section">
            <div class="challenge_received_block">
              <p class="challenge_received_text_big no_select">CHALLENGE RECEIVED</p>
              <p class="challenge_received_text no_select">
                {Other player} wants to play a game!
              </p>
              <div class="challenge_received_button_div">
                <p
                  class="challenge_received_button_accept button no_select"
                  title="Cancel Challenge"
                >
                  Accept
                </p>
                <p
                  class="challenge_received_button_decline button no_select"
                  title="Cancel Challenge"
                >
                  Decline
                </p>
              </div>
            </div>
          </section>`;

const forfeitModalHTML = `<section class="forfeit_section">
            <div class="forfeit_block">
              <p class="forfeit_text_big no_select">FORFEIT GAME?</p>
              <p class="forfeit_text no_select">
                Are you sure you want to forfeit the game?
              </p>
              <p class="forfeit_text_small no_select">
                You won't get any points for the game and it will be counted as
                a loss
              </p>
              <div class="forfeit_button_div">
                <p class="forfeit_button_yes button no_select">Forfeit</p>
                <p class="forfeit_button_no button no_select">Cancel</p>
              </div>
            </div>
          </section>`;

export function changeModalContent(tag = 'Challenge', data = '') {
  showModal();

  switch (tag) {
    case 'ConfirmName':
      sessionDisplayName = data.displayName;
      modalSection.innerHTML = confirmNameHTML;
      modalSection.classList.add('reveal');

      const modalName = modalSection.querySelector('.modal_name');
      const confirmNameYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );
      const confirmNameNoButton = modalSection.querySelector(
        '.modal_section_button2'
      );

      modalName.textContent = sessionDisplayName;
      console.log(modalSection.innerHTML);
      console.log(modalSection);

      confirmNameYesButton.addEventListener('click', () => {
        playClickSound();
        console.log(`Known as ${sessionDisplayName}`);
        const storageData = storage.loadLocalStorage();
        console.log(`Storage data = ${JSON.stringify(storageData)}`);
        storage.setLocalStorage(
          data.displayName,
          data.skillLevel,
          data.languages
        );
        const updatedStorageData = storage.loadLocalStorage();
        console.log(
          `Updated storage data = ${JSON.stringify(updatedStorageData)}`
        );
        console.log(updatedStorageData.displayName);
        console.log(updatedStorageData.skillLevel);
        console.log(...updatedStorageData.languages);
        populatePlayersSectionData();
        welcomeSection.classList.remove('reveal');
        playersSection.classList.add('reveal');
        populatePlayerSectionLanguages(data.languagesChosen);
        setTimeout(() => {
          removeModal();
        }, 2000);
        return;
      });

      confirmNameNoButton.addEventListener('click', () => {
        playClickSound();
        console.log(`NOT known as ${sessionDisplayName}`);
        setTimeout(() => {
          removeModal();
        }, 2000);
      });

      break;

    case 'Return':
      modalSection.innerHTML = goBackFromPlayersSectionHTML;
      modalSection.classList.add('reveal');

      const returnYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );
      const returnNoButton = modalSection.querySelector(
        '.modal_section_button2'
      );

      returnYesButton.addEventListener('click', () => {
        playClickSound();
        console.log(`Returning to the welcome section`);
        playersSection.classList.remove('reveal');
        welcomeSection.classList.add('reveal');
        storage.clearLocalStorage();
        playersLanguageText.textContent = `Select`;
        setTimeout(() => {
          removeModal();
        }, 2000);
        return;
      });

      returnNoButton.addEventListener('click', () => {
        playClickSound();
        console.log(`NOT returning to the welcome section`);
        setTimeout(() => {
          removeModal();
        }, 2000);
        return;
      });

      break;

    case 'Challenge':
      modalSection.innerHTML = challengeModalHTML;
      modalSection.classList.add('reveal');

      const buttonChallengeCancel = modalSection.querySelector(
        '.challenge_button_cancel'
      );
      const challengeInformation =
        modalSection.querySelector('.challenge_text');

      console.log(modalSection.innerHTML);
      console.log(modalSection);

      buttonChallengeCancel.addEventListener('click', () => {
        playClickSound();
        challengeInformation.textContent = 'Cancelling challenge...';
        setTimeout(() => {
          removeModal();
        }, 2000);
      });

      break;

    case 'ChallengeReceived':
      modalSection.innerHTML = challengeReceivedModalHTML;
      modalSection.classList.add('reveal');

      const acceptButton = modalSection.querySelector(
        '.challenge_received_button_accept'
      );
      const declineButton = modalSection.querySelector(
        '.challenge_received_button_decline'
      );

      console.log(modalSection.innerHTML);
      console.log(modalSection);

      acceptButton.addEventListener('click', () => {
        playClickSound();
        console.log(`Challenge request accepted!`);
        removeModal();
      });

      declineButton.addEventListener('click', () => {
        playClickSound();
        console.log(`Challenge request rejected!`);
        removeModal();
      });

      break;

    case 'ForfeitRequest':
      modalSection.classList.remove('reveal');
      modalSection.innerHTML = forfeitModalHTML;
      modalSection.classList.add('reveal');

      const yesButton = modalSection.querySelector('.forfeit_button_yes');
      const noButton = modalSection.querySelector('.forfeit_button_no');

      console.log(modalSection.innerHTML);
      console.log(modalSection);

      yesButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You have forfeited the game!`);
        removeModal();
      });

      noButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You have NOT forfeited the game!`);
        removeModal();
      });

      break;
  }
}

function showModal() {
  modalSection.style.display = 'block';
  modalSection.innerHTML = '';
}

function removeModal() {
  modalSection.classList.remove('reveal');
  modalSection.style.display = 'none';
}
