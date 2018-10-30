
/**
 * The base class for all roles
 */
class Role {

  constructor(name) {
    this.name = name;
  }

  /**
  * Implementation required
  * Check whether the player won or lost
  * 
  * @param {Object}
  */
  isVictorious(gameRoom) {
    throw new Error('You have to implement each role individual isVictorious');
  }

  /**
  * Implementation required
  * 
  * @param {Object, Slot}
  */
  performNightEvent(gameRoom, slot) {
    throw new Error('You have to implement each role individual performNightEvent');
  }

}

module.exports = Role;