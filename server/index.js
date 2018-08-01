
const {parsed: config = {}} = require('dotenv').config();
const PORT = config.NODE_ENV === 'production' ? 8888 : 8888;
const http = require('./messenger-api');

const {logger} = require('./logger');

http.listen(PORT, () => {
  logger.info(`Explorer messenger API is listening on port ${PORT}`);
});

