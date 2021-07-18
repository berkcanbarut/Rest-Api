const multer = require("multer");
const CustomError = require("../../helpers/error/CustomError");
const path = require("path");


const storage = multer.diskStorage({
    //Dosyanin nereye kayit olacagini belirtiyoruz
    destination : function(req,file,cb){
        console.log("Destination");
        const rootDir = path.dirname(require.main.filename);

        cb(null,path.join(rootDir,"/public/uploads"));
    },
    //Dosyanin hangi isimle kayit edilecegini belirtiyoruz
    filename : function(req,file,cb){
        console.log("FileName");
        //File - mimetype = {image/png,image/jpg,image/jpeg}
        const extension = file.mimetype.split("/")[1];

        req.savedProfileImg = "profilImg_" + req.user.id + "."+ extension;

        cb(null,req.savedProfileImg);
    }
});

const fileFilter = (req,file,cb) =>{
    let allowedMimetypes = ["image/png","image/jpg","image/jpeg"];

    if(!allowedMimetypes.includes(file.mimetype)){
        return cb(new CustomError("Lütfen png,jpg,jpeg uzantılı dosya gönderiniz",400));
    }

    return cb(null,true);
}

const profileImgUpload = multer({storage : storage,fileFilter : fileFilter});

module.exports = profileImgUpload;