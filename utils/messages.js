// const moment = require('moment');


var Groups = require('../app/models/group.model');
var GroupMessages = require('../app/models/groupMessage.model');
var Users = require('../app/models/user.model');

function formatMessage(userName, messageData) {
  console.log("in format message");
  console.log(messageData.date)
  console.log("in format message");

  return {
    userName,
    userId : messageData.userId,
    groupId : messageData.groupId,
    content : messageData.content,
    time: messageData.date
  };
}

async function storeMessage(messageData, socketId){
  var userId = messageData.userId;
  var groupId = messageData.groupId;
  var churchId = messageData.churchId;
  var content = messageData.content;
  var userName = messageData.userName;
  var date = messageData.date;
  var userData  = await Users.findOne({
    _id : userId,
    church : churchId,
    status : 1
  })
  var groupData  = await Groups.findOne({
    _id : groupId,
    members : { $in: [userId]},
    status : 1
  })

  var messageData = {
    groupId,
    userId,
    userName,
    socketId,
    content,
    date,
    status : 1,
    tsCreatedAt : Date.now(),
    tsModifiedAt : null
  }

  var newMessage = new GroupMessages(messageData);
  var createMessageData = await newMessage.save();
  return createMessageData;
}
module.exports ={
  formatMessage,
  storeMessage
} 
