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
import {
  setLocalStorage,
  loadLocalStorage,
  clearLocalStorage,
} from './localStorage.js';
import {
  registerForChat,
  fetchRecentPlayers,
  sendRPC,
  assignConn,
  defineOpponent,
  checkForName,
} from './chat.js';
import { startGameMessages, forfeitMessage } from './messages.js';

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
<p class="modal_section_button button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

const noNameHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select">Please enter a display name to use in the game</p>
              <p class="modal_section_button button center_modal_button no_select" title='Ok'>Ok</p>
                            </section>`;

const incompleteDataHTML = `<section class='modal_message_section'><p class="modal_section_text no_select">Please make sure you have entered a name, chosen a skill level, and chosen at least one language</p>
<p class="modal_section_button button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

const confirmNameHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select">Are you sure you want to be known as <u id='confirm_name_player_name'>${sessionDisplayName}</u>?</p>
              <div class='modal_section_buttons'>
              <p class="modal_section_button button no_select" title='Yes'>Yes</p>
              <p class="modal_section_button button_red button no_select" title="No">
                No
              </p>
              </div>
              </section>`;

const nameExistsHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select" id='name_exists_text'>Please choose a different name as NAME has already been taken</p>
<p class="modal_section_button button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

const goBackFromPlayersSectionHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select">Would you like to return to modify your details?</p>
              <div class='modal_section_buttons'>
              <p class="modal_section_button button no_select" title='Yes'>Yes</p>
              <p class="modal_section_button button_red button no_select" title="No">
                No
              </p>
              </div>
              </section>`;

const notYouHTML = `<section class='modal_message_section'><p class="modal_section_text big_margin_top no_select">Would you like to enter new player details?</p>
<div class='modal_section_buttons'>
<p class="modal_section_button button no_select" title='Yes'>Yes</p>
<p class="modal_section_button button_red button no_select" title="No">
  No
</p>
</div>
</section>`;

const challengeModalHTML = `<section class="modal_message_section">
            <div class="challenge_block">
              <p class="modal_section_text_big no_select">CHALLENGE SENT</p>
              <p class="modal_section_text no_select" id='challenge_opponent_name'></p>
              <p class="modal_section_text challenge_text no_select" id='challenge_message_text'>Waiting for a response...</p>
              <p class="modal_section_button button_red button center_modal_button no_margin_top no_select" title="Cancel Challenge">
                Cancel
              </p>
            </div>
          </section>`;

const challengeModalAcceptedHTML = `<section class="modal_message_section" style='background-color: lightgreen;'>
          <div class="challenge_block">
            <p class="modal_section_text_big no_select">CHALLENGE SENT</p>
            <p class="modal_section_text no_select" id='challenge_accepted_opponent_name'></p>
            <p class="modal_section_text no_select" id='challenge_accepted_message_text'>Waiting for a response...</p>
          </div>
        </section>`;

const challengeModalRejectedHTML = `<section class="modal_message_section">
            <div class="challenge_block">
              <p class="modal_section_text_big no_select">CHALLENGE SENT</p>
              <p class="modal_section_text no_select" id='challenge_rejected_opponent_name'></p>
              <p class="modal_section_text no_select" id='challenge_rejected_message_text'>Waiting for a response...</p>
              <p class="modal_section_button button_red center_modal_button button no_select">Ok</p>
            </div>
          </section>`;

const challengeReceivedModalHTML = `<section class="modal_message_section">
            <div class="challenge_received_block">
              <p class="modal_section_text_big no_select" id='challenge_received_message_text'>CHALLENGE RECEIVED</p>
              <p class="modal_section_text no_select" id='challenge_received_opponent_name'>
                {Other player} wants to play a game!
              </p>
              <div class="modal_section_buttons">
                <p
                  class="modal_section_button button no_select"
                  title="Cancel Challenge"
                >
                  Accept
                </p>
                <p
                  class="modal_section_button button_red button no_select"
                  title="Cancel Challenge"
                >
                  Decline
                </p>
              </div>
            </div>
          </section>`;

const noChallengerHTML = `<section class='modal_message_section'><p class="modal_section_text no_select">Please select a player to challenge, then press the challenge button, or, wait to be challenged!</p>
<p class="modal_section_button button center_modal_button no_select" title='Ok'>Ok</p>
              </section>`;

const forfeitModalHTML = `<section class="modal_message_section">
            <div class="forfeit_block">
              <p class="modal_section_text_big no_select">FORFEIT GAME?</p>
              <p class="modal_section_text no_select">
                Are you sure you want to forfeit the game?
              </p>
              <p class="modal_section_text_small no_select">
                You won't get any points for the game and it will be counted as
                a loss
              </p>
              <div class="modal_section_buttons">
                <p class="modal_section_button button no_select">Forfeit</p>
                <p class="modal_section_button button_red button no_select">Cancel</p>
              </div>
            </div>
          </section>`;

