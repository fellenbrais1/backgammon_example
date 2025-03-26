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
  activeOpponent,
} from './welcome.js';
import * as storage from './localStorage.js';
import {
  registerForChat,
  fetchRecentPlayers,
  sendRPC,
  assignConn,
  defineOpponent,
  checkForName,
} from './chat.js';
import * as messages from './messages.js';

//////////////////////////////////////////////////////////////////////////////////////////
// DOM ELEMENT SELECTION

const modalSection = document.querySelector('.modal_section');
const welcomeSection = document.querySelector('.welcome_section');
const returnSection = document.querySelector('.return_section');
const playersSection = document.querySelector('.players_section');
const chatSection = document.querySelector('.chat_section');

const settingsSection = document.querySelector('.settings_section');
const settingsXButton = document.querySelector('.settings_x_button');
const rulesSection = document.querySelector('.rules_section');
const rulesXButton = document.querySelector('.rules_x_button');
const otherGamesSection = document.querySelector('.other_games_section');
const otherGamesXButton = document.querySelector('.other_games_x_button');
const otherGamesDisplay = document.querySelector('.other_games_display');

//////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES

let sessionDisplayName = '';
let cancelFlag = false;

export let gamePlayers;
let activeOpponentHere;

let otherGamesPopulatedFlag = false;
let otherGamesBackgammonButton;
let otherGamesMurderMansionButton;
const currentGameFlag = 'Backgammon';

const otherGamesBackgammonButtonHTML = `<div class="game_button_backgammon" title="Backgammon">
    <img src="../images/MOMABackgammon.png" alt="Backgammon game picture" />
    <p>Backgammon</p>
  </div>`;

const otherGamesMurderMansionButtonHTML = `<div class="game_button_murder_mansion" title="Murder Mansion">
  <img src="../images/murderMansion.jpg" alt="Murder Mansion game picture" />
  <p>Murder Mansion</p>
</div>`;

const otherGamesHTML = [
  otherGamesBackgammonButtonHTML,
  otherGamesMurderMansionButtonHTML,
];

// HTML variables
const nameLengthProblemHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select">Please enter a display name between 3 and 12 characters long</p>
<p class="modal_section_button1 button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

const noNameHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select">Please enter a display name to use in the game</p>
              <p class="modal_section_button1 button center_modal_button no_select" title='Ok'>Ok</p>
                            </section>`;

const incompleteDataHTML = `<section class='modal_message_section'><p class="modal_section_text no_select">Please make sure you have entered a name, chosen a skill level, and chosen at least one language</p>
<p class="modal_section_button1 button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

const confirmNameHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select">Are you sure you want to be known as <u class='modal_name'>${sessionDisplayName}</u>?</p>
              <div class='modal_section_buttons'>
              <p class="modal_section_button1 button no_select" title='Yes'>Yes</p>
              <p class="modal_section_button2 button no_select" title="No">
                No
              </p>
              </div>
              </section>`;

const nameExistsHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select">Please choose a different name as NAME has already been taken</p>
<p class="modal_section_button1 button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

const goBackFromPlayersSectionHTML = `<section class='modal_message_section'><p class="modal_section_text no_select">Would you like to return to modify your details?</p>
              <div class='modal_section_buttons'>
              <p class="modal_section_button1 button no_select" title='Yes'>Yes</p>
              <p class="modal_section_button2 button no_select" title="No">
                No
              </p>
              </div>
              </section>`;

const notYouHTML = `<section class='modal_message_section'><p class="modal_section_text no_select">Would you like to enter new player details?</p>
<div class='modal_section_buttons'>
<p class="modal_section_button1 button no_select" title='Yes'>Yes</p>
<p class="modal_section_button2 button no_select" title="No">
  No
