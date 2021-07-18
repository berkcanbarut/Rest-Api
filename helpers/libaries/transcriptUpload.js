const multer = require("multer");
const path = require("path");
const CustomError = require("../error/CustomError");
const storage = multer.diskStorage({
    //Dosyanin nereye kayit olacagini belirtiyoruz
    destination : function(req,file,cb){
        const rootDir = path.dirname(require.main.filename);
        cb(null,path.join(rootDir,"/public/uploads/userTranscript"));
    },
    //Dosyanin hangi isimle kayit edilecegini belirtiyoruz
    filename : function(req,file,cb){
        //File - mimetype = {image/png,image/jpg,image/jpeg}
        const extension = file.mimetype.split("/")[1];
        
        req.savedTranscript = "t_" + Date.now() + "."+ extension;

        cb(null,req.savedTranscript);
    }
});

const fileFilter = (req,file,cb) =>{
    const ext = path.extname(file.originalname);
    let allowedMimetypes = [".pdf",".doc",".docx"];

    if(!allowedMimetypes.includes(ext)){
        
        return cb(new CustomError("Lütfen pdf,doc,docx uzantılı dosya gönderiniz",400),false);
    }

    return cb(null,true);
}


module.exports = multer({storage : storage,fileFilter: fileFilter});