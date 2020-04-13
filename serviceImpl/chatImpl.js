const { ObjectId } = require('mongodb');
const Chat = require('../models/chat.js');
const Message = require('../models/message.js');
const chatFunction = require('../functions/chatFunction.js');

module.exports = {
    getLastMessage: async function(message) {
        var responData = [];
        var lastData = ''
        for (var i = 0; i < message.length; i++) {
            var data = await chatFunction.getLastMessage(message[i]._id);
            var resData = {
                _id: message[i]._id,
                dateOfCreate: data.message.date == undefined ? new Date(message[i].dateOfCreate) : new Date(data.message.date),
                participants: message[i].participants,
                message: [],
                status: false
            }
            
            resData.message = data.message;
            responData.push(resData);
        }

        responData.sort(function(a, b) {
            a = new Date(a.dateOfCreate);
            b = new Date(b.dateOfCreate);
            return a>b ? -1 : a<b ? 1 : 0;
        });

        return {status: 200, message: responData};
    },
    setPushShow: async function(me, item) {
        const _id = ObjectId(me._id.toString());
        return Message.find({id_chat: item._id})
            .exec()
            .then(message => {
                message.forEach(element => {
                    if (element.listViewUser !== undefined) {
                        const index = element.listViewUser.indexOf(me._id);
                        if (index == -1 ) {
                            element.listViewUser.push(_id)
                        }
                    }
                    element.save();
                });
                return {status: 200, message: 'SUCCESS_SAVE_ADD'};
            })
            .catch(err => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    setRemoveShow: async function(me, item) {
        return Message.findById(item.message._id)
            .exec()
            .then(message => {
                if (message != null || message != undefined) {
                    const index = message.listViewUser.indexOf(me._id);
                    if (index != -1) {
                        message.listViewUser.splice(index, 1);
                        message.save();
                    }
                }
                return {status: 200, message: 'SUCCESS_SAVE_REMOVE'};
            })
            .catch(err => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    getAllChating: async function(_id, limit, page = 0) {
        return Message.find({id_chat: _id})
            .sort({date: -1})
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then((chats) => {
                var resMessag = [];
                chats.forEach(element => {
                    resMessag.unshift(element);
                })
                return {status: 200, message: resMessag};
            })
            .catch((err) => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    pushMessage: async function(me, chat, message, req) {
        var newMessage = new Message();
        newMessage.id_chat = chat._id;
        newMessage.author = me._id;
        newMessage.text = message;
        newMessage.date = new Date;
        newMessage.listViewUser.push(me._id)

        newMessage.save();
        var io = req.app.get('socket-io')
        chat.participants.forEach(element => {
            io.emit('new-message-' + element._id, 
                JSON.stringify({chat: chat, message: newMessage})
            )
        })
        return {status: 200, message: 'SUCCESS_SAVE', data: newMessage}
    },
    editMessage: async function(message, me, item) {
        var listUser = item.participants;
        var retMessage = []
        if (message.length != 0) {

            for (var i = 0; i < message.length; i++) {
                var oneMessage = message[i];
                const author = listUser.find(id => id._id.toString() == oneMessage.author.toString());
                var object = {
                    user: author,
                    isMe: author._id.toString() == me._id.toString(),
                    message: []
                }

                var text = ''
                var linkText = ''
                var isBgs = false;
                var isBottom = false;
                var lastStyle = false;

                if (retMessage.length > 0) {
                    lastStyle = true;
                }
 
                var regExpLink = chatFunction.checkLink(oneMessage.text.toString());
                var regExpSmile = chatFunction.checkSmile(oneMessage.text.toString());
                var regExpYt = chatFunction.checkYt(oneMessage.text.toString());
                var regExpImg = chatFunction.checkImg(oneMessage.text.toString());

                if (regExpLink) {
                    if (regExpYt) {
                        if (regExpYt['index'] === 0) {
                            text = chatFunction.setChatWithoutText(regExpYt[0], object.isMe);
                        } else {
                            text = chatFunction.setChatWithText(
                                        oneMessage.text.slice(0,regExpYt['index']),
                                        regExpYt[0],
                                        object.isMe
                                    ); 
                        }
                        linkText = chatFunction.setYtText(regExpYt[0])
                    } else if (regExpImg) {

                        if (regExpImg['index'] === 0) {
                            text = chatFunction.setChatWithoutText(regExpImg[0], object.isMe);
                        } else {
                            text = chatFunction.setChatWithText(
                                        oneMessage.text.slice(0,regExpImg['index']),
                                        regExpImg[0],
                                        object.isMe
                                    );
                            
                        }
                        linkText = chatFunction.setImageText(regExpImg[0], object.isMe)
                    } else {
                        if (regExpLink['index'] === 0) {
                            text = chatFunction.setChatWithoutText(regExpLink[0], object.isMe);
                        } else {
                            text = chatFunction.setChatWithText(
                                        oneMessage.text.slice(0,regExpLink['index'], object.isMe),
                                        regExpLink[0]
                                    );
                        }
                        linkText = null;
                    }
                    isBgs = true;
                } else if (regExpSmile) {
                    if (regExpSmile['index'] === 0) {
                        isBgs = false;
                    } else {
                        isBgs = true;
                    }
                    linkText = null;
                    text = oneMessage.text;
                } else {
                    linkText = null;
                    text = oneMessage.text;
                    isBgs = true;
                }

                var textSave = {
                    _id: oneMessage._id,
                    text: text,
                    dateOfCreate: oneMessage.date,
                    isBgs: isBgs,
                    isBottom: isBottom
                };                    
            
                if (linkText !== null) {
                    var imgSave = {
                        _id: oneMessage._id,
                        text:  linkText,
                        dateOfCreate: oneMessage.date,
                        isBgs: false,
                        isBottom: false
                    }   
                }

                
                if (retMessage.length == 0) {
                    object.message.push(textSave);
                    if (linkText !== null) {
                        object.message.push(imgSave);
                    }
                    retMessage.push(object);
                } else {
                    if (lastStyle) {
                        retMessage[retMessage.length - 1].message[retMessage[retMessage.length - 1].message.length - 1].isBottom = true;
                    }

                    if (retMessage[retMessage.length - 1].user._id.toString() ==  author._id.toString()) {
                        retMessage[retMessage.length - 1].message.push(textSave);
                        if (linkText !== null) {
                            retMessage[retMessage.length - 1].message.push(imgSave);
                        }
                    } else {
                        object.message.push(textSave);
                        if (linkText !== null) {
                            object.message.push(imgSave);
                        }
                        retMessage.push(object);
                    }
                }
            }
        }
        return {status: 200, message: retMessage}
    },
    removeOneMessage: async function(me, id) {
        return Message.findById(id)
            .exec()
            .then(message => {

                message.remove();
                return {status: 200, message: 'SUCCESS_SAVE_REMOVE'}
            })
            .catch(err => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'}
            })
    }
}
