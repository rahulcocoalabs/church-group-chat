const users = [];

// Join user to chat
function userJoin(id, data) {

  const user = { 
    id,
    userName : data.userName,
    userId : data.userId,
    groupId : data.groupId,
    date : data.date 
    };

  users.push(user);
  console.log("userJoin")
  console.log(users)
  console.log("userJoin")
  return user;
}

// Get current user
function getCurrentUser(id) {
  console.log("----getCurrentUser---")
  console.log("users")
  console.log(users)
  console.log("users")
  console.log("id : " + id)
  console.log("----getCurrentUser---")

  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  console.log("userLeave")
  console.log(users)
  console.log("userLeave")
  const index = users.findIndex(user => user.groupId === groupId);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(groupId) {
  return users.filter(user => user.groupId === groupId);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
