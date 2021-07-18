const Post = require("../../models/Post");
const CustomError = require("../error/CustomError");
const checkPost = (req,res,next) =>{
    const postId = req.param.id;

    const post = Post.findById(postId).select("name");

    if(!post){
        return next(new CustomError("Gönderi bulunamadı. Gönderi silinmiş veya bozulmuş",404));
    }

    next();
}

module.exports = checkPost;