const CustomError = require("../../helpers/error/CustomError");
exports.errorHandler = (err,req,res,next) => {
    
    let customError = err;

    if(err.name == "SyntaxError") {
        customError = new CustomError("UnexpectedSyntax Error",400);
    }

    if(err.name == "CastError") {
        customError = new CustomError("MongoError : Hatalı ObjectId yapısı",400);
    }
    if(err.code == 11000) {
        customError = new CustomError("MongoError : Eşsiz olmayan veri",400);
    }
    
    //console.log(customError.message,customError.status);
    res.status(customError.status || 500).json({
        success : false,
        message : customError.message,
    })
}