var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    listChater: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    chatBox: [{
        text: {
            type: Schema.Types.ObjectId,
            ref: 'Message'
        },
        date: {
            type : Date,
            default: new Date()
        }
    }]
});

module.exports = mongoose.model('Chat', ChatSchema);