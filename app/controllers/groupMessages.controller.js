var Group = require('../models/group.model');
var groupMessage = require('../models/groupMessage.model');

function userJoin(id, username, room) {
    const user = { id, username, room };
  
    users.push(user);
  
    return user;
  }