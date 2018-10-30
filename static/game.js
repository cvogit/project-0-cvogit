var socket = io();

socket.on('message', function(data) {
  console.log(data);
});

/******************
 * Images
 * 
 */
let EMPTY             = '/static/images/empty.png';
let UNKNOWN           = '/static/images/unknown.png';

let ALPHA_WEREWOLF    = '/static/images/alpha_werewolf.png';
let ASSASSIN          = '/static/images/assassin.png';
let WEREWOLF          = '/static/images/werewolf.png';
let SEER              = '/static/images/seer.png';
let TANNER            = '/static/images/tanner.png';

let selfSlot  = 0;
let votePermission = false;
let joinPermission = true;

/**
 * Game chat box
 */
let gameChat = [];

/******************
 * Messages from server to general socket
 * 
 */

/**
 * Update the portraits with a general update
 */
socket.on('game-state-update', function(portrait_1, portrait_2, portrait_3, portrait_4, portrait_5) {
  document.getElementById('player-1-img').src = '/static/images/' + portrait_1 + '.png';
  document.getElementById('player-2-img').src = '/static/images/' + portrait_2 + '.png';
  document.getElementById('player-3-img').src = '/static/images/' + portrait_3 + '.png';
  document.getElementById('player-4-img').src = '/static/images/' + portrait_4 + '.png';
  document.getElementById('player-5-img').src = '/static/images/' + portrait_5 + '.png';
});

/**
 * Update the game queue
 */
socket.on('game-inprogress', function(data) {
  let joinBtn = document.getElementById('join-game');
  joinBtn.innerHTML = 'Inprogress';
  joinPermission = false;

  // change music
  // let audio = document.getElementById('main-audio');
  // audio.src = '/static/audio/music_2.mp';
});

/**
 * Update the game queue
 */
socket.on('queue-state-update', function(data) {
  let queueNum = document.getElementById('queue-num');
  queueNum.innerHTML = data;
});

/**
 * Update game message
 */
socket.on('game-message-update', function(data) {
  let gameMessage = document.getElementById('game-message');
  gameMessage.innerHTML = data;
});

/**
 * Assigned a role from the server
 */
socket.on('assigned-role', function(data) {
  let userSlotImage = document.getElementById('player-' + selfSlot + '-img');
  userSlotImage.src = "/static/images/" + data + ".png";
});

/**
 * Assigned a role from the server
 */
socket.on('allow-vote', function(data) {
  votePermission = true;

  let overlays = document.getElementsByClassName('vote-overlay');
  for (let i = 0; i < overlays.length; i++) {
    overlays[i].innerHTML = '';
    overlays[i].classList.add('display-inherit');
  }
});

/**
 * Set the player to their game slot
 */
socket.on('join-game-success', function(data) {
  selfSlot = data;
  let userSlotName = document.getElementById('player-' + selfSlot + '-name');
  userSlotName.classList.add('user-slot');
  userSlotName.innerHTML = 'You';
});

/**
 * Reset the game state
 */
socket.on('game-reset', function() {
  // Reset the players slots
  let userSlotName = document.getElementById('player-' + selfSlot + '-name');
  userSlotName.innerHTML = selfSlot;
  userSlotName.classList.remove('user-slot');
  selfSlot = 0;

  // Reset the game chat box
  let chatHistory = document.getElementById('chat-history');
  let newChat = '';
  chatHistory.innerHTML = newChat;

  // Reset vote permission
  votePermission = false;

  // Set all vote box off, erase their html
  let overlays = document.getElementsByClassName('vote-overlay');
  for (let i = 0; i < overlays.length; i++) {
    overlays[i].innerHTML = '';
    overlays[i].classList.remove('display-inherit');
  }

  // Reset the portrait
  let portraits = document.getElementsByClassName('role-image');
  for (let i = 0; i < portraits.length; i++) {
    portraits[i].src = "/static/images/empty.png";
  }

  // Reset button
  let joinBtn = document.getElementById('join-game');
  joinBtn.innerHTML = 'Join Game';
  joinPermission = true;

});

/**
* Update the game chat box
*/
socket.on('game-chat-update', function(data) {
  gameChat = data;
  let chatHistory = document.getElementById('chat-history');
  let newChat = '';
  gameChat.forEach(chat => {
    newChat += "<p class='chat-item'>" + chat + "</p>";
  });

  chatHistory.innerHTML = newChat;
  chatHistory.scrollTop = chatHistory.scrollHeight;
});

/**
* Update a player vote
*/
socket.on('player-voted-for', function(voter, target) {
  let userOverlay = document.getElementById('player-' + voter + '-overlay');
  userOverlay.innerHTML = target;
});

/**
 * Specific roles events
 */

socket.on('werewolf-night-event', function(data) {
  let userSlotImage = document.getElementById('player-' + data + '-img');
  userSlotImage.src = "/static/images/werewolf.png";
});

socket.on('seer-night-event', function(role, index) {
  let userSlotImage = document.getElementById('player-' + index + '-img');
  userSlotImage.src = "/static/images/" + role + ".png";
});

socket.on('assassin-night-event', function(index) {
  let userSlotImage = document.getElementById('player-' + index + '-img');
  userSlotImage.src = "/static/images/target.png";
});

/**
 * HTML events
 */
document.addEventListener('DOMContentLoaded', function () {

  // Event for join queue/game
  let joinBtn = document.getElementById('join-game');
  joinBtn.addEventListener('click', function (event) {
    socket.emit('join-game-request');
  });

  // event for chat box
  let chatBox = document.getElementById('chat-input');
  chatBox.addEventListener("keyup", function(event) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Trigger the button element with a click
      socket.emit('game-chat-add', chatBox.value);
      chatBox.value = ''; 
    }
  });

  // event for voting
  let players = document.getElementsByClassName('player-container');
  for (let i = 0; i < players.length; i++) {
    players[i].addEventListener("click", function(event) {
      // Cancel the default action, if needed
      event.preventDefault();
      // If the server allow voting, send the vote
      if (votePermission)
        socket.emit('vote', players[i].id.charAt(players[i].id.length - 1));
    });
  }
});