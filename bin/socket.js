function server(server){

return require('socket.io')(server);

}

module.exports = server;