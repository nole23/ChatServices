const Chat = require('../models/chat.js');
const Message = require('../models/message.js');
const chatFunction = require('../functions/chatFunction.js');

module.exports = {
    getLastMessage: async function(message) {
        
        var responData = [];
        message.forEach(element => {
            var resData = {
                _id: element._id,
                dateOfCreate: element.dateOfCreate,
                participants: element.participants,
                message: []
            }
            var data = chatFunction.getLastMessage(element._id);
            if (data.status) {
                resData.message = data.message
            }
            responData.push(resData);
        });
        return {status: 200, message: responData};
    },
    setPushShow: async function(me, item) {
        return Message.findOne({id_chat: item._id})
            .exec()
            .then(message => {
                if (message !== null) {
                    console.log('Ovo treba srediti na serveru')
                }
                return {status: 200, message: 'SUCCESS_SAVE'};
            })
            .catch(err => {
                return {status: false, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    getAllChating: async function(_id, limit, page) {
        return Chat.find({listChater: {"$all": [_id]}})
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then((chats) => {

                return {status: 200, chats};
            })
            .catch((err) => {
                return {status: 200, 'ERROR_SERVER_NOT_FOUND'};
            })
    }
}
