const mongoose = require('mongoose');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;
}
var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    }
};

const GroupMessageSchema = mongoose.Schema({
    groupId:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    userId:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName : String,
    socketId : String,
    content: String,
    date: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);
module.exports = mongoose.model('GroupMessage', GroupMessageSchema, 'GroupMessages');