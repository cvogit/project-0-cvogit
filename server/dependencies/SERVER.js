let app   = require('./APP');
let http  = require('http');
let server = http.Server(app);

module.exports = server;