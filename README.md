# explorer-messenger [![CircleCI](https://circleci.com/gh/CMUCloudComputing/explorer-messenger.svg?style=svg)](https://circleci.com/gh/CMUCloudComputing/explorer-messenger)
NodeJS messenger service for explorer

## Development
### Pre-Requisites
- Install [NodeJS](https://nodejs.org/en/download/) *(version >= 8.x.x required)*

### Installation
- `cd explorer-messenger`
- `npm install`

### Running the server
- `npm run start`

### Running Tests
- `npm run test`

### Linting
- `npm run lint`

## Usage Instructions

The below events should be emitted in the following format

### 'alias-change' 

  - Once socket connection is established set alias to Explorer user-id

  socket.emit("alias-change", userID );

  - Payload object should include the mapID 

  i.e. socket.emit("alias-change", 'f7152483-f147-451e-9af6-833eb8e121e7');


### 'channel-join' 

  - Once socket connection is established set channel to listen to updates on active map

  socket.emit("channel-join", mapID );
  
  - Payload object should include the mapID 

  i.e. socket.emit("channel-join", 'd935a328-dd9c-4818-b7c1-b6af26e204b8');


### 'chat-message'

  - To send a message client side socket emits an event named 'chat-message'

  socket.emit('chat-message', payload);

  - Payload object should include the following

<br/>  {
<br/>    userid: 'f7152483-f147-451e-9af6-833eb8e121e7',
<br/>    mapID: 'd935a328-dd9c-4818-b7c1-b6af26e204b8'},
<br/>    message: 'lorem ipsum dolor sit amet',
<br/>    timestamp: Date.now()
<br/>  }
