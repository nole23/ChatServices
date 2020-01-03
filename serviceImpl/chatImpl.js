const Chat = require('../models/chat.js');
const Message = require('../models/message.js');

module.exports = {
    getChater: async function(_id_me, _id_friend) {
        return null;
    },
    removeChatStatus: async function(me, friend) {
        // console.log(friend)
        return Chat.findOne({listChater: {"$all": [me._id, friend.user._id]}}, { chatBox: { "$slice": [ -10, 10 ] }})
        .limit(10)
        .populate('chatBox.text')
        .exec()
        .then((chatList) => {
            // console.log(chatList)
            // chatList.chatBox.forEach(text => {
            //     text.text.listViewUser.push(me._id);
            // })
            // chatList.save();
            return 'save'
        })
        .catch((err) => {
            return '';
        })
    },
    getChatStatus: async function(me, friend) {
        return Chat.findOne({listChater: {"$all": [me._id, friend.user._id]}}, { chatBox: { "$slice": [ -10, 10 ] }})
        .limit(10)
        .populate('chatBox.text')
        .exec()
        .then((chatList) => {
            let counter = 0;
            chatList.chatBox.forEach(text => {
                if (text.text.listViewUser.length === 0) {
                    counter += 1;
                }
            })
            return {user: friend, numberMessage: counter}
        })
        .catch((err) => {
            return {user: friend, numberMessage: 0}
        })
    },
    setChat: async function(me, friend, lastLimit, limit) {
        return Chat.findOne({listChater: {"$all": [me._id, friend.user._id]}}, { chatBox: { "$slice": [ lastLimit, limit ] }})
        .limit(10)
        .populate('chatBox.text')
        .exec()
        .then((chat) => {
            if (!chat) {
                var object = new Chat({listChater: [], chatBox: []})
                var chaters = {
                    _id: object._id,
                    listChater: [me, friend.user],
                    chatBox: []
                };
                return chaters
            } else if (chat) {
                var chaters = {
                    _id: chat._id,
                    listChater: [me, friend.user],
                    chatBox: []
                };
                chat.chatBox.forEach(element => {
                    var resMessage = {
                        text: '',
                        date: element.date
                    }
                    var messages = {
                        _id_sender: undefined,
                        text: element.text.text,
                        media: element.text.media,
                        listViewUser: element.text.listViewUser
                    }
                    if (element.text._id_sender.toString() == me._id.toString()) {
                        messages._id_sender = me;
                    }
                    if (element.text._id_sender.toString() == friend.user._id.toString()) {
                        messages._id_sender = friend.user;
                    }
                    resMessage.text = messages;
                    chaters.chatBox.push(resMessage);
                })
                return chaters;
            }
            
        })
        .catch((err) => {
            console.log(err)
            return []
        });
    },
    pushChat: async function(chat, message) {
        var query = []
        chat.listChater.forEach(element => {
            query.push(element._id);
        });
        return Chat.findOne({listChater: {"$all": query}})
            .exec()
            .then((chats) => {
                if (!chats) {
                    var mess = {
                        _id_sender: message.user._id,
                        text: message.text,
                        media: message.media,
                        listViewUser: []
                    }
                    var saveMassage = new Message(mess);
                    var chatBox = {
                        text: saveMassage._id
                    }
                    var saveChat = new Chat({_id: chat._id, listChater: query, chatBox: chatBox})
                    saveMassage.save(() => {
                        saveChat.save(() => {
                        });
                    })
                    var resMessage = {
                        _id: saveMassage._id,
                        _id_sender: message.user,
                        text: saveMassage.text,
                        media: saveMassage.media,
                        listViewUser: saveMassage.listViewUser
                    }
                    var chatBoxSend = {
                        text: resMessage,
                        date: saveChat.chatBox[0].date,
                        _id: saveChat.chatBox[0]._id,
                    }
                    var resChat = {
                        _id: saveChat._id,
                        listChater: chat.listChater,
                        chatBox: chatBoxSend
                    }
                    return {status: 200, message: resChat};
                    
                } else if (chats) {
                    var mess = {
                        _id_sender: message.user._id,
                        text: message.text,
                        media: message.media,
                        listViewUser: []
                    }
                    var saveMassage = new Message(mess);
                    var chatBox = {
                        text: saveMassage._id,
                        date: new Date()
                    }
                    chats.chatBox.push(chatBox);
                    saveMassage.save();
                    chats.save();
                    var messResponse = {
                        _id_sender: message.user,
                        text: message.text,
                        media: message.media,
                        listViewUser: []
                    }
                    var chatBoxResponse = {
                        text: messResponse,
                        date: chatBox.date
                    }
                    return {status: 200, chatBoxResponse: chatBoxResponse, chat: chats, query: query};
                }
            })
            .catch((err) => {
                return {status: 400, message: 'not chat'};
            })
    }
}

saveMessage = async function(item) {
    var message = new Message(item);
    console.log('dosao')
    return 
}
