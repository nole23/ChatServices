const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

var mongodbUri = "mongodb://nole23:novica23@ds131384.mlab.com:31384/twoway_chat"
mongoose.connect(mongodbUri, {useNewUrlParser: true});

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
http.listen(port, () => console.log(`UserServer is start on port: ${ port }`))