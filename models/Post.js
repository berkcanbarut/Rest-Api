const mongoose = require("mongoose");
const User = require("./User");
const Comment = require("./Comment");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        required : [true,"Lütfen post sahibini belirtiniz"],
        ref : "User",
    },
    title : {
        type : String,
        required : [true,"Lütfen post başlığını doldurunuz"],
    },
    content : {
        type : String,
        required : [true,"Lütfen post içeriğini doldurunuz"]
    },
    createAt : {
        type : Date,
        default : Date.now,
    },
    likes : {
        type : [Schema.Types.ObjectId,],
        ref : "User",
    },
    comments : {
        type : [Schema.Types.ObjectId,],
        ref : "Comment",
    },
    imgPath : {
        type : String,
    },
    //pdf - word - powerpoint
    filePath : {
        type : String,
    },
    hashtags : [
        {
            type : String,
            trim : true,
            lowercase : true,
        }
    ],
})
PostSchema.pre("save",async function(next){
    if(!this.isModified("user")){
        return next();
    }

    try{
        const user = await User.findById(this.user);

        user.posts.push(this);
        await user.save();
        return next();
    
    }catch(err){
        return next(err)
    }
    
});

PostSchema.post("remove", {document : true, query : false},async function(){
    //Kullanici tarafindan postun silinmes islemi 
    try{
        const userId = this.user;

        const user = await User.findById(userId);
        //Kullanicinin post dizisinden kaldirilmasi
        if(user != null && user.posts.includes(this._id)){
            const index = user.posts.indexOf(this._id);
    
            user.posts.splice(index,1);
            await user.save();
        }
        //Posta ait tum yorumlarin silinmesi
        const comment = await Comment.deleteMany({_id : {$in : this.comments}});
         
    }catch(err){
        return err;
    }
    
});
module.exports = mongoose.model("Post",PostSchema);