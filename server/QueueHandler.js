let io = require('./dependencies/IO');

// Queue Handler
class QueueHandler {
  
  constructor(io) {
    this.io = io;
    this.queueRoom = io.sockets.in('queue');
  }

  /**
  * Add the socket to the queue room 
  *
  * @param {socket} 
  */
  joinQueue(socket) {
    socket.join('queue');
    this.updateQueueStateAll(); 
  }

  /**
  * Emit to a socket the current number of socket in queue
  *
  * @param {socket} 
  */
  updateQueueState(socket) {
    if(this.io.sockets.adapter.rooms['queue'] !== undefined)
      socket.emit('queue-update', this.io.sockets.adapter.rooms['queue'].length);
    else
      socket.emit('queue-update', 0);
  }

  /**
  * Emit to all sockets the current number of socket in queue
  *
  */
  updateQueueStateAll() {
    if(this.io.sockets.adapter.rooms['queue'] !== undefined)
      this.io.sockets.emit('queue-state-update', this.io.sockets.adapter.rooms['queue'].length);
    else
      this.io.sockets.emit('queue-state-update', 0);
  }

  /**
  * Return first in queue
  *
  */
  getFirstInQueue() {
    if(this.io.sockets.adapter.rooms['queue'] !== undefined) {
      var clients = this.io.sockets.adapter.rooms['queue'].sockets;   
      var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
      
      clients.forEach( (key, value) => {
        return key;
      });
    }
  }

  /**
  * Return the number of players in queue
  *
  */
  getNumberInQueue() {
    if(this.io.sockets.adapter.rooms['queue'] !== undefined)
      return this.io.sockets.adapter.rooms['queue'].length;
  }
}

const instance = new QueueHandler(io);

module.exports = instance;