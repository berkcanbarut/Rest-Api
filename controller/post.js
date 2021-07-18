const fs = require('fs');
const Post = require("../models/Post");
const asyncHandler = require("express-async-handler");
const CustomError = require('../helpers/error/CustomError');
const Comment = require("../models/Comment");
const User = require("../models/User");
const Internship = require("../models/Internship");
const WorkedPlace = require("../models/WorkedPlace");
const path = require("path");

//Filtresiz Tum Post Verileri
exports.getAllPost = asyncHandler(async (req,res,next) =>{
    const allPost = await Post.find()
        .populate([
            {path: "user", model:"User", select :"name profileImage"},
        ])
        .sort({
            datefield : -1
        })
        .exec();

    res.status(200).json({
        success : true,
        posts : allPost,
    });
})

//Kullanicinin yeni bir post eklemesi
exports.postAddPost = asyncHandler(async (req,res,next) =>{
    const information = req.body;

    const post = await Post.create({
        ...information,
        user : req.user.id,
    })

    res
    .status(201)
    .json({
        success : true,
        data : post,
    })

});

exports.postAddImgToPost = asyncHandler(async (req,res,next) =>{
   
    const {title,content,hashtags} = req.body;
    const post = await Post.create({
        title,
        content,
        hashtags,
        user : req.user.id,
        imgPath : req.savedPostImg,
    })

    return res.status(200).json({
        success : true,
        post : post,
    })
    
});

exports.postAddFileToPost = asyncHandler(async (req,res,next) =>{
   
    const {title,content,hashtags} = req.body;
    const post = await Post.create({
        title,
        content,
        hashtags,
        user : req.user.id,
        filePath : req.savedPostFile,
    })

    return res.status(200).json({
        success : true,
        post : post,
    })
    
});


//Gonderilen ID`e ait gonderi
exports.getSinglePost = asyncHandler(async (req,res,next) =>{
    const {id} = req.params;

    const post = await Post.findById(id)
        .populate([
            {path :"comments", model :"Comment",select:"content author -_id",populate:{path:"author",select : "name profileImage -_id"}},
            {path : "user", model : "User", select:"name profileImage -_id"},])
        .exec();

    if(!post){
        return next(new CustomError("Gönderi bulunamadı. Gönderi silinmiş veya bozulmuş",400));
    }

    res.status(200).json({
        success : true,
        post : post,
    })
});

//Kullanici tarafindan gonderinin guncellenmesi
exports.putEditPost = asyncHandler(async (req,res,next) =>{
    const {id} = req.params;
    const information = req.body;
    const post = await Post.findByIdAndUpdate(id,{
        ...information,
        createAt : Date.now(),
    },{
        new : true,
        runValidators : true,
    })

    res.status(200).json({
        success : true,
        post : post,
    })
});

//Kullanici tarafindan gonderinin silinmesi
exports.deletePost = asyncHandler(async (req,res,next) =>{

    const postId = req.params.id;

    const post = await Post.findById(postId);

    if(post.imgPath != undefined){
        const rootDir = path.dirname(require.main.filename);
        const fileDir = "/public/uploads/postImage/"+ post.imgPath;
        const imgPath = path.join(rootDir,fileDir);
        try{
            fs.unlinkSync(imgPath);
        }
        catch(err){
            return new CustomError("Gönderi silinirken bir server hatası oluştu",500);
        }
            
    }
    if(post.filePath != undefined){
        const rootDir = path.dirname(require.main.filename);
        const fileDir = "/public/uploads/postFile/"+ post.filePath;
        const filePath = path.join(rootDir,fileDir);
        try{
            fs.unlinkSync(filePath);
        }
        catch(err){
            return new CustomError("Gönderi silinirken bir server hatası oluştu",500);
        }
            
    }
    await post.remove();

    return res.status(200).json({
        success : true,
        message : "Post kullanıcı tarafından silindi",
    });
    
});

exports.getLikedPosts = asyncHandler(async (req,res,next) => {
    const posts = await Post.find({
        likes : req.user.id,
    })

    return res.status(200).json({
        success : true,
        posts : posts,
    })
})

//Kullanicin id li posta lik/unlike islemleri
exports.getLike = asyncHandler(async (req,res,next) => {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if(post.likes.includes(userId)){
        const index = post.likes.indexOf(userId);
        post.likes.splice(index,1);
        await post.save();

        res.status(200).json({
            success : true,
            message : "Kullanıcı post beğenisini kaldırdı",
        });
    }
    else {
        post.likes.push(userId);
        await post.save();
        res.status(200).json({
            success : true,
            message : "Post kullanıcı tarafından beğenildi",
        });
    }
})

//Kullanici tarafindan bir posta yorum yapma
exports.postAddCommentToPost = asyncHandler(async (req,res,next) =>{
    const postId = req.params.id;
    const userId = req.user.id;
    const information = req.body;

    const comment = await Comment.create({
        ...information,
        postId : postId,
        author : userId,
    })

    const post = await Post.findById(postId);

    if(post != null){
        post.comments.push(comment._id);
    }
    
    await post.save();

    res.status(200).json({
        success : true,
        comment : comment,
    });
});

exports.deleteCommentToPost = asyncHandler(async (req,res,next) =>{
    const comment = req.comment;

    const post = await Post.findById(comment.postId);

    if(post.comments.includes(this._id)){
        const index = post.comments.indexOf(this._id);
        post.comments.splice(index,1);
    }

    await post.save();
    await comment.remove();

    return res.status(200).json({
        success : true,
        user : {
            _id : req.user.id,
            name : req.user.name,
        },
        message : "Kullanıcı tarafından yorum kaldırıldı",
    });
});

exports.getIdComment = asyncHandler(async (req,res,next) => {

    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate("author").populate("postId").exec();

    res.status(200).json({
        success : true,
        comment : comment,
    });
});

//Postu begenen kullanicilar
exports.getLikedUserToPost = asyncHandler(async (req,res,next) =>{

    const postId = req.params.id;

    const post = await Post.findById(postId).populate({
        path : "likes",
        model : "User",
        select : "name",
    }).select("likes");
    

    res.status(200).json({
        success : true,
        post : post,
    })
});

//Bir postu hashtag parametrelerine gore arama
exports.getSearchPost = asyncHandler(async (req,res,next) => {

    const {searchString} = req.query;
    const posts = await Post.find({
        hashtags : {
            $regex : "^" + searchString + ".*",
            $options : "i",
        }
    })
    .select({
        "title" : 1,
        "hashtags" : 1,
    })
    .populate([
        {path : "user", model : "User", select:"name profileImage -_id"}
    ]).exec();



    res.status(200).json({
        success : true,
        posts : posts,
    })
});
