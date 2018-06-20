// imports
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser')
var http = require('http').Server(app);
var io = require('socket.io')(http);

// globals
var timestamp = new Date();
var rootChannel = "";
var channels = {};
var users = {};

// config
app.set('port', 3000);
app.use( bodyParser.json() );                         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));   // to support URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

// socket.io connections
io.on('connection', function(socket){
  
  // handle connection
  updateTimestamp();
  socket.join(rootChannel);
  users[socket.id] = "";
  channels[socket.id] = rootChannel;
  console.log('[' + timestamp.toUTCString() + '] system-message: ' + getUserInfo(socket.id) + ' connected');
  io.emit('system-message', { for: 'everyone', user: getUserInfo(socket.id), message: getUserInfo(socket.id) + " connected", timestamp: timestamp.toUTCString() });

  // handle disconnection
  socket.on('disconnect', function(){
    updateTimestamp();
    console.log('[' + timestamp.toUTCString() + '] system-message: ' + getUserInfo(socket.id) + ' disconnected');
    io.emit('system-message', { for: 'everyone', user: getUserInfo(socket.id), message: getUserInfo(socket.id) + " disconnected", timestamp: timestamp.toUTCString() });
  });

  // handle incoming chat messages 
  socket.on('chat-message', function(data){
    updateTimestamp();
    console.log('[' + timestamp.toUTCString() + '] chat-message: ' + getUserInfo(socket.id) + " @ " + data.message);
    io.to(data.channel).emit('chat-message', { for: 'everyone', user: getUserInfo(socket.id), message: data.message , timestamp: timestamp.toUTCString() });
  });

  // handle incoming gps coordinates 
  socket.on('system-gps', function(data){
    updateTimestamp();
    console.log('[' + timestamp.toUTCString() + '] system-gps: ' + data);
  });

  // handle channel change 
  socket.on('channel-join', function(data){
    updateTimestamp();
    console.log('[' + timestamp.toUTCString() + '] channel-join: ' + data);
    io.emit('system-message', { for: 'everyone', user: getUserInfo(socket.id), message: "user joined channel " + String(data), timestamp: timestamp.toUTCString() });
    socket.leave(channels[socket.id]);
    channels[socket.id] = String(data);
    socket.join(String(data));
  });

  // handle alias change 
  socket.on('alias-change', function(data){
    updateTimestamp();
    console.log('[' + timestamp.toUTCString() + '] alias-change: ' + data);
    io.emit('system-message', { for: 'everyone', user: getUserInfo(socket.id), message: "user changed alias to " + data, timestamp: timestamp.toUTCString() });
    users[socket.id] = data;
  });
});

// listen on designated port for HTTP request 
http.listen(app.get('port'), function(){
  console.log('listening on port ' + app.get('port'));
});

// update server timestamp
function updateTimestamp(){
  timestamp = new Date();
}

// get current channel by socked ID
function getChannelInfo(socketID){
  if(channels[socketID] == ""){
    return "root channel";
  } else {
    return channels[socketID];
  }
}

// get current alias by socked ID
function getUserInfo(socketID){
  if(users[socketID] == ""){
    return "anonymous user";
  } else {
    return users[socketID];
  }
}