const express = require('express');
const router = express.Router();
const http = require("http");
var https = require('https');
const chatImpl = require('../serviceImpl/chatImpl.js');

router
    /**
     * Method for get all chat where one user
     */
    .get('/', function(req, res) {

        return res.status(200).send({message: 'radi'})
    })
    .get('/:id', async function(req, res) {
        console.log('upao ovde 1')
        var _id = req.params.id;
        var data = JSON.stringify({email: 'nole0223@gmail.com', password: '123'})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        console.log('upao ovde 2')
        var options = {
            host: 'https://twoway-usersservice.herokuapp.com',
            path: '/api/sync/',
            method: 'GET',
            headers: {
              'Access-Control-Allow-Origin':'*',
              'Access-Control-Allow-Credentials':'true',
              'Access-Control-Allow-Methods':'GET, HEAD, POST, PUT, DELETE',
              'Access-Control-Allow-Headers':'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization',
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data),
              'authorization': token,
            }
        };
        console.log('upao ovde 3')
        var httpreq = await http.request(options, function (response) {
            console.log('upao ovde 4')
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

        var friend = req.body['body'];
        var data = JSON.stringify({email: 'nole0223@gmail.com', password: '123'})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var reqLastElemtn = req.body['lastElement']

        var options = {
            host: 'twoway-usersservice.herokuapp.com',
            path: '/api/sync/',
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin':'*',
                'Content-Type': 'application/json',
                'authorization': token,
                'Content-Length': Buffer.byteLength(data)
            }
          };
        console.log('3')
        var httpreq = https.request(options, function (response) {
            console.log('4')
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var lastLimit = reqLastElemtn !== undefined ? reqLastElemtn : -10;
                var limit = 10;
                var chating = await chatImpl.setChat(JSON.parse(chunk), friend, lastLimit, limit);
                return res.status(200).send({message: chating, lastLimit: lastLimit})
            });
        });
        httpreq.write(data);
        httpreq.end(); 
    })
    .post('/get-status', async function(req, res) {
        var friends = req.body;
        var data = JSON.stringify({email: 'nole0223@gmail.com', password: '123'})
        var token = req.body.token || req.query.token || req.headers['authorization'];

        var options = {
            host: 'twoway-usersservice.herokuapp.com',
            path: '/api/sync/',
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin':'*',
                'Content-Type': 'application/json',
                'authorization': token,
                'Content-Length': Buffer.byteLength(data)
            }
          };
        var httpreq = https.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                let resStatus = [];
                for(let i=0; i<friends.length; i++) {
                    var status = await chatImpl.getChatStatus(JSON.parse(chunk), friends[i]);
                    resStatus.push(status);
                }
                return res.status(200).send({message: status})
            });
        });
        httpreq.write(data);
        httpreq.end(); 
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