const express = require('express');
const router = express.Router();
const http = require("http");
const chatImpl = require('../serviceImpl/chatImpl.js');

router
    /**
     * Method for get all chat where one user
     */
    .get('/', function(req, res) {

        return res.status(200).send({message: 'radi'})
    })
    .get('/:id', async function(req, res) {
        console.log(req.get('origin'))
        var _id = req.params.id;
        var data = JSON.stringify({email: 'nole0223@gmail.com', password: '123'})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'https://twoway-usersservice.herokuapp.com',
            port: 80,
            path: '/api/sync/',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data),
              'authorization': token,
            }
        };
        var httpreq = await http.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                console.log(JSON.parse(chunk)._id);
                console.log(_id)
                // var chating = await chatImpl.getChater(JSON.parse(chunk)._id, _id);
                return res.status(200).send({message: 'chating'})
            });
        });
        httpreq.write(data);  
    })
    .post('/', async function(req, res) {
        var friend = req.body;
        var data = JSON.stringify({email: 'nole0223@gmail.com', password: '123'})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'https://twoway-usersservice.herokuapp.com',
            port: 80,
            path: '/api/sync/',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data),
              'authorization': token,
            }
        };
        var httpreq = http.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var lastLimit = -10;
                var limit = 10;
                var chating = await chatImpl.setChat(JSON.parse(chunk), friend, lastLimit, limit);
                return res.status(200).send({message: chating})
            });
        });
        httpreq.write(data);  
    })
    .post('/push', async function(req, res) {
        var chat = req.body['chat'];
        var io = req.app.get('socket-io')
        // console.log(chat)
        var message = req.body['message'];
        var push = await chatImpl.pushChat(chat, message);
        push.query.forEach(element => {
            if (element.toString() !== message.user._id.toString()) {
                console.log(element)
                io.emit("chat-" + element, {chatBoxResponse: push.chatBoxResponse, chat: push.chat, message: true});
                return;
            }
        });
        
        return res.status(push.status).send({chatBoxResponse: push.chatBoxResponse, chat: push.chat, message: true})
    })
module.exports = router;