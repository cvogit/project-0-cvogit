
let Role = require('./Role');

class Villager extends Role {
  constructor(){
    super('villager');
  }

  /**
  * Check whether the vilager won
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
    }else
      pSlot.socket.emit('game-message-update', 'Villagers Prevail... For Now!');  
  }

  /**
  * Perform night event
  * 
  * @param {Object, Slot}
  */
  performNightEvent(gameRoom, pSlot) {
    if(pSlot.socket !== undefined)
      pSlot.socket.emit('game-message-update', 'Cower in fear as a simple villager');  
  }
}

module.exports = Villager;