</p>
</div>
</section>`;

const challengeModalHTML = `<section class="modal_message_section">
            <div class="challenge_block">
              <p class="challenge_text_big no_select">CHALLENGE SENT</p>
              <p class="challenge_text_names no_select"></p>
              <p class="challenge_text no_select">Waiting for a response...</p>
              <p class="challenge_button_cancel button no_select" title="Cancel Challenge">
                Cancel
              </p>
            </div>
          </section>`;

const challengeModalAcceptedHTML = `<section class="modal_message_section" style='background-color: lightgreen;'>
          <div class="challenge_block">
            <p class="challenge_text_big no_select">CHALLENGE SENT</p>
            <p class="challenge_text_names no_select"></p>
            <p class="challenge_text no_select">Waiting for a response...</p>
          </div>
        </section>`;

const challengeModalRejectedHTML = `<section class="modal_message_section">
            <div class="challenge_block">
              <p class="challenge_text_big no_select">CHALLENGE SENT</p>
              <p class="challenge_text_names no_select"></p>
              <p class="challenge_text no_select">Waiting for a response...</p>
            </div>
          </section>`;

const challengeReceivedModalHTML = `<section class="modal_message_section">
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

const noChallengerHTML = `<section class='modal_message_section'><p class="modal_section_text no_select">Please select a player to challenge, then press the challenge button, or, wait to be challenged!</p>
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

const forfeitNotificationModalHTML = `<section class="modal_message_section">
          <div class="forfeit_block">
            <p class="forfeit_text_big no_select">VICTORY!</p>
            <p class="forfeit_text no_select">
              Are you sure you want to forfeit the game?
            </p>
              <p class="forfeit_button_ok button no_select">Ok</p>
          </div>
        </section>`;

// TODO
// These might be better off using the modal_section tags as seen in the elements above, experiment
const youWinHTML = `<section class="win_section">
        <div class="win_block">
          <p class="win_text_big no_select">VICTORY!</p>
          <p class="win_text no_select">
            You win!
          </p>
          <p class="win_text2 no_select">
            You win!
          </p>
            <p class="win_button_ok button no_select">Ok</p>
        </div>
      </section>`;

const youLoseHTML = `<section class="lose_section">
      <div class="lose_block">
        <p class="lose_text_big no_select">VICTORY!</p>
        <p class="lose_text no_select">
          You lose!
        </p>
        <p class="lose_text2 no_select">
          You lose!
        </p>
          <p class="lose_button_ok button no_select">Ok</p>
      </div>
    </section>`;

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// Changes the HTML content of the modal element depending on the tag in the call to the function
// Called by various buttons on the webpage when a modal needs to be displayed
export async function changeModalContent(tag = 'Challenge', data = '') {
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

    case 'NameExists':
      modalSection.innerHTML = nameExistsHTML;
      modalSection.classList.add('reveal');
      const nameExistsYesButton = modalSection.querySelector(
        '.modal_section_button1'
      );
      const nameText = modalSection.querySelector('.modal_section_text');
      nameText.textContent = `Please choose a different name as '${data}' has already been taken`;

      nameExistsYesButton.addEventListener('click', () => {
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
        console.log(storageObject.peerID);

        const result = await checkForName(storageObject.displayName);
        console.log(`RESULT IS: ${result}`);
        if (result === 0) {
          changeModalContent('NameExists', storageObject.displayName);
          return;
        } else {
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

    case 'ChallengeSent':
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
      const conn = await assignConn(gamePlayers.opponent);
      console.log(JSON.stringify(gamePlayers.opponent));
      if (conn !== null) {
        console.log(conn);
        cancelFlag = true;
        console.log(gamePlayers.you);
        const userKey = gamePlayers.you.userKey;
        console.log(userKey);
        sendRPC('challenge', userKey);
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

      const opponentName = data;

      acceptButton.addEventListener('click', async () => {
        activeOpponentHere = activeOpponent;
        playClickSound();
        challengeReceivedText.textContent = `You have accepted this challenge!`;
        sendRPC('challengeAccepted', '');

        activeOpponentHere = await defineOpponent(opponentName);

        gamePlayers = await playerPairingChallengee(activeOpponentHere);
        console.log(activeOpponentHere);
        console.log(JSON.stringify(gamePlayers));

        setTimeout(() => {
          playersSection.classList.remove('reveal');
          welcomeSection.classList.remove('reveal');
          returnSection.classList.remove('reveal');
          chatSection.classList.add('reveal');
          removeModal();
          messages.startGameMessages(activeOpponentHere.displayName);
        }, 3000);
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
      modalSection.innerHTML = challengeModalAcceptedHTML;
      modalSection.style.backgroundColor = 'lightgreen';
      const challengeInformation2 =
        modalSection.querySelector('.challenge_text');
      const challengerNameField2 = document.querySelector(
        '.challenge_text_names'
      );
      challengerNameField2.textContent = `Challenging ${data}`;
      challengeInformation2.textContent = `Challenge has been accepted!`;

      setTimeout(() => {
        playersSection.classList.remove('reveal');
        welcomeSection.classList.remove('reveal');
        returnSection.classList.remove('reveal');
        chatSection.classList.add('reveal');
        removeModal();
        messages.startGameMessages(gamePlayers.opponent.displayName);
      }, 2000);
      break;

    case 'ChallengeRejected':
      modalSection.innerHTML = challengeModalRejectedHTML;
      const challengeInformation3 =
        modalSection.querySelector('.challenge_text');
      const challengerNameField3 = document.querySelector(
        '.challenge_text_names'
      );
      challengerNameField3.textContent = `Challenging ${data}`;
      console.log(challengeInformation3);
      console.log(challengeInformation3);
      challengeInformation3.textContent = `Challenge has been rejected!`;
      setTimeout(() => {
        removeModal();
      }, 2000);
      break;

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

    case 'ForfeitGame':
      modalSection.innerHTML = forfeitModalHTML;
      modalSection.classList.add('reveal');
      const yesButton = modalSection.querySelector('.forfeit_button_yes');
      const noButton = modalSection.querySelector('.forfeit_button_no');

      yesButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You have forfeited the game!`);
        messages.forfeitMessage();
        sendRPC('forfeitGame', sessionDisplayName);
        removeModal();
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      });

      noButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You have NOT forfeited the game!`);
        setTimeout(() => {
          removeModal();
        }, 1000);
      });
      break;

    case 'ForfeitNotification':
      modalSection.innerHTML = forfeitNotificationModalHTML;
      modalSection.classList.add('reveal');
      const forfeitNotificationInformation =
        modalSection.querySelector('.forfeit_text');
      const okButton = modalSection.querySelector('.forfeit_button_ok');

      forfeitNotificationInformation.textContent = `${data} has forfeited the game! You win!`;

      okButton.addEventListener('click', () => {
        playClickSound();
        console.log(`${data} has forfeited the game! You win!`);
        setTimeout(() => {
          removeModal();
          window.location.reload();
        }, 1000);
      });
      break;

    case 'EventGameOverWin':
      console.log(`Game over event - WIN`);

      modalSection.innerHTML = youWinHTML;
      modalSection.classList.add('reveal');
      const youWinInformation = modalSection.querySelector('.win_text');
      const youWinInformation2 = modalSection.querySelector('.win_text2');
      const winOkButton = modalSection.querySelector('.win_button_ok');

      console.log(`DATA is: ${data}`);

      let gameWinResult = '';

      switch (data) {
        case 'win':
          gameWinResult = '!';
          break;
        case 'gammon':
          gameWinResult = ' with a Gammon!';
          break;
        case 'backgammon':
          gameWinResult = ' with a Backgammon!';
          break;
      }

      sendRPC('eventGameOverLose', gameWinResult);

      youWinInformation.textContent = `You have won the game${gameWinResult}`;
      youWinInformation2.textContent = `Congratulations!`;

      winOkButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You win!`);
        setTimeout(() => {
          removeModal();
          window.location.reload();
        }, 1000);
      });
      break;

    case 'EventGameOverLose':
      console.log(`Game over event - LOSE`);

      modalSection.innerHTML = youLoseHTML;
      modalSection.classList.add('reveal');
      const youLoseInformation = modalSection.querySelector('.lose_text');
      const youLoseInformation2 = modalSection.querySelector('.lose_text2');
      const loseOkButton = modalSection.querySelector('.lose_button_ok');

      youLoseInformation.textContent = `${data[1]} has won the game${data[0]}`;
      youLoseInformation2.textContent = `Better luck next time!`;

      loseOkButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You lose!`);
        setTimeout(() => {
          removeModal();
          window.location.reload();
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

function addChatButtons() {
  const endTurnButton = document.querySelector('.end_turn_button');
  const rulesButton = document.querySelector('.rules_button');
  const settingsButton = document.querySelector('.settings_button');
  const gamesButton = document.querySelector('.games_button');
  const forfeitGameButton = document.querySelector('.forfeit_game_button');

  rulesButton.addEventListener('click', () => {
    console.log(`Rules flow`);
    playClickSound();
    setTimeout(() => {
      rulesSection.classList.add('reveal');
      chatSection.classList.remove('reveal');
    }, 500);
  });
  endTurnButton.addEventListener('click', () => {
    console.log(`End turn flow`);
  });
  settingsButton.addEventListener('click', () => {
    console.log(`Settings flow`);
    playClickSound();
    setTimeout(() => {
      settingsSection.classList.add('reveal');
      chatSection.classList.remove('reveal');
    }, 500);
  });
  gamesButton.addEventListener('click', () => {
    console.log(`Games flow`);
    playClickSound();
    setTimeout(() => {
      otherGamesSection.classList.add('reveal');
      chatSection.classList.remove('reveal');
      populateOtherGames(otherGamesHTML);
      addCurrentGameClass(currentGameFlag);
      otherGamesPopulatedFlag = true;
    }, 500);
  });
  forfeitGameButton.addEventListener('click', async () => {
    console.log(`Forfeit game flow`);
    console.log(activeOpponentHere.displayName);
    changeModalContent('ForfeitGame');
    return;
  });
}

rulesXButton.addEventListener('click', () => {
  playClickSound();
  setTimeout(() => {
    rulesSection.classList.remove('reveal');
    chatSection.classList.add('reveal');
  }, 500);
});

settingsXButton.addEventListener('click', () => {
  playClickSound();
  setTimeout(() => {
    settingsSection.classList.remove('reveal');
    chatSection.classList.add('reveal');
  }, 500);
});

otherGamesXButton.addEventListener('click', () => {
  playClickSound();
  setTimeout(() => {
    otherGamesSection.classList.remove('reveal');
    chatSection.classList.add('reveal');
  }, 500);
});

function populateOtherGames(otherGamesHTML) {
  if (otherGamesPopulatedFlag === false) {
    let fullHTML = '';
    otherGamesHTML.forEach((current) => {
      fullHTML += current;
    });
    otherGamesDisplay.insertAdjacentHTML('beforeend', fullHTML);
    otherGamesBackgammonButton = document.querySelector(
      '.game_button_backgammon'
    );
    otherGamesMurderMansionButton = document.querySelector(
      '.game_button_murder_mansion'
    );
  }
}

function addCurrentGameClass(currentGameFlag) {
  if (otherGamesPopulatedFlag === false) {
    switch (currentGameFlag) {
      case 'Backgammon':
        otherGamesBackgammonButton.classList.toggle('game_button_current');
        break;
      case 'Murder Mansion':
        otherGamesMurderMansionButton.classList.toggle('game_button_current');
        break;
    }
  }
}

addChatButtons();
// CODE END
//////////////////////////////////////////////////////////////////////////////////////////
