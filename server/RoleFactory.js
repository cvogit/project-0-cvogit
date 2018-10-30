
let Villager	= require('./Roles/Villager');
let Werewolf  = require('./Roles/Werewolf');
let Seer      = require('./Roles/Seer');
let Assassin  = require('./Roles/Assassin');

class RoleFactory {
  constructor(){
    
  }

  createRole(role) {
    if(role === 'villager') 
      return new Villager();
    else if(role === 'werewolf')
      return new Werewolf();
    else if(role === 'assassin')
      return new Assassin();
    else if(role === 'seer')
      return new Seer();
  }
}

let instance = new RoleFactory();

module.exports = instance;