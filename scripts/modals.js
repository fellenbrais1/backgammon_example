//////////////////////////////////////////////////////////////////////////////////////////
// CODE START

// NOTES
// Updates the HTML content of the modal element based on when it is called by changeModalContent()
'use strict';
console.log(`modals.js running`);

//////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS
import { playClickSound, adNotification } from './script.js';
import {
  populatePlayersSectionData,
  populatePlayerSectionLanguages,
  playersLanguageText,
  playerPairingUserChallenge,
  playerPairingChallengee,
  challengerName,
  activeOpponent,
} from './welcome.js';
import * as storage from './localStorage.js';
import {
  registerForChat,
  fetchRecentPlayers,
  sendRPC,
  assignConn,
} from './chat.js';
import * as messages from './messages.js';

//////////////////////////////////////////////////////////////////////////////////////////
// DOM ELEMENT SELECTION
const modalSection = document.querySelector('.modal_section');
const welcomeSection = document.querySelector('.welcome_section');
const returnSection = document.querySelector('.return_section');
const playersSection = document.querySelector('.players_section');
const chatSection = document.querySelector('.chat_section');

//////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES
let sessionDisplayName = '';
let cancelFlag = false;

export let gamePlayers;
let activeOpponentHere;

// HTML variables
const nameLengthProblemHTML = `<section class='modal_message_section'><p class="modal_section_message big_margin_top no_select">Please enter a display name between 3 and 12 characters long</p>
<p class="modal_section_button1 button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

const noNameHTML = `<section class='modal_message_section'><p class="modal_section_message big_margin_top no_select">Please enter a display name to use in the game</p>
              <p class="modal_section_button1 button center_modal_button no_select" title='Ok'>Ok</p>
                            </section>`;

const incompleteDataHTML = `<section class='modal_message_section'><p class="modal_section_message big_margin_top no_select">Please make sure you have entered a name, chosen a skill level, and chosen at least one language</p>
<p class="modal_section_button1 button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

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

