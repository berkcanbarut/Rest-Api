const multer = require("multer");
const path = require("path");
const CustomError = require("../error/CustomError");
const storage = multer.diskStorage({
    //Dosyanin nereye kayit olacagini belirtiyoruz
    destination : function(req,file,cb){
        const rootDir = path.dirname(require.main.filename);

        cb(null,path.join(rootDir,"/public/uploads/userImage"));
    },
    //Dosyanin hangi isimle kayit edilecegini belirtiyoruz
    filename : function(req,file,cb){
        //File - mimetype = {image/png,image/jpg,image/jpeg}
        const extension = file.mimetype.split("/")[1];

        req.savedProfileImg = "pi_" + req.user.id + "."+ extension;

        cb(null,req.savedProfileImg);
    }
});

const fileFilter = (req,file,cb) =>{
    let allowedMimetypes = ["image/png","image/jpg","image/jpeg"];

    if(!allowedMimetypes.includes(file.mimetype)){
        return cb(new CustomError("Lütfen png,jpg,jpeg uzantılı dosya gönderiniz",400),false);
    }

    return cb(null,true);
}

module.exports = {
    fileFilter,
    storage,
}