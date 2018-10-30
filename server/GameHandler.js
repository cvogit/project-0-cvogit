let io = require('./dependencies/IO');
let QueueHandler  = require('./QueueHandler');
let RoleFactory   = require('./RoleFactory');
let Slot = require('./Slot');

// Queue Handler
class GameHandler {
  
  constructor(io) {
    this.io = io;
    this.gameRoom = io.sockets.in('game');
    this.gameRoom.status     = 'waiting'; // ['waiting', 'inprogress']
    this.gameRoom.numPlayers = 0;
    this.gameRoom.slot_1 = new Slot();
    this.gameRoom.slot_2 = new Slot();
    this.gameRoom.slot_3 = new Slot();
    this.gameRoom.slot_4 = new Slot();
    this.gameRoom.slot_5 = new Slot();
    this.gameRoom.gameMessage = 'Waiting for 5 more players';
    this.gameRoom.voteFor = 0;
    this.gameRoom.chatBox = [];
    this.gameRoom.chatPermission = false;
    this.gameRoom.votePermission = false;
  }

  /**
  * Assign the roles to each socket
  *
  * @param {array} 
  */
  assignRoles(rolesArray) {
    let gameRoom = this.gameRoom;
    let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];
    let index = 0;

    rolesArray.forEach(roleName => {
      slotArray[index].role = RoleFactory.createRole(roleName);
      index++;
    });
  }

  /**
  * Check whether a player can join a game
  *
  * @param socket 
  */
  canJoinGame(socket) {
    if(this.gameRoom.status === 'waiting' && this.gameRoom.numPlayers < 5 && !this.isSocketInGame(socket))
      return true;
    return false;
  }

  /**
  * Return the number of players in the game
  *
  */
  getNumberOfPlayers() {
    return this.io.sockets.adapter.rooms['game'].length;
  }

  /**
  * Add the socket to the game room 
  * Ask the game to start if it ready
  *
  * @param socket 
  */
  joinGame(socket) {

    let room = this.gameRoom;
    // Put socket into a seat in the game
    if(room.slot_1.available) {
      room.slot_1.available = false;
      room.slot_1.index     = 1;
      room.slot_1.socket    = socket;
      room.slot_1.socketId  = socket.id;
      room.slot_1.portrait  = 'unknown';
      socket.emit('join-game-success', 1);
    } else if(room.slot_2.available) {
      room.slot_2.available = false;
      room.slot_2.index     = 2;
      room.slot_2.socket    = socket;
      room.slot_2.socketId  = socket.id;
      room.slot_2.portrait  = 'unknown';
      socket.emit('join-game-success', 2);
    } else if(room.slot_3.available) {
      room.slot_3.available = false;
      room.slot_3.index     = 3;
      room.slot_3.socket    = socket;
      room.slot_3.socketId  = socket.id;
      room.slot_3.portrait  = 'unknown';
      socket.emit('join-game-success', 3);
    } else if(room.slot_4.available) {
      room.slot_4.available = false;
      room.slot_4.index     = 4;
      room.slot_4.socket    = socket;
      room.slot_4.socketId  = socket.id;
      room.slot_4.portrait  = 'unknown';
      socket.emit('join-game-success', 4);
    } else if(room.slot_5.available) {
      room.slot_5.available = false;
      room.slot_5.index     = 5;
      room.slot_5.socket    = socket;
      room.slot_5.socketId  = socket.id;
      room.slot_5.portrait  = 'unknown';
      socket.emit('join-game-success', 5);
    } else {
      QueueHandler.joinQueue(socket);
      return;
    }
    
    this.gameRoom.numPlayers++;
    socket.join('game');
    
    this.updateGameStateAll();
    this.updateGameMessage();
    this.startIfReady();
  }

  /**
  * Check if socket is already in game
  *
  * @param socket 
  */
  isSocketInGame(socketId) {
    let room = this.gameRoom;

    // Check each slot if socket used to be there
    if(room.slot_1.socketId === socketId || 
       room.slot_2.socketId === socketId || 
       room.slot_3.socketId === socketId ||
       room.slot_4.socketId === socketId ||
       room.slot_5.socketId === socketId)
       return true;
    return false;
  }

  /**
  * Remove the socket from the game room 
  *   check which socket slot it is in
  *   then remove it and upate all sockets
  *
  * @param socket 
  */
  leaveGame(socketId) {

    // If the game is waiting for more players, open up the slot
    if(this.gameRoom.status === 'waiting')
    {
      let room = this.gameRoom;

      // Check each slot if socket used to be there
      if(room.slot_1.socketId === socketId) {
        room.slot_1 = new Slot();
        room.slot_1.index = 1;
      } else if(room.slot_2.socketId === socketId) {
        room.slot_2 = new Slot();
        room.slot_2.index = 2;
      } else if(room.slot_3.socketId === socketId) {
        room.slot_3 = new Slot();
        room.slot_3.index = 3;
      } else if(room.slot_4.socketId === socketId) {
        room.slot_4 = new Slot();
        room.slot_4.index = 4;
      } else if(room.slot_5.socketId === socketId) {
        room.slot_5 = new Slot();
        room.slot_5.index = 5;
      }

      this.gameRoom.numPlayers--;
      this.updateGameStateAll();
      this.updateGameMessage();
    } else {
      // Else if the game is still in progress, deal with it here
      // Set their slot connected to false
      let room = this.gameRoom;

      // Check each slot if socket used to be there
      if(room.slot_1.socketId === socketId) {
        room.slot_1.isConnected = false;
      } else if(room.slot_2.socketId === socketId) {
        room.slot_2.isConnected = false;
      } else if(room.slot_3.socketId === socketId) {
        room.slot_3.isConnected = false;
      } else if(room.slot_4.socketId === socketId) {
        room.slot_4.isConnected = false;
      } else if(room.slot_5.socketId === socketId) {
        room.slot_5.isConnected = false;
      }
    }
  }

  /**
  * Restart the game
  *
  */
  restartGameQueue() {
    this.gameRoom = io.sockets.in('game');
    this.gameRoom.status     = 'waiting'; // ['waiting', 'inprogress']
    this.gameRoom.numPlayers = 0;
    this.gameRoom.slot_1 = new Slot();
    this.gameRoom.slot_2 = new Slot();
    this.gameRoom.slot_3 = new Slot();
    this.gameRoom.slot_4 = new Slot();
    this.gameRoom.slot_5 = new Slot();
    this.gameRoom.gameMessage = 'Waiting for 5 more players';
    this.gameRoom.voteFor = 0;
    this.gameRoom.chatBox = [];
    this.gameRoom.chatPermission = false;
    this.gameRoom.votePermission = false;

    this.io.sockets.emit('game-message-update', 'Waiting for 5 more players');
  }

  /**
  * Check if the game should 
  *
  * @param socket 
  */
  startIfReady() {
    if(this.gameRoom.numPlayers === 5) {
      this.startGame();
    }
  }

  
  /**
   * Shuffles array in place with Fisher–Yates algo
   * @param {Array}
   */
  shuffle(array) {
    let j, x, i;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
  }

  /**
  * Start the game
  *
  * @param socket 
  */
  startGame() {

    // Flip game room on
    this.gameRoom.status = 'inprogress';
    this.io.sockets.emit('game-message-update', 'Game is starting');
    this.io.sockets.emit('game-starting');


    // Possible game set of roles
    const roles = [['werewolf', 'werewolf', 'assassin', 'seer', 'villager']];

    // Choose a random set of roles
    let chosenRoles = roles[Math.floor((Math.random() * roles.length) + 1) - 1];
    chosenRoles = this.shuffle(chosenRoles);
    this.assignRoles(chosenRoles);

    // Give each players their roles
    this.updateGameInitialState();

    let gameRoom = this.gameRoom;
    let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];

    // Wait 5 seconds then perform night events
    setTimeout(function() { 
      slotArray.forEach(slot => {
        if(slot.isConnected)
          slot.role.performNightEvent(gameRoom, slot);
      });
    }, 5000);

    // Wait 5 (+5 secs) seconds and allow chat
    setTimeout(() => { 
      this.gameRoom.chatPermission = true;
      this.io.sockets.emit('game-message-update', 'Talk among each other and find the werewolves');
    }, 10000);

    // Wait 1 mins (+10 secs) then start vote
    setTimeout(() => { 
      this.gameRoom.votePermission = true;
      this.io.sockets.emit('allow-vote');
      this.io.sockets.emit('game-message-update', 'Vote for a town victim');
    }, 130000); // 70000

    // Wait 30 seconds (+1:10 mins) then tally votes
    setTimeout(() => { 
      this.io.sockets.emit('game-message-update', 'No more voting');
      this.gameRoom.votePermission = false;
      this.io.sockets.emit('endVote');
    }, 100000); // 100000

    // Announce result in 5 secs after vote ends (+1:40)
    setTimeout(() => { 
      this.voteTally();
      slotArray.forEach(slot => {
        if(slot.isConnected)
          slot.role.isVictorious(gameRoom, slot);
      });
    }, 105000); // 105000

    // Reset the game state
    setTimeout(() => { 
      this.io.sockets.emit('game-reset');
      this.restartGameQueue();
    }, 115000);
  }

  /**
  * Tell each players their roles
  *
  */
  updateGameInitialState() {
    let gameRoom = this.gameRoom;
    let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];

    slotArray.forEach(slot => {
      if(slot.isConnected) 
        slot.socket.emit('assigned-role', slot.role.name);
    });
  }

  /**
  * Add a message to the chat box
  *
  * @param {string, socket}
  */
  addGameChat(chat, pSocket) {
    if(this.gameRoom.chatPermission) {
      // Check which slot is adding to chat
      let gameRoom = this.gameRoom;
      let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];
      let index = 1;

      slotArray.forEach(slot => {
        if(slot.socketId === pSocket.id) {
          let message = index + ": " + chat;
          gameRoom.chatBox.push(message);
        }
        index++;
      });
      this.updateGameChatAll();
    }
  }

  /**
  * Emit to all sockets the current game message
  *
  */
  updateGameChatAll() {
    this.io.sockets.emit('game-chat-update', this.gameRoom.chatBox);
  }

  /**
  * Emit to all sockets the current game message
  *
  * @param {String}
  */
  updateGameMessage(pMessage = 'Default Message') {
    if(this.gameRoom.status === 'waiting') {
      if(this.io.sockets.adapter.rooms['game'] !== undefined)
        this.gameRoom.gameMessage = 'Waiting for ' + (5 - this.io.sockets.adapter.rooms['game'].length) + ' more players';
      else
        this.gameRoom.gameMessage = 'Waiting for 5 more players';
      this.io.sockets.emit('game-message-update', this.gameRoom.gameMessage);
    } else {
      this.gameRoom.gameMessage = pMessage;
      this.io.sockets.emit('game-message-update', this.gameRoom.gameMessage);
    }
  }

  /**
  * Emit to all sockets the current game state
  *
  */
  updateGameStateAll() {
    this.io.sockets.emit('game-state-update', 
    this.gameRoom.slot_1.portrait, 
    this.gameRoom.slot_2.portrait, 
    this.gameRoom.slot_3.portrait, 
    this.gameRoom.slot_4.portrait, 
    this.gameRoom.slot_5.portrait);

    // Initialize the game chat
    this.updateGameChatAll();

    // Initialize the game message
    this.updateGameMessage();

    // Change game join button
    if(this.gameRoom.status === 'inprogress') 
      this.io.sockets.emit('game-inprogress');
  }

  /**
  * register the vote and tell all sockets the vote
  *
  * @param {socket, integer}
  */
  voteFor(socket, playerIndex) {
    let gameRoom = this.gameRoom;
    let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];

    slotArray.forEach(slot => {
      if(slot.socketId === socket.id && slot.index !== playerIndex) {
        slot.voteFor = playerIndex;
        this.io.sockets.emit('player-voted-for', slot.index, playerIndex);
      }
    });
  }

  /**
  * Tally the vote
  *
  */
  voteTally() {
    let gameRoom = this.gameRoom;
    let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];
    let voteArray = [0,0,0,0,0];
    let voteArrayRecord = [0,0,0,0,0];

    slotArray.forEach(slot => {
      voteArray[slot.voteFor - 1]++;
      voteArrayRecord[slot.voteFor - 1]++;
    });
    
    voteArray.sort(function(a, b){return b-a});
    if(voteArray[0] === voteArray[1])
      this.gameRoom.voteFor = -1;
    else {
      let index = 1;
      voteArrayRecord.forEach(vote => {
        if(voteArray[0] === vote)
          this.gameRoom.voteFor = index;
        index++;
      });
    }
  }
}

const instance = new GameHandler(io);

module.exports = instance;