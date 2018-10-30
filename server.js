// Dependencies
let path  = require('path');
let app   = require('./server/dependencies/APP');
let express = require('./server/dependencies/EXPRESS');
let server = require('./server/dependencies/SERVER');
let io = require('./server/dependencies/IO');

// Server logic
let QueueHandler = require('./server/QueueHandler');
let GameHandler = require('./server/GameHandler');

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

/*************************
 * Socket events
 * 
 *************************/

// When new socket connect to the server
io.on('connection', function(socket) {
  initializeState(socket);
  
  socket.on('disconnect', function() {
    // Queue will clean up itself
    setTimeout(() =>  QueueHandler.updateQueueStateAll(), 500);

    // Clean up game room socket slot if player leave
    // Ask if the socket is in game room
    if(GameHandler.isSocketInGame(socket.id))
      GameHandler.leaveGame(socket.id);
  });

  // socket to join the queue
  socket.on('join-game-request', function() {
    // Check if game is currently waiting for player
    //  directly join the game if socket not already in game and game is open
    //  else join the queue
    if(!GameHandler.isSocketInGame(socket.id)) {
      if(GameHandler.canJoinGame(socket)) 
        GameHandler.joinGame(socket);
    }
  });

  // Update the game chat box and update all sockets chat box
  socket.on('game-chat-add', function(data) {
    GameHandler.addGameChat(data, socket);
  });

  // Update the game chat box and update all sockets chat box
  socket.on('vote', function(playerIndex) {
    GameHandler.voteFor(socket, playerIndex);
  });
});


/*************************
 * Helpers functions
 * 
 *************************/

/**
* Initialize the socket with the server current state
*
* @param socket 
*/
function initializeState(socket) {
  // Initialize game state
  GameHandler.updateGameStateAll();

}

/**************************
 * Interval processes
 * 
 **************************/