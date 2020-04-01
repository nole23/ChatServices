var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    id_chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String
    },
    media: {
        type: String
    },
    date: {
        type : Date,
        default: new Date()
    },
    listViewUser: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Message', MessageSchema);