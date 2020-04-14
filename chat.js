const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
var io = require('socket.io');

var mongodbUri = "mongodb://nole23:novica23@ds131384.mlab.com:31384/twoway_chat"
mongoose.connect(mongodbUri, {useNewUrlParser: true});
var options = { useNewUrlParser: true,
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(mongoSanitize());

var chating = require('./services/chat.js');

var port = process.env.PORT || 8084;
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
    next();
});

app.use('/api/chats', chating);

var http = require('http').Server(app);


var allowedOrigins = "http://localhost:* http://127.0.0.1:* https://twoway1.herokuapp.com";
var ios = io(http, {
    origins: allowedOrigins
});

ios.on('connection', function (socket) {
    console.log('connected:', socket.client.id);
    socket.on('typing', function(data) {
        io.emit('typing-' + data.chater, data.user)
    })
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('notify-show-messages', function(data) {
        console.log(data);
    })
});

app.set('socket-io', ios);
http.listen(port, () => console.log(`UserServer is start on port: ${ port }`))