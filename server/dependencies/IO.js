let server = require('./SERVER');

let socketIO = require('socket.io');
let io = socketIO(server);

module.exports = io;