const Message = require('../models/message.js');

module.exports = {
    getLastMessage: async function(_id) {
        return Message.findOne({id_chat: _id})
            .sort({date: -1})
            .exec()
            .then(message => {
                return {status: true, message: message == null ? [] : message};
            })
            .catch(err => {
                return {status: false, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    checkLink: function(text) {
        var linkRegExp = new RegExp (/(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/);
        return text.match(linkRegExp)
    },
    checkYt: function(text) {
        var ytRegExp = new RegExp(/(?:https?:\/\/|www\.|m\.|^)youtu(?:be\.com\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w\?=]*)?/)
        return text.match(ytRegExp)
    },
    checkSmile: function(text) {
        var smileRegExp = new RegExp(/(\:\w+\:|\<[\/\\]?3|[\(\)\\\D|\*\$][\-\^]?[\:\;\=]|[\:\;\=B8][\-\^]?[3DOPp\@\$\*\\\)\(\/\|])(?=\s|[\!\.\?]|$)/)
        return text.match(smileRegExp)
    },
    checkImg: function(text) {
        var imgRegExp = new RegExp(/https?:\/\/.*\.(?:png|jpg|gif|jpeg)/)
        return text.match(imgRegExp)
    },
    setChatWithoutText: function(link, isMe) {
        return '<a class="btn-white-f" href="' + link + '" target="_blank">' + link + '</a>'
    },
    setChatWithText: function(text, link, isMe) {
        return text + '<br>' + '<a class="btn-white-f" href="' + link + '" target="_blank">' + link +'</a>'
    },
    setYtText: function(link, isMe) {
        var nameYt = link.split('/')
        var nameVide = ''
        if (nameYt[0] === 'https:' || nameYt[0] === 'http:') {
            nameVide = nameYt[3]
        } else {
            var first = nameYt[1].split('&')[0];
            var name = first.split('=')[1]
            nameVide = name;
        }

        return '<div class="w-100p pos-relative h-180p">' +
                    '<a class="sizefull btn-white-f" href="' + link + '" target="_blank">' +
                        '<img class="cursor-pointer float-r bo-cir-b-l-20 bo-cir-t-l-20 bo-cir-t-r-20 bo-cir-b-r-20 fit-image w-100p h-180p" src="' +
                        'https://img.youtube.com/vi/' + nameVide + '/0.jpg" />' +
                        '<i class="fa fa-play-circle-o pos-absolute ab-c-m fa-green-h fs-50" aria-hidden="true"></i>' +
                    '</a>' +
                '</div>'
    },
    setImageText: function(link, isMe) {
        return '<a class="btn-white-f" href="' + link + '" target="_blank">' +
                '<img class="cursor-pointer float-r bo-cir-b-l-20 bo-cir-t-l-20 bo-cir-t-r-20 bo-cir-b-r-20 fit-image w-100p h-180p" src="' +
                link + '" /></a>'
    }
}