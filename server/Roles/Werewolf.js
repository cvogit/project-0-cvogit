
let Role = require('./Role');

class Werewolf extends Role {
  constructor(){
    super('werewolf');
  }

  /**
  * Check whether the werewolf won
  * 
  * @param {Object, Slot}
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
  * 
  * @param {Object, Slot}
  */
 performNightEvent(gameRoom, pSlot) {

    // Tell each werewolf who the other werewolf is
    let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];

    slotArray.forEach(slot => {
      if(slot !== pSlot && slot.role.name === 'werewolf') {
        if(pSlot.isConnected) {
          pSlot.socket.emit('game-message-update', 'View your werewolf allies!');  
          pSlot.socket.emit('werewolf-night-event', slot.index);
        }     
      }
    });
  }
}

module.exports = Werewolf;