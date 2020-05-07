const express = require('express');
const router = express.Router();
const http = require("http");
var https = require('https');
const chatImpl = require('../serviceImpl/chatImpl.js');

router
    /**
     * Get all chater
     */
    .get('/', async function(req, res) {
        var data = JSON.stringify({})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'twoway-usersservice.herokuapp.com',
            path: '/api/chats/',
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

        var httpreq = https.request(options, async function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var message = JSON.parse(chunk);

                var resData = await chatImpl.getLastMessage(message['message'], message['me']);
                return res.status(resData.status)
                    .send({
                        message: resData.message,
                        socket: resData.socket
                    })
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    /**
     * Get one chater
     */
    .get('/:id', async function(req, res) {
        var _id = req.params.id;
        var body = JSON.parse(req.query.item);
        var page = JSON.parse(req.query.page);

        var data = JSON.stringify({})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'twoway-usersservice.herokuapp.com',
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

        var httpreq = http.request(options, async function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var me = JSON.parse(chunk);
                if (me !== null || me !== undefined) {
                    var data = await chatImpl.getAllChating(_id, 20, page);
                    if (data.message == 'ERROR_SERVER_NOT_FOUND') {
                        return res.status(data.status)
                            .send({
                                message: data.message,
                                socket: 'SOCKET_NULL_POINT'
                            })
                    } else {
                        var editMessage = await chatImpl.editMessage(data.message, me, body);
                        return res.status(200)
                            .send({
                                message: editMessage.message,
                                page: page,
                                socket: 'SOCKET_NULL_POINT'
                            })
                    }
                } else {
                    return res.status(200)
                        .send({
                            message: 'ERROR_SERVER_NOT_FOUND',
                            socket: 'SOCKET_NULL_POINT'
                        })
                }
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    /**
     * Send message
     */
    .post('/', async function(req, res) {
        var chat = req.body.chat;
        var message = req.body.message;
        
        var data = JSON.stringify({})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'twoway-usersservice.herokuapp.com',
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

        var httpreq = http.request(options, async function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var me = JSON.parse(chunk);

                var resData = await chatImpl.pushMessage(me, chat, message);
                return res.status(resData.status)
                    .send({
                        message: resData.message, 
                        socket: {
                            type: 'CHAT',
                            link: 'new-message-',
                            participants: resData.participants,
                            data: resData.data
                        }
                    });
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    /**
     * Set show new message
     */
    .put('/', async function(req, res) {
        var item = req.body['chat'];
        var isType = req.body['isType'];

        var data = JSON.stringify({})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'twoway-usersservice.herokuapp.com',
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

        var httpreq = http.request(options, async function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var me = JSON.parse(chunk);

                var data = {}
                if (isType) {
                    data = await chatImpl.setPushShow(me, item);
                } else {
                    data = await chatImpl.setRemoveShow(me, item);
                }

                return res.status(data.status)
                    .send({
                        message: data.message, 
                        socket: data.socket
                    })
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    /**
     * Function not implement
     */
    .delete('/', async function(req, res) {
        var item = req.body['chat'];
        var isType = req.body['isType'];

        // TO DO Create remove all chater, save remove message in new db
    })
    /**
     * Remove one message
     */
    .delete('/:id', async function(req, res) {
        var id = req.params.id;

        var data = JSON.stringify({})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'twoway-usersservice.herokuapp.com',
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

        var httpreq = http.request(options, async function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var me = JSON.parse(chunk);

                var resData = await chatImpl.removeOneMessage(me, id);
                return res.status(resData.status)
                    .send({
                        message: resData.message,
                        socket: 'SOCKET_NULL_POINT'
                    })
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
module.exports = router;
