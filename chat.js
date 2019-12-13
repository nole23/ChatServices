const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

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
var io = require('socket.io')(http);

io.on('connection', function (socket) {
    console.log('connected:', socket.client.id);
    socket.on('typing', function(data) {
        console.log('user typing')
        io.emit('typing-' + data.id, true)
    })
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

app.set('socket-io', io);
http.listen(port, () => console.log(`UserServer is start on port: ${ port }`))