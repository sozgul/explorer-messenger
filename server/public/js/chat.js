/* eslint-disable */

var socket = io();

function initiateChat(){
  socket.emit("channel-join", String(channelInput.value));
  socket.emit("alias-change", String(aliasInput.value));

  socket.on('system-message', function(data){
    systemMessageHandler(data);
  });

  socket.on('chat-message', function(data){
    chatMessageHandler(data);
  });
}

function messageHandler(data){
  console.log(data.message);
  console.log(data.timestamp);
  var chatMessageFrame = document.createElement('div');
  var parsedDateObject = new Date(data.timestamp);
  var parsedDateString = parsedDateObject.toLocaleDateString();
  var parsedTimeString = parsedDateObject.toLocaleTimeString();
  // format timestamp << day/month hour:minutes AM/PM >>
  var timeStampText = parsedDateString.substring(0,parsedDateString.length-5) + ' ' + parsedTimeString.substring(0,parsedTimeString.length-6) + ' ' + parsedTimeString.substring(parsedTimeString.length-2,parsedTimeString.length);
  var timestampTextNode = document.createTextNode(timeStampText);
  var timestampNode = document.createElement('div');
  timestampNode.appendChild(timestampTextNode);
  timestampNode.className = 'MessageTimestamp';
  
  var authorTextNode = document.createTextNode(data.userid);
  var authorNode = document.createElement('div');
  authorNode.appendChild(authorTextNode);
  authorNode.className = 'MessageAuthor';
  
  var messageHeaderNode = document.createElement('div');
  messageHeaderNode.appendChild(authorNode);
  messageHeaderNode.appendChild(timestampNode);
  messageHeaderNode.className = 'MessageHeader';

  if(data.message.latitude == null || data.message.longitude == null){
    var messageTextNode = document.createTextNode(data.message);  
  } else {
    var messageTextNode = document.createTextNode(data.message.latitude + ' ' + data.message.longitude);
    var markerCoordinates = {lat: Number(data.message.latitude), lng: Number(data.message.longitude)};

    var marker = new google.maps.Marker({
      position: markerCoordinates,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 3
      }
    });
  
    // To add the marker to the map, call setMap();
    marker.setMap(map);
  }
  
  var messageNode = document.createElement('div');
  messageNode.appendChild(messageTextNode);
  messageNode.className = 'MessageText';
  
  chatMessageFrame.appendChild(messageHeaderNode);
  chatMessageFrame.appendChild(messageNode);
  chatMessageFrame.className = 'MessageFrame';
  
  messageLog.appendChild(chatMessageFrame);
  messageLog.scrollTop = messageLog.scrollHeight;
}

function handleChannelChange(){
  console.log("channel changed to [ " + channelInput.value + " ]");
  socket.emit("channel-join", String(channelInput.value));
  sendCoordinatesFromIP();
}

function handleAliasChange(){
  console.log("changed alias to [ " + aliasInput.value + " ]");
  socket.emit("alias-change", String(aliasInput.value));
}

function chatMessageHandler(data){
  messageHandler(data);
}

function systemMessageHandler(data){
  messageHandler(data);
}

function sendCoordinatesFromIP(){
  console.log('sending GPS coordinates to server');
  socket.emit('system-gps', {coordinates: {lat: mapInitiationCenterCoordinates.lat, lng: mapInitiationCenterCoordinates.lng}, channel: channelInput.value });
}

  
function handleInputFormSubmit(){

  var userid = aliasInput.value;
  var mapID = channelInput.value;
  var message = String(chatInputForm.elements[0].value);

  chatInputForm.elements[0].value = "";

  var payload = {
    userid: userid,
    mapID: mapID,
    message: message,
    timestamp: Date.now()
  };
  
  socket.emit('chat-message', payload);

  return false;
}