const forfeitNotificationModalHTML = `<section class="modal_message_section">
          <div class="forfeit_block">
            <p class="modal_section_text_big no_select">VICTORY!</p>
            <p class="modal_section_text no_select" id='forfeit_text'>
              Are you sure you want to forfeit the game?
            </p>
              <p class="modal_section_button button_red center_modal_button button no_select">Ok</p>
          </div>
        </section>`;

// TODO
// These might be better off using the modal_section tags as seen in the elements above, experiment
const youWinHTML = `<section class="modal_message_section">
        <div class="win_block">
          <p class="modal_section_text_big no_select">VICTORY!</p>
          <p class="modal_section_text no_select" id=win_text'>
            You win!
          </p>
          <p class="modal_section_text no_select" id='win_text2'>
            You win!
          </p>
            <p class="modal_section_button center_modal_button button no_select">Ok</p>
        </div>
      </section>`;

const youLoseHTML = `<section class="modal_message_section">
      <div class="lose_block">
        <p class="modal_section_text_big no_select">DEFEAT!</p>
        <p class="modal_section_text no_select" id='lose_text'>
          You lose!
        </p>
        <p class="modal_section_text no_select" id='lose_text2'>
          You lose!
        </p>
          <p class="modal_section_button button_red center_modal_button button no_select">Ok</p>
      </div>
    </section>`;

//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS

