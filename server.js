const express = require('express'); 
var requestUuid = require('express-request-id')();
var cors = require('cors');
var http = require('http');
const socketio = require('socket.io');
const{
formatMessage,
storeMessage
}
 = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers

} = require('./utils/users');

const bodyParser = require('body-parser');
var consoleArguments = require('minimist');
var argv = consoleArguments(process.argv.slice(2));
// Configuring the database
var env = process.env.NODE_ENV;
env = env ? env : "development";
console.log("Environment is " + env);
var dbConfig = null; 
var params = null;
var gateway = null;
const Sequelize = require('sequelize');
const mongoose = require('mongoose');
const request = require('request');
const Controller = require('./base/controller.js');

var sequelize = null; 
//jwttoken and verification


// create express app
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(requestUuid);

app.use(bodyParser.json());


// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}))

io.on('connection', socket => {
    socket.on('join_room', (data) => {
      const user = userJoin(socket.id, data);
      socket.join(user.groupId);
      
      // Welcome current user
      socket.emit('receive_message', {message : 'Welcome to chat'});
      console.log("groupID : " + user.groupId)
      // Broadcast when a user connects
      // socket.broadcast
      //   .to(user.groupId)
      //   .emit(
      //     'receive_message',
      //     {message : `${user.userName} has joined the chat`}
      //   );
  
      // // Send users and room info
      // io.to(user.groupId).emit('roomUsers', {
      //   groupId: user.groupId,
      //   users: getRoomUsers(user.groupId)
      // });
    })


  // Listen for chatMessage
  socket.on('send_message', async msgData => {
    console.log("--------------------------")
    console.log("msgData")
    console.log(msgData)
    console.log("msgData")
    console.log("socket id : " + socket.id)
    const user = getCurrentUser(socket.id);
    console.log("user")
    console.log(user)
    console.log("user")
    const storeData = await storeMessage(msgData,socket.id);
    console.log("usstoreDataer")
    console.log(storeData)
    console.log("storeData")
    io.to(msgData.groupId).emit('receive_message', formatMessage(msgData.userName, msgData));
    console.log("--------------------------")
  });


// Runs when client disconnects
socket.on('disconnect', () => {

  const user = userLeave(socket.id);
  socket.leave(user.groupId)
  if (user) {
    // io.to(user.groupId).emit(
    //   'receive_message',
    //  { message : `${user.userName} has left the chat`}
    // );

    // Send users and room info
    // io.to(user.groupId).emit('roomUsers', {
    //   groupId: user.groupId,
    //   users: getRoomUsers(user.groupId)
    // });
  }
});
})

function loadConfigForEnv(configFilePath,env) {
  var ret = {};
  var config = require(`./config/${configFilePath}`);
  
    if (!config) {
      config = {}; 
    }
    if(!config[env]) {
      config[env] = {};
    }
    config = config[env];
    return config;
}
module.exports = {
  connectToDb: function(callback) {  
    var that = this;
      that.connectToMongoDb(dbConfig.mongo, function(mongoose) {
        callback({
            // sequelize:sequelize,
            mongoose: mongoose
        }); 
      });
},
connectToMongoDb: function(dbConfig, callback) { 
  if(!dbConfig) {
    console.info("No mongodb configuration found");
    (callback).call();
    return;
  } 
  var config = dbConfig;
  console.log("Mongodb config is "+JSON.stringify(dbConfig));
  var url = config.url;
  delete config.url; 
  mongoose.connect(url, config).then(() => {
    console.log("Connected to mongodb");
    if (callback) {
      (callback.call)(null,mongoose);
    }
  }).catch(err => {
    console.warn('Could not connect to mongodb.', err); 
    (callback.call)(null);
  });
},
  methods: {
    loadController: function (controller, options) {
      var defaultJWTSecret = "myapp";
      var defaultJWTConfig =  {
        secret: defaultJWTSecret
      };
      var config = params ? params : defaultJWTConfig;
      config.jwt = config.jwt?config.jwt: defaultJWTConfig;
      config.jwt.secret = config.jwt.secret?config.jwt.secret: defaultJWTSecret;
       
      config.options = options;
      var controllerBaseObj = new Controller(controller, app, config);

      var path = './app/controllers/' + controller + ".controller.js";
      console.debug("Loading controller " + path);
      var controller = require(path);
      controller = new controller(controllerBaseObj, options);



      controller.methods = controllerBaseObj;
      controller.options = options;
      return controller;
    }
  },
  start: function (serviceName, routes,serviceConfig) {


    if(!serviceConfig) {
      serviceConfig = { };
    }

    var port = process.env.port ? process.env.port : null;
    port = port ? port : argv.port ? argv.port : null;
    port = port? port : serviceConfig.port;
    if (!port) {
      console.error("PORT not set for " + serviceName + " service. Exiting...");

      process.exit(0);
    }

    if(!serviceConfig.db) {
      serviceConfig.db = "database.config";
    }
    if(!serviceConfig.params) {
      serviceConfig.app = "app.config";
    }
 
    dbConfig = loadConfigForEnv(serviceConfig.db,env);
    params = loadConfigForEnv(serviceConfig.app,env);  
    var gatewayConfig = params.gateway?params.gateway:{url:""};
    gateway = require('./app/components/gateway.component')(gatewayConfig);
     
    var that = this;
    this.connectToDb(function (db) {
      var options = db;
      if (routes) {
        var len = routes.length ? routes.length : 0;
        var i = 0;
        var route = null;
        while (i < len) {
          route = routes[i];
          console.debug("Loading route " + route);
          require('./app/routes/' + route + '.routes.js')(app, that.methods, options);
          i++;
        }
        server.listen(port, () => {
          console.log("Server is listening on port " + port);

        });

      }

    });



  }




};
