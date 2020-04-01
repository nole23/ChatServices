const express = require('express');
const router = express.Router();
const http = require("http");
var https = require('https');
const chatImpl = require('../serviceImpl/chatImpl.js');

router
    /**
     * Method for get all chat where one user
     */
    .get('/', async function(req, res) {
        var data = JSON.stringify({})
        var token = req.body.token || req.query.token || req.headers['authorization'];
        var options = {
            host: 'localhost',
            port: 8080,
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

        var httpreq = http.request(options, async function (response) {
            response.setEncoding('utf8');
            response.on('data', async function (chunk) {
                var message = JSON.parse(chunk)['message'];

                var resData = await chatImpl.getLastMessage(message);
                return res.status(resData.status).send({message: resData.message})
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    .get('/:id', async function(req, res) {
        var _id = req.params.id;

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

                var data = await chatImpl.getAllChating(_id, 20, 0);
                return res.status(data.status).send({message: data.message})
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
    .put('/', async function(req, res) {
        var item = req.body;
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

                var data = await chatImpl.setPushShow(me, item);
                return res.status(data.status).send({message: data.message})
            });
        });
        httpreq.write(data);
        httpreq.end();
    })
module.exports = router;