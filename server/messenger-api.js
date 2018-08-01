const express = require('express');
const path = require('path');
const messengerApi = express();
const bodyParser = require('body-parser');
const http = require('http').Server(messengerApi);
const io = require('socket.io')(http);
const {logger} = require('./logger');

var rootChannel = 'lobby';
var channels = {};
var users = {};
var participants = {};

messengerApi.use(bodyParser.json());
messengerApi.use(bodyParser.urlencoded({ extended: true }));   // to support URL-encoded bodies
messengerApi.use(express.static(path.join(__dirname, 'public')));

// socket.io connections
io.on('connection', function(socket){
  
  socket.join(rootChannel);
  users[socket.id] = '';
  channels[socket.id] = rootChannel;
  addParticipantToChannel(socket, rootChannel);

  var timestamp = new Date() ;
  logger.info('[' + timestamp + '] system-message: ' + socket.id + ' connected');
  io.emit('system-message', { for: 'everyone', userid: 's-' + socket.id, message: socket.id + ' connected', timestamp: timestamp });

  // handle disconnection
  socket.on('disconnect', function(){
    timestamp = new Date();
    logger.info('[' + new Date() + '] system-message: ' + socket.id + ' disconnected');
    io.emit('system-message', { for: 'everyone', userid: 's-' + socket.id, message: socket.id + ' disconnected', timestamp: timestamp});
  });

  // handle incoming chat messages 
  socket.on('chat-message', function(data){

    if(data.mapID != null && data.message != null && data.userid != null){
      logger.info('[' + timestamp.toUTCString() + '] chat-message: ' + getUserInfo(socket.id) + ' @ ' + data.message);
      
      logger.info('Forwarding message data to map: ' + data.mapID);
      io.to(data.mapID).emit('chat-message', { for: 'everyone', userid: data.userid, message: data.message, timestamp: timestamp});  
      
    } else {
      logger.info('necessary payload fields are missing');
    }
  });

  // handle channel change 
  socket.on('channel-join', function(data){
    timestamp = new Date();
    removeParticipantFromChannel(socket);
    logger.info('[' + timestamp.toUTCString() + '] channel-join: ' + data);
    io.emit('system-message', { for: 'everyone', userid: getUserInfo(socket.id), message: 'user joined channel ' + String(data), timestamp: timestamp.toUTCString() });
    addParticipantToChannel(socket, String(data));
    listParticipants(String(data));
    socket.emit('channel-participants', participants[String(data)]);
  });

  // handle alias change 
  socket.on('alias-change', function(data){
    timestamp = new Date();
    io.emit('system-message', { for: 'everyone', userid: getUserInfo(socket.id), message: 'user changed alias to ' + data, timestamp: timestamp.toUTCString() });
    users[socket.id] = data;
  });
  

});

module.exports = {
  messengerApi: messengerApi,
  http: http
};

// get current alias by socked ID
function getUserInfo(socketID){
  if(users[socketID] == ''){
    return 'anonymous user';
  } else {
    return users[socketID];
  }
}

function addParticipantToChannel(socket, channelString){
  if(participants[channelString] == null){
    participants[channelString] = {};
  } 
  participants[channelString][socket.id] = true;
  channels[socket.id] = channelString;
  socket.join(channelString);
  logger.info('adding participant to channel: ' + channelString);
}

function removeParticipantFromChannel(socket){
  logger.info('removing participant from channel: ' + channels[socket.id]);
  delete participants[channels[socket.id]][socket.id];
  socket.leave(channels[socket.id]);
}

function listParticipants(channelString){
  logger.info('');
  logger.info('--- list of participants @ ' + channelString);
  logger.info(participants[channelString]);
  
}