var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    _id_sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String
    },
    media: {
        type: String
    },
    listViewUser: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Message', MessageSchema);