const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Post = require("./Post");

const CommentSchema = new Schema({
    author : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    content : {
        type : String,
        required : true,
    },
    postId : {
        type : Schema.Types.ObjectId,
        ref : "Post",
        required : true,
    },
    createAt : {
        type : Date,
        default : Date.now,
    }
});


module.exports = mongoose.model("Comment",CommentSchema);