// Changes the HTML content of the modal element depending on the tag in the call to the function
// Called by various buttons on the webpage when a modal needs to be displayed
export async function changeModalContent(tag = 'challengeSent', data = '') {
  console.log(`DATA IS: ${JSON.stringify(data)}`);
  showModal();

  switch (tag) {
    case 'nameProblem':
      modalSection.innerHTML = nameLengthProblemHTML;
      modalSection.classList.add('reveal');

      const nameProblemYesButton = modalSection.querySelector(
        '.modal_section_button'
      );

      nameProblemYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

    case 'noName':
      modalSection.innerHTML = noNameHTML;
      modalSection.classList.add('reveal');

      const noNameYesButton = modalSection.querySelector(
        '.modal_section_button'
      );

      noNameYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

    case 'nameExists':
      modalSection.innerHTML = nameExistsHTML;
      modalSection.classList.add('reveal');

      const nameExistsYesButton = modalSection.querySelector(
        '.modal_section_button'
      );
      const nameText = document.getElementById('name_exists_text');

      nameText.textContent = `Please choose a different name as '${data}' has already been taken`;

      nameExistsYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

    case 'incompleteData':
      modalSection.innerHTML = incompleteDataHTML;
      modalSection.classList.add('reveal');

      const incompleteDataYesButton = modalSection.querySelector(
        '.modal_section_button'
      );

      incompleteDataYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

    case 'confirmName':
      sessionDisplayName = data.displayName;
      modalSection.innerHTML = confirmNameHTML;
      modalSection.classList.add('reveal');

      const modalName = document.getElementById('confirm_name_player_name');
      const confirmNameYesButton = modalSection.querySelector(
        '.modal_section_button'
      );
      const confirmNameNoButton = modalSection.querySelector('.button_red');

      modalName.textContent = sessionDisplayName;

      confirmNameYesButton.addEventListener('click', async () => {
        console.log(`LANGAUGES = ${data.languages}`);
        console.log(`PEERID = ${data.peerID}`);
        playClickSound();
        setLocalStorage({
          displayName: data.displayName,
          skillLevel: data.skillLevel,
          languages: data.languages,
          peerID: data.peerID,
        });

        let storageObject = loadLocalStorage();
        console.log(storageObject);
        console.log(storageObject.peerID);

        const result = await checkForName(storageObject.displayName);
        console.log(`RESULT IS: ${result}`);
        if (result === 0) {
          changeModalContent('nameExists', storageObject.displayName);
          return;
        } else {
          try {
            const userKey = await registerForChat(null, data);
            console.log(userKey);

            storageObject.userKey = userKey;
            console.log(JSON.stringify(storageObject));

            setLocalStorage({
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

    case 'returnConfirmName':
      sessionDisplayName = data.displayName;
      modalSection.innerHTML = confirmNameHTML;
      modalSection.classList.add('reveal');

      const returnModalName = document.getElementById(
        'confirm_name_player_name'
      );
      const returnConfirmNameYesButton = modalSection.querySelector(
        '.modal_section_button'
      );
      const returnConfirmNameNoButton =
        modalSection.querySelector('.button_red');

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

    case 'return':
      modalSection.innerHTML = goBackFromPlayersSectionHTML;
      modalSection.classList.add('reveal');

      const returnYesButton = modalSection.querySelector(
        '.modal_section_button'
      );
      const returnNoButton = modalSection.querySelector('.button_red');

      returnYesButton.addEventListener('click', () => {
        playClickSound();
        playersSection.classList.remove('reveal');
        welcomeSection.classList.add('reveal');
        clearLocalStorage();
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

    case 'notYou':
      modalSection.innerHTML = notYouHTML;
      modalSection.classList.add('reveal');

      const notYouYesButton = modalSection.querySelector(
        '.modal_section_button'
      );
      const notYouNoButton = modalSection.querySelector('.button_red');

      notYouYesButton.addEventListener('click', () => {
        playClickSound();
        clearLocalStorage();
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

    case 'challengeSent':
      cancelFlag = false;
      modalSection.innerHTML = challengeModalHTML;
      modalSection.classList.add('reveal');

      const buttonChallengeCancel = modalSection.querySelector('.button_red');
      const challengeInformation = document.getElementById(
        'challenge_message_text'
      );
      const challengerNameField = document.getElementById(
        'challenge_opponent_name'
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
        sendRPC('challengeSent', userKey);
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

    case 'challengeReceived':
      modalSection.innerHTML = challengeReceivedModalHTML;
      modalSection.classList.add('reveal');

      const challengeReceivedText = document.getElementById(
        'challenge_received_message_text'
      );
      const challengerNameText = document.getElementById(
        'challenge_received_opponent_name'
      );
      const acceptButton = modalSection.querySelector('.modal_section_button');
      const declineButton = modalSection.querySelector('.button_red');

      challengerNameText.textContent = `${data} wants to play a game!`;

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
          startGameMessages(activeOpponentHere.displayName);
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

    case 'challengeAccepted':
      modalSection.innerHTML = challengeModalAcceptedHTML;
      modalSection.style.backgroundColor = 'lightgreen';

      const challengeInformation2 = document.getElementById(
        'challenge_accepted_message_text'
      );
      const challengerNameField2 = document.getElementById(
        'challenge_accepted_opponent_name'
      );

      challengerNameField2.textContent = `Challenging ${data}`;
      challengeInformation2.textContent = `Challenge has been accepted!`;

      setTimeout(() => {
        playersSection.classList.remove('reveal');
        welcomeSection.classList.remove('reveal');
        returnSection.classList.remove('reveal');
        chatSection.classList.add('reveal');
        removeModal();
        startGameMessages(gamePlayers.opponent.displayName);
      }, 2000);
      break;

    case 'challengeRejected':
      modalSection.innerHTML = challengeModalRejectedHTML;

      const challengeInformation3 = document.getElementById(
        'challenge_rejected_message_text'
      );
      const challengerNameField3 = document.getElementById(
        'challenge_rejected_opponent_name'
      );
      const rejectedOkButton = modalSection.querySelector(
        '.modal_section_button'
      );

      challengerNameField3.textContent = `Challenging ${data}`;
      console.log(challengeInformation3);
      challengeInformation3.textContent = `Challenge has been rejected!`;

      rejectedOkButton.addEventListener('click', () => {
        playClickSound();
        console.log(`Challenge has been rejected.`);
        setTimeout(() => {
          removeModal();
          window.location.reload();
        }, 1000);
      });
      break;

    case 'noChallenger':
      modalSection.innerHTML = noChallengerHTML;
      modalSection.classList.add('reveal');

      const noChallengerYesButton = modalSection.querySelector(
        '.modal_section_button'
      );

      noChallengerYesButton.addEventListener('click', () => {
        playClickSound();
        setTimeout(() => {
          removeModal();
        }, 1000);
        return;
      });
      break;

    case 'forfeitGame':
      modalSection.innerHTML = forfeitModalHTML;
      modalSection.classList.add('reveal');

      const yesButton = modalSection.querySelector('.modal_section_button');
      const noButton = modalSection.querySelector('.button_red');

      yesButton.addEventListener('click', () => {
        playClickSound();
        console.log(`You have forfeited the game!`);
        forfeitMessage();
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

    case 'forfeitNotification':
      modalSection.innerHTML = forfeitNotificationModalHTML;
      modalSection.classList.add('reveal');

      const forfeitNotificationInformation =
        document.getElementById('forfeit_text');
      const okButton = modalSection.querySelector('.modal_section_button');

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

    case 'eventGameOverWin':
      console.log(`Game over event - WIN`);

      modalSection.innerHTML = youWinHTML;
      modalSection.classList.add('reveal');

      const youWinInformation = document.getElementById('win_text');
      const youWinInformation2 = document.getElementById('win_text2');
      const winOkButton = modalSection.querySelector('.modal_section_button');

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

      sendRPC('gameOver', gameWinResult);

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

    case 'eventGameOverLose':
      console.log(`Game over event - LOSE`);

      modalSection.innerHTML = youLoseHTML;
      modalSection.classList.add('reveal');
      const youLoseInformation = document.getElementById('lose_text');
      const youLoseInformation2 = document.getElementById('lose_text2');
      const loseOkButton = modalSection.querySelector('.modal_section_button');

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
    changeModalContent('forfeitGame');
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
