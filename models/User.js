const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cyrpto = require("crypto");
const CustomError = require("../helpers/error/CustomError");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name : {
        type : String,
        required : [true,"Kullanıcı adı zorunlu alandır."],
    },
    email : {
        type : String,
        required : [true,"Email zorunlu alandır."],
        unique : [true,"Bu hesap zaten kullanımda"],
        match : [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Lütfen geçerli bir email giriniz"],
    },
    password : {
        type : String,
        required : [true,"Parola zorunlu alandır."],
        minlenght : 6,
        select : false,
    },
    verification :{
        type : Boolean,
        default : false,
    },
    verificationToken : {
        type : String
    },
    about : {
        type : String,
    },
    createAt : {
        type : Date,
        default : Date.now,
    },
    university : {
        type : String,
        default : "Üniversite Belirtilmemiş"
    },
    branch : {
        type : String,
        default : "Bölüm Belirtilmemiş"
    },
    gpa : {
        type : String,
    },
    internships : {
        type : [Schema.Types.ObjectId],
        ref : "Internship"
    },
    workedplaces : {
        type : [Schema.Types.ObjectId],
        ref : "WorkedPlace",
    },
    profileImage : {
        type : String,
        default : "default.jpg"
    },
    transcript : {
        type : String,
    },
    posts: {
        type : [Schema.Types.ObjectId],
        ref : "Post",
    },
    following : {
        type : [Schema.Types.ObjectId],
        ref : "User",
    },
    follower : {
        type : [Schema.Types.ObjectId],
        ref : "User",
    },
    passwordToken : {
        type : String,
    },
    passwordTokenExpire : {
        type : Date,
    },
}
);
//UserSchema Methods
UserSchema.methods.generateJwtFromUser = function (){
    const {JWT_SECRET_KEY,JWT_EXPIRE} = process.env;
    //Payload - Secret Data
    const payload = {
        id : this._id,
        name : this.name,
    }

    const token = jwt.sign(payload,JWT_SECRET_KEY,{
        expiresIn : JWT_EXPIRE,
        algorithm : "HS256",
    });

    return token;
}

UserSchema.methods.verificationMail = function() {
    const randomHexString = cyrpto.randomBytes(15).toString("hex");

    const resetTokenHash = cyrpto.createHash("SHA256").update(randomHexString).digest("hex");

    this.verificationToken = resetTokenHash;
    return resetTokenHash;
}

UserSchema.methods.resetPasswordToken = function (){
    const {RESET_PASSWORD_EXPIRE} = process.env;
    const randomHexString = cyrpto.randomBytes(15).toString("hex");

    const resetTokenHash = cyrpto.createHash("SHA256").update(randomHexString).digest("hex");

    this.passwordToken = resetTokenHash;
    this.passwordTokenExpire = Date.now() + Number(RESET_PASSWORD_EXPIRE);

    return resetTokenHash;
}

//Pre Hooks
UserSchema.pre("save",function(next){
    //Password Not Update - Next()
    if(!this.isModified("password")){
        next();
    }

    //User register or password update
    bcrypt.genSalt(10, (err, salt)=> {
        if(err){
            //Save Error
            return next(err);
        }
        bcrypt.hash(this.password, salt, (err, hash)=> {
            if(err){
                //Hash Error
                return next(err);
            }
            this.password = hash;
            next();
        });
    });

});

module.exports = mongoose.model("User",UserSchema);