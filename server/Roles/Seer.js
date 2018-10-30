
let Role = require('./Role');

class Seer extends Role {
  constructor(){
    super('seer');
  }

  /**
  * Check whether the Seer won
  */
 isVictorious(gameRoom, pSlot) {
    
  // Find the assassin and make sure the target wasn't voted for
  let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];
  let assassinTargetIndex;

  slotArray.forEach(slot => {
    if(slot.role.name === 'assassin') {
      assassinTargetIndex = slot.role.target;
    }
  });

  // If the vote is the target
  if(gameRoom.voteFor === assassinTargetIndex) 
    pSlot.socket.emit('game-message-update', 'Assassin Accomplished His Task!');  
  else if(gameRoom.voteFor === -1)
    pSlot.socket.emit('game-message-update', 'Werewolves Overtook The Town!');
  else if(gameRoom.voteFor !== -1) {
    if(slotArray[gameRoom.voteFor].role.name !== 'werewolf')
      pSlot.socket.emit('game-message-update', 'Werewolves Overtook The Town!');
  } else
  pSlot.socket.emit('game-message-update', 'Villagers Prevail... For Now!');  
}

  /**
  * Perform night event
  * Seer see a random player role
  * 
  * @param {Object, Slot}
  */
  performNightEvent(gameRoom, pSlot) {
    let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];
    
    // Create an array of players that is not including the seer
    let otherPlayersArray = [];
    slotArray.forEach(slot => {
      if(slot !== pSlot) {  
        otherPlayersArray.push(slot);
      }
    });

    // Tell the seer the role of a random player
    let randomPlayer = otherPlayersArray[Math.floor(Math.random() * otherPlayersArray.length)];
    
    if(pSlot.isConnected) {
      pSlot.socket.emit('game-message-update', 'Peer into the void and see the identity of another');  
      pSlot.socket.emit('seer-night-event', randomPlayer.role.name, randomPlayer.index);
    } 
  }
}

module.exports = Seer;