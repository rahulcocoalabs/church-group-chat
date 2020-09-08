// const moment = require('moment');

function formatMessage(userName, messageData) {
  return {
    userName,
    content : messageData.content,
    time: messageData.date
  };
}

module.exports = formatMessage;
