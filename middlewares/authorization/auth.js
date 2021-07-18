const CustomError = require("../../helpers/error/CustomError");
const jwt = require("jsonwebtoken");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const Internship = require("../../models/Internship");
const WorkedPlace = require("../../models/WorkedPlace");

//Kullanici erisim (token) kontrol. Dogruluk kontrol
exports.getAccessToUser = (req,res,next) =>{

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        const {JWT_SECRET_KEY} = process.env;
        const authorization = req.headers.authorization;
        const accessToken = authorization.split(":")[1];
        jwt.verify(accessToken,JWT_SECRET_KEY,(err,decoded) =>{
            if(err){
                return next(new CustomError("Lütfen önce oturum açınız",401));
            }
            req.user = {
                id : decoded.id,
                name : decoded.name,
            }
            next();
        })
    }
    else{
        return next(new CustomError("Lütfen önce oturum açınız",401));
    }
    
}

exports.getAccessToUserFileUpload = (req,res,next) =>{

    if(req.body.authorization && req.body.authorization.startsWith("Bearer")){
        const {JWT_SECRET_KEY} = process.env;
        const authorization = req.body.authorization;
        const accessToken = authorization.split(":")[1];
        jwt.verify(accessToken,JWT_SECRET_KEY,(err,decoded) =>{
            if(err){
                return next(new CustomError("Lütfen önce oturum açınız",401));
            }
            req.user = {
                id : decoded.id,
                name : decoded.name,
            }
            next();
        })
    }
    else{
        return next(new CustomError("Lütfen önce oturum açınız",401));
    }
    
}

//Gonderi Bilgisi
exports.getAccessToPost = async (req,res,next) =>{
    const userId = req.user.id;
    const postId = req.params.id;
    
    const post = await Post.findById(postId);
    if(!post){
        return next(new CustomError("Gönderi bulunamadı. Gönderi silinmiş veya bozulmuş",400));
    }

    if(userId != post.user){
        return next(new CustomError("Gönderi üzerindeki işlemler yanlızca gönderi sahibi tarafından yapılabilir",403));
    }
    next();
}

//Staj Bilgisi
exports.getAccessToInternship = async (req,res,next) =>{
    const internshipId = req.params.id;

    const internship = await Internship.findById(internshipId);

    if(internship.user != req.user.id){
        return next(new CustomError("Staj bilgisi üzerindeki işlemleri yanlızca profil sahibi tarafından yapılabilir",403));
    }

    req.internship = internship;

    next();
}

exports.getAccessToWorkedPlace = async (req,res,next) =>{
    const workedPlaceId = req.params.id;

    const workedPlace = await WorkedPlace.findById(workedPlaceId);

    if(workedPlace.user != req.user.id){
        return next(new CustomError("Staj bilgisi üzerindeki işlemleri yanlızca profil sahibi tarafından yapılabilir",403));
    }

    req.workedPlace = workedPlace;

    next();
}

exports.getAccessToComment = async (req,res,next) => {

    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if(comment.author != req.user.id){
        return next(new CustomError("Yorum üzerindeki işlemleri yanlızca sahibi tarafından yapılabilir",403));
    }

    req.comment = comment;
    next();
}