
const {parsed: config = {}} = require('dotenv').config();
const PORT = config.NODE_ENV === 'production' ? 8888 : 8888;
const messengerApi = require('./messenger-api').messengerApi;
const http = require('./messenger-api').http;
const {logger, expressLogger} = require('./logger');

messengerApi.use(expressLogger);

messengerApi.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

http.listen(PORT, () => {
  logger.info(`Explorer messenger API is listening on port ${PORT}`);
});

