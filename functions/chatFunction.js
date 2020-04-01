const Message = require('../models/message.js');

module.exports = {
    getLastMessage: function(_id) {
        return Message.findOne({id_chat: _id})
            .exec()
            .then(message => {
                return {status: true, message: message == null ? [] : message};
            })
            .catch(err => {
                return {status: false, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    }
}