
let Role = require('./Role');

class Assassin extends Role {
  constructor(){
    super('assassin');
    this.target = '';
    this.enterMessage = 'You are the assassin, persuate others and lead your taret to their demise.';    
  }

  /**
  * Check whether the Assassin won
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
    let slotArray = [gameRoom.slot_1, gameRoom.slot_2, gameRoom.slot_3, gameRoom.slot_4, gameRoom.slot_5];
    
    // Create an array of players that is not including the assassin
    let otherPlayersArray = [];
    slotArray.forEach(slot => {
      if(slot !== pSlot) {  
        otherPlayersArray.push(slot);
      }
    });

    // Tell the assassin who the target is
    let randomPlayer = otherPlayersArray[Math.floor(Math.random() * otherPlayersArray.length)];
    
    if(pSlot.isConnected) {
      pSlot.role.target = randomPlayer.index;
      pSlot.socket.emit('game-message-update', 'The golds are paid, time to do your job');  
      pSlot.socket.emit('assassin-night-event', randomPlayer.index);
    }   
  }
}

module.exports = Assassin;