const notYouHTML = `<section class='modal_message_section'><p class="modal_section_message no_select">Would you like to return to modify your details?</p>
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

const noChallengerHTML = `<section class='modal_message_section'><p class="modal_section_message big_margin_top no_select">Please select a player to challenge, then press the challenge button, or, wait to be challenged!</p>
<p class="modal_section_button1 button center_modal_button no_select" title='Ok'>Ok</p>
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

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// Changes the HTML content of the modal element depending on the tag in the call to the function
// Called by various buttons on the webpage when a modal needs to be displayed
export async function changeModalContent(tag = 'Challenge', data = '') {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  console.log(`DATA IS: ${JSON.stringify(data)}`);
  showModal();

  switch (tag) {
    case 'NameProblem':
      modalSection.innerHTML = nameLengthProblemHTML;
      modalSection.classList.add('reveal');
      const nameProblemYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );

      nameProblemYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

    case 'NoName':
      modalSection.innerHTML = noNameHTML;
      modalSection.classList.add('reveal');
      const noNameYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );

      noNameYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

    case 'IncompleteData':
      modalSection.innerHTML = incompleteDataHTML;
      modalSection.classList.add('reveal');
      const incompleteDataYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );

      incompleteDataYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

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

      confirmNameYesButton.addEventListener('click', async () => {
        console.log(`LANGAUGES = ${data.languages}`);
        console.log(`PEERID = ${data.peerID}`);
        playClickSound();
        storage.setLocalStorage({
          displayName: data.displayName,
          skillLevel: data.skillLevel,
          languages: data.languages,
          peerID: data.peerID,
        });

        let storageObject = storage.loadLocalStorage();
        console.log(storageObject);
        // populatePlayersSectionData();
        // populatePlayerSectionLanguages(data.languages);
        console.log(storageObject.peerID);

        try {
          const userKey = await registerForChat(null, data);
          console.log(userKey);

          storageObject.userKey = userKey;
          console.log(JSON.stringify(storageObject));

          storage.setLocalStorage({
            displayName: storageObject.displayName,
            skillLevel: storageObject.skillLevel,
            languages: storageObject.languages,
            peerID: storageObject.peerID,
            userKey: storageObject.userKey,
          });

          populatePlayersSectionData();
          populatePlayerSectionLanguages(data.languages);

          fetchRecentPlayers();
          setTimeout(() => {
            welcomeSection.classList.remove('reveal');
            playersSection.classList.add('reveal');
            removeModal();
          }, 1000);
          return;
        } catch (error) {
          console.error(`Error registering for chat:`, error);
          return;
        }
      });

      confirmNameNoButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
      });
      break;

    case 'ReturnConfirmName':
      sessionDisplayName = data.displayName;
      modalSection.innerHTML = confirmNameHTML;
      modalSection.classList.add('reveal');
      const returnModalName = modalSection.querySelector('.modal_name');
      const returnConfirmNameYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );
      const returnConfirmNameNoButton = modalSection.querySelector(
        '.modal_section_button2'
      );
      returnModalName.textContent = sessionDisplayName;

      returnConfirmNameYesButton.addEventListener('click', async () => {
        playClickSound();
        populatePlayersSectionData();
        populatePlayerSectionLanguages(data.languages);
        console.log(JSON.stringify(data));

        try {
          await registerForChat(data.userKey, data);

          fetchRecentPlayers();
          setTimeout(() => {
            welcomeSection.classList.remove('reveal');
            playersSection.classList.add('reveal');
            removeModal();
          }, 1000);
          return;
        } catch (error) {
          console.error(`Error registering for chat:`, error);
          return;
        }
      });

      returnConfirmNameNoButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
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
        playersSection.classList.remove('reveal');
        welcomeSection.classList.add('reveal');
        storage.clearLocalStorage();
        playersLanguageText.textContent = `Select`;
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });

      returnNoButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });

      break;

    case 'NotYou':
      modalSection.innerHTML = notYouHTML;
      modalSection.classList.add('reveal');
      const notYouYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );
      const notYouNoButton = modalSection.querySelector(
        '.modal_section_button2'
      );

      notYouYesButton.addEventListener('click', () => {
        playClickSound();
        storage.clearLocalStorage();
        setTimeout(() => {
          removeModal();
          window.location.reload();
        }, 1000);
        return;
      });

      notYouNoButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });

      break;

    case 'Challenge':
      cancelFlag = false;
      modalSection.innerHTML = challengeModalHTML;
      modalSection.classList.add('reveal');
      const buttonChallengeCancel = modalSection.querySelector(
        '.challenge_button_cancel'
      );
      const challengeInformation =
        modalSection.querySelector('.challenge_text');
      const challengerNameField = document.querySelector(
        '.challenge_text_names'
      );
      challengerNameField.textContent = `Challenging ${data}`;

      buttonChallengeCancel.addEventListener('click', () => {
        playClickSound();
        cancelFlag = true;
        challengeInformation.textContent = 'Cancelling challenge...';
        setTimeout(() => {
          removeModal();
        }, 1000);
      });

      gamePlayers = await playerPairingUserChallenge();
      console.log(JSON.stringify(gamePlayers));
      activeOpponentHere = gamePlayers.opponent;
      // console.log(conn);
      const conn = await assignConn(gamePlayers.opponent);
      console.log(JSON.stringify(gamePlayers.opponent));
      // console.log(conn);
      if (conn !== null) {
        console.log(conn);
        cancelFlag = true;
        delay(5000);
        console.log(gamePlayers.you);
        const userKey = gamePlayers.you.userKey;
        console.log(userKey);
        sendRPC('challenge', userKey);
        // sendRPC('chat', 'Hello');
        // TODO - CHANGE HERE
        // Code should 'hold' until a challenge confirmation message has been sent by the opponent, then a sendRPC message will be received, which calls this function with the case 'ChallengeAccepted'
        break;
      }

      // Code to automatically cancel the challenge modal after 20 seconds
      if (cancelFlag === false) {
        setTimeout(() => {
          console.log(
            `20 seconds have passed without challenge response, cancelling.`
          );
          playClickSound();
          challengeInformation.textContent = 'Cancelling challenge...';
          setTimeout(() => {
            // modalSection.classList.remove('reveal');
            removeModal();
          }, 1000);
        }, 20000);
        break;
      }

    case 'ChallengeReceived':
      modalSection.innerHTML = challengeReceivedModalHTML;
      modalSection.classList.add('reveal');
      const challengeReceivedText = modalSection.querySelector(
        '.challenge_received_text_big'
      );
      const challengerNameText = document.querySelector(
        '.challenge_received_text'
      );
      challengerNameText.textContent = `${data} wants to play a game!`;
      const acceptButton = modalSection.querySelector(
        '.challenge_received_button_accept'
      );
      const declineButton = modalSection.querySelector(
        '.challenge_received_button_decline'
      );

      acceptButton.addEventListener('click', async () => {
        activeOpponentHere = activeOpponent;
        playClickSound();
        challengeReceivedText.textContent = `You have accepted this challenge!`;
        sendRPC('challengeAccepted', '');
        gamePlayers = await playerPairingChallengee(activeOpponentHere);
        console.log(JSON.stringify(gamePlayers));
        // setTimeout(() => {
        //   removeModal();
        // }, 1000);
        // FOR TESTING
        setTimeout(() => {
          playersSection.classList.remove('reveal');
          welcomeSection.classList.remove('reveal');
          returnSection.classList.remove('reveal');
          chatSection.classList.add('reveal');
          removeModal();
          messages.startGameMessages(gamePlayers.opponent.displayName);
        }, 1000);
        // playerPairingOpponentChallenge();
      });

      declineButton.addEventListener('click', () => {
        playClickSound();
        challengeReceivedText.textContent = `You have rejected this challenge!`;
        sendRPC('challengeRejected', '');
        setTimeout(() => {
          removeModal();
        }, 1000);
      });
      break;

    case 'ChallengeAccepted':
      const modalChallengeSection =
        document.querySelector('.challenge_section');
      modalChallengeSection.style.backgroundColor = 'lightgreen';
      challengeInformation.textContent = `Challenge has been accepted by ${gamePlayers.opponent.displayName}!`;
      setTimeout(() => {
        playersSection.classList.remove('reveal');
        welcomeSection.classList.remove('reveal');
        returnSection.classList.remove('reveal');
        chatSection.classList.add('reveal');
        removeModal();
        messages.startGameMessages(gamePlayers.opponent.displayName);
      }, 1000);

    case 'ChallengeRejected':
      const modalChallengeSection2 =
        document.querySelector('.challenge_section');
      modalChallengeSection2.style.backgroundColor = 'red';
      challengeInformation.textContent = `Challenge has been rejected!`;
      setTimeout(() => {
        removeModal();
      }, 1000);

    case 'NoChallenger':
      modalSection.innerHTML = noChallengerHTML;
      modalSection.classList.add('reveal');
      const noChallengerYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );

      noChallengerYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

    case 'ForfeitRequest':
      modalSection.classList.remove('reveal');
      modalSection.innerHTML = forfeitModalHTML;
      modalSection.classList.add('reveal');
      const yesButton = modalSection.querySelector('.forfeit_button_yes');
      const noButton = modalSection.querySelector('.forfeit_button_no');

      yesButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You have forfeited the game!`);
        setTimeout(() => {
          removeModal();
        }, 1000);
      });

      noButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You have NOT forfeited the game!`);
        setTimeout(() => {
          removeModal();
        }, 1000);
      });
      break;
  }
}

// Shows the modal element
// Called by changeModalContent()
function showModal() {
  modalSection.style.display = 'block';
  modalSection.innerHTML = '';
  adNotification.classList.add('blur_element');
}

// Hides the modal element
// Called by changeModalContent()
function removeModal() {
  modalSection.classList.remove('reveal');
  modalSection.style.display = 'none';
  adNotification.classList.remove('blur_element');
}

// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
