const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Internship = require("../models/Internship");
const asyncHandler = require("express-async-handler");
const authHelpers = require("../helpers/authorization/authHelpers");
const CustomError = require('../helpers/error/CustomError');
const sendGridMail = require('../helpers/libaries/sendGridMail');
const WorkedPlace = require("../models/WorkedPlace");


//Kullanici Kayit
exports.postRegister =  asyncHandler(async (req,res,next) => {
    
    const {name,email,password,university,branch} = req.body;

    const userControl = await User.find({
        $or : [
            {
                name : name,
            },
            {
                email : email,
            }
        ]
    })

    if(userControl.length > 0){
        return next(new CustomError("Kullanıcı adı veya email adresi zaten kullanımda. Lütfen tekrar deneyiniz.",400));
    }
    const user = await User.create({
        name,
        email,
        password,
        university,
        branch,
    });
    return authHelpers.sendVerifactionMail(user,res,next);
    //return authHelpers.createToken(user,res);
});

//Kullanici Kendi Profil Bilgileri
exports.getUserProfile = asyncHandler(async (req,res,next) =>{
    const {id,name} = req.user;
    res.status(200).json({
        success : true,
        data : {
            id : id,
            name : name,
        }
    })
})

//Kullanici Giris
exports.postLogin = asyncHandler (async (req,res,next) =>{

    const {email,password} = req.body;

    if(!(email && password)){
        return next(new CustomError("Email ve parola bilgilerini eksiksiz giriniz",400));
    }

    const user = await User.findOne({email : email}).select("+password");

    if(!user){
        return next(new CustomError("Bu emaile ait hesap bulunamadı.",400));
    }

    if(authHelpers.comparePassword(password,user.password)){
        if(user.verification === false){
            return next(new CustomError("Lütfen email adresinizi onaylayınız",400));
        }
        return authHelpers.createToken(user,res);
    }
    else {
        return next(new CustomError("Email veya parola bilgisi yanlış",400));
    }
    
});

//Kullanici hesabindan cikis
exports.getLogout = asyncHandler(async (req,res,next) => {

    res.status(200).clearCookie("access_token",{
        httpOnly : true,
        secure : false,
    }).json({
        success : true,
        message : "Oturum sonlandırıldı",
    })
})

exports.getSingleUser = asyncHandler(async (req,res,next) =>{
    const {id} = req.params;

    const user = await User.findById(id).populate([
        {path : "posts",model :"Post", select : "-user"},
        {path : "internships",model :"Internship", select : "-user"},
        {path : "workedplaces",model :"WorkedPlace", select : "-user"}]
        ).exec();

    if(!user){
        return next(new CustomError("Bu kullanıcı bulunamadı",400));
    }

    res
    .status(200)
    .json({
      success : true,
      data : user,  
    })
})

//Hesap profil fotografi upload
exports.postUploadImg = asyncHandler(async (req,res,next) => {

    const user = await User.findById(req.user.id);

    if(user.profileImage != "default.jpg"){
        const rootDir = path.dirname(require.main.filename);
        const fileDir = "/public/uploads/image/"+ user.profileImage;
        const imgPath = path.join(rootDir,fileDir);
    
        try{
            fs.unlinkSync(imgPath);
        }
        catch(err){
            next(new CustomError("Profil fotoğrafı kaldırma işlemi sırasında server hatası oldu lütfen daha sonra tekrar deneyiniz",500));
        } 
    }

    user.profileImage = req.savedProfileImg;

    await user.save();

    res.status(200).json({
        success : true,
        message : "Profil fotoğrafı yüklendi :" + req.savedProfileImg,
    })
});

//Hesap profil fotografi delete
exports.deleteImg = asyncHandler(async (req,res,next) => {

    const user = await User.findById(req.user.id);

    const rootDir = path.dirname(require.main.filename);
    const fileDir = "/public/uploads/userImage/"+ user.profileImage;
    const imgPath = path.join(rootDir,fileDir);

    try{
        fs.unlinkSync(imgPath);
    }
    catch(err){
        next(new CustomError("Profil fotoğrafı kaldırma işlemi sırasında server hatası oldu lütfen daha sonra tekrar deneyiniz",500));
    }

    user.profileImage = "default.jpg";

    await user.save();
    
    
    res.status(200).json({
        success : true,
        message : "Profil fotoğrafı silindi.",
    })
});

//Kullanici email onaylama
exports.getAccessVerification = asyncHandler(async (req,res,next) => {
    const {verificationToken} = req.query;

    if(verificationToken == undefined){
        return next(new CustomError("Onay maili tokenı bulunmamaktadır",400));
    }
    const user = await User.findOne({verificationToken : verificationToken });
    if(!user){
        return next(new CustomError("Bu emaile ait hesap bulunamadi",400));
    }
    user.verification = true,
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).send(`
        <h1>Mezunlar Buluşuyor Platformumuza Hoşgeldiniz</h1>
        <h3>*** Email adresiniz onaylandı ***</h3>
    `
    )
})

//Kullanici parola sifirlama istegi
exports.postForgotPassword = asyncHandler(async (req,res,next)=>{

    const {email} = req.body;
    const {SENDGRID_MAIL} =process.env;

    const user = await User.findOne({email : email});

    if(!user){
        return next(new CustomError("Bu emaile ait hesap bulunamadi",400));
    }

    const resetPasswordToken = user.resetPasswordToken();
    await user.save();

    const resetPasswordUrl = `http://localhost:5000/auth/resetpassword`;

    const resetHtml = `
    <div style="width: 75%;margin-left: auto; margin-right: auto;"> 
      <h1 style="font-weight: bold;color: gray;">Mezunlar Buluşuyor</h1>
      <p style="color:gray;font-size:18px">
          Emailinize ait hesabınız için şifre sıfırlama talebinde bulundunuz. Lütfen belirlediğiniz yeni
          şifreyi gerekli alana girerek şifre sıfırlama işlemini tamamlayınız.
      </p>
      <div >
          <form action="${resetPasswordUrl}" method="post">
              <div class="mb-3">
                  <input type="hidden" id="resetPasswordToken" name="resetPasswordToken" value="${resetPasswordToken}">
                  <label for="resetPassword" style="color:rgb(80, 80, 80);font-size:20px" >Şifre :</label>
                  <input type="password"  id="resetPassword" name="resetPassword" style="
                  width: 100%;
                  padding: 12px 20px;
                  margin: 8px 0;
                  box-sizing: border-box;
                  background-color: #7ed1ec;
                  color: white;
                  border: none;
                  border-bottom: 5px solid #006385;">
              </div>
              <button type="submit" style="
              background-color: #008CBA;
              font-weight: bold;
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;">Şifreyi Sıfırla</button>
          </form>
      </div>
      <p style="color:#f44336;font-size:14">
          *** Hesabınız için şifre sıfırlama isteği sizin tarafınızdan gerçekleşmediyse lütfen linke tıklamayınız. ***
      </p>
      
    </div>
    `
    const msg = {
        to: email, // Change to your recipient
        from: SENDGRID_MAIL, // Change to your verified sender
        subject: 'Mezunlar Buluşuyor - Hesap Şifre Sıfırlama',
        html: resetHtml,
    }

    try{
        await sendGridMail(msg);

        res.status(200).json({
            success : true,
            message : "Şifre sıfırlama isteğiniz alındı. Lütfen email adresinizi kontrol ediniz.",
        });
    }
    catch(err){
        console.log(err);
        user.passwordToken = undefined;
        user.passwordTokenExpire = undefined;
        await user.save();
        return next(new CustomError("Server hatası oluştu. Email gönderilemedi lütfen daha sonra tekrar deneyiniz",500));
    }
    
    
})

//Kullanici sifre sifirlama
exports.postResetPassword = asyncHandler(async(req,res,next)=>{
    const {resetPassword,resetPasswordToken} = req.body;

    
    if(!resetPasswordToken){
        return next(new CustomError("Lütfen token değerini kontrol ediniz",400));
    }

    if(resetPassword == "" || resetPassword == undefined){
        return next(new CustomError("Lütfen yeni şifre değerini boş bırakmayınız",400));
    }
    const user = await User.findOne({
        passwordToken : resetPasswordToken,
        passwordTokenExpire : {$gt : Date.now()}
    })


    if(!user){
        return next(new CustomError("Bu tokena ait mail bulunamadı veya token süresi dolmuş",400));
    }
    user.password = resetPassword;
    user.passwordToken = undefined;
    user.passwordTokenExpire = undefined;
    await user.save();

    return res.status(200).send(`
    <div style="width: 75%;margin-left: auto; margin-right: auto;"> 
        <h1 style="font-weight: bold;color: gray;">Mezunlar Buluşuyor</h1>
        <p style="color:gray;font-size:18px">
            Hesabınızın şifresi başarılı bir şekilde güncellendi.
        </p>
    </div>
    `)
})

//Kullanici bilgilerinin guncellenmesi
exports.putEditDetails = asyncHandler(async (req,res,next)=>{

    const editDetails = req.body;

    const id = req.user.id;
    const user = await User.findByIdAndUpdate(id,editDetails,{
        new : true,
        runValidators : true,
    })

    res.status(200).json({
        success : true,
        data : user,
    })
});

//Bir kullaniciyi gelen arama stringine gore bulma
exports.getSearchUser = asyncHandler(async (req,res,next) =>{
    const {searchString} = req.query;

    const users = await User.find({
        name : {
            $regex : "^" + searchString + ".*",
            $options : "i",
        }
    })
    .select({
        "name" : 1,
        "university" : 1,
        "branch" : 1,
        "profileImage" : 1,
    })
    
    return res.status(200).json({
        success : true,
        data : users,
    })
});
//Kullanicinin kullandigi programlama diline gore arama
exports.getSearchCompany = asyncHandler(async (req,res,next) =>{
    const {searchString} = req.query;

    const users = await User.find().populate([
        {path : "internships", model : "Internship", select : "company -_id",
            match :{
                company : {
                    $regex : "^" + searchString + ".*",
                    $options : "i",
                }
            }
        },
        {path : "workedplaces", model : "WorkedPlace", select : "company -_id",
            match :{
                company : {
                    $regex : "^" + searchString + ".*",
                    $options : "i",
                }
            }
        },
    ])
    .select({
        "name" : 1,
        "university" : 1,
        "branch" : 1,
        "profileImage" : 1,
    });


    const userList = users.filter(user => {
        if(user.internships.length > 0 || user.workedplaces.length > 0){
            return user;
        }
        return null;
    });

    const data = userList.map(user => {
        return {
            _id : user._id,
            name : user.name,
            university : user.university,
            branch : user.branch,
            profileImage : user.profileImage,
        }
    })


    return res.status(200).json({
        success : true,
        users : data,
    });

});

//Kullanicinin kullandigi programlama diline gore arama
exports.getSearchProgrammingLanguage = asyncHandler(async (req,res,next) =>{
    const {searchString} = req.query;

    const users = await User.find().populate([
        {path : "internships", model : "Internship", select : "programmingLanguages -_id",
            match :{
                programmingLanguages : {
                    $regex : "^" + searchString + ".*",
                    $options : "i",
                }
            }
        },
        {path : "workedplaces", model : "WorkedPlace", select : "programmingLanguages -_id",
            match :{
                programmingLanguages : {
                    $regex : "^" + searchString + ".*",
                    $options : "i",
                }
            }
        },
    ])
    .select({
        "name" : 1,
        "university" : 1,
        "branch" : 1,
        "profileImage" : 1,
    });


    const userList = users.filter(user => {
        if(user.internships.length > 0 || user.workedplaces.length > 0){
            return user;
        }
        return null;
    });

    const data = userList.map(user => {
        return {
            _id : user._id,
            name : user.name,
            university : user.university,
            branch : user.branch,
            profileImage : user.profileImage,
        }
    })

    return res.status(200).json({
        success : true,
        users : data,
    });

});

//Id li kullaniciyi takip etme / takipten cikarma
exports.getFollowedUser = asyncHandler(async (req,res,next) =>{
    const followingId = req.params.id;

    const followingUser = await User.findById(followingId);

    if(followingUser == null){
        return res.status(400).json({
            success : false,
            message : "Bu id değerine ait kullanıcı bulunamadı."
        })
    }

    const currentUser = await User.findById(req.user.id);

    //takipten cikma
    if(followingUser.follower.includes(req.user.id)){
        let index = followingUser.follower.indexOf(req.user.id);
        followingUser.follower.splice(index,1);

        index = currentUser.following.indexOf(followingUser._id); 
        currentUser.following.splice(index,1);

        await currentUser.save();
        await followingUser.save();

        return res.status(200).json({
            success : true,
            message : "Kullanıcı takipten çıkarıldı.",
        })
    }

    followingUser.follower.push(req.user.id);
    currentUser.following.push(followingUser._id);


    await currentUser.save();
    await followingUser.save();
    
    return res.status(200).json({
        success : true,
        message : "Kullanıcı takibe alındı."
    })

});

//Kullanicin Staj Bilgisi Eklemesi
exports.postInternship = asyncHandler(async (req,res,next) => {

    const {company,department,programmingLanguages} = req.body;

    const internship = await Internship.create({
        user : req.user.id,
        company,
        department,
        programmingLanguages,
    });
    await internship.save();
    const user = await User.findById(req.user.id);

    user.internships.push(internship._id);

    await user.save();

    const data = {
        name : user.name,
        internship,
    }

    res.status(200).json({
        success : true,
        data : data,
    });
});

//Kullanicinin staj bilgisini kaldirmasi
exports.deleteInternship = asyncHandler(async (req,res,next) =>{
    const internship = req.internship;

    await internship.remove();
    
    return res.status(200).json({
        success : true,
        message : "Staj bilgisi kullanıcı tarafından bilgisi silindi",
    })
    
});

//Kullanicin staj bilgisini guncellemesi
exports.putEditInternship = asyncHandler(async (req,res,next) => {
    const internshipId = req.params.id;
    const editInternship = req.body;

    const internship = await Internship.findByIdAndUpdate(internshipId,editInternship,{
        new : true,
        runValidators : true,
    })

    return res.status(200).json({
        success : true,
        user : {
            _id : req.user.id,
            name : req.user.name,
        },
        internship : {
            company : internship.company,
            department : internship.department,
            programmingLanguages : internship.programmingLanguages,
        }
    })  
});

//Kullanicin calisma gecmisi eklemesi
exports.postWorkedPlace = asyncHandler(async (req,res,next) => {
    const workedPlaceData = req.body;

    const workedPlace = await WorkedPlace.create({
        ...workedPlaceData,
        user : req.user.id,
    });
    
    const user = await User.findById(req.user.id);

    user.workedplaces.push(workedPlace._id);

    await user.save();
    return res.status(200).json({
        success : true,
        user : {
            _id : req.user.id,
            name : req.user.name,
        },
        workedPlace : workedPlace,
    })
})

//Kullanicinin calisma gecmisini kaldirmasi
exports.deleteWorkedPlace = asyncHandler(async (req,res,next) => {
    const workedPlace = req.workedPlace;

    await workedPlace.remove();

    return res.status(200).json({
        success : true,
        message : "Çalışma geçmişi kullanıcı tarafından silindi",
    })
})

//Kullanicini calisma gecmisini guncellemsi
exports.putEditWorkedPlace = asyncHandler(async (req,res,next) => {
    const workedPlaceId = req.params.id;
    const editworkedPlace = req.body;

    const workedPlace = await WorkedPlace.findByIdAndUpdate(workedPlaceId,editworkedPlace,{
        new : true,
        runValidators : true,
    })

    return res.status(200).json({
        success : true,
        user : {
            _id : req.user.id,
            name : req.user.name,
        },
        workedPlace : workedPlace,
    })
});

exports.postAddTranscript = asyncHandler(async (req,res,next) => {

    const user = await User.findById(req.user.id);

    if(user.transcript != undefined) {
        
        const rootDir = path.dirname(require.main.filename);
        const fileDir = "/public/uploads/userTranscript/"+ user.transcript;
        const transcriptPath = path.join(rootDir,fileDir);
    
        try{
            fs.unlinkSync(transcriptPath);
        }
        catch(err){
            next(new CustomError("Transkript belgesini yukleme işlemi sırasında server hatası oldu lütfen daha sonra tekrar deneyiniz",500));
        }

    }

    user.transcript = req.savedTranscript;

    await user.save();

    return res.status(200).json({
        success : true,
        message : "Kullanıcı tarafından transkript yüklendi : " + req.savedTranscript 
    })

});

exports.deleteTranscript = asyncHandler(async (req,res,next) => {

    const user = await User.findById(req.user.id);

    const rootDir = path.dirname(require.main.filename);
    const fileDir = "/public/uploads/userTranscript/"+ user.transcript;
    const transcriptPath = path.join(rootDir,fileDir);

    try{
        fs.unlinkSync(transcriptPath);
    }
    catch(err){
        next(new CustomError("Transkript belgesini kaldırma işlemi sırasında server hatası oldu lütfen daha sonra tekrar deneyiniz",500));
    }

    user.transcript = undefined;

    await user.save();

    return res.status(200).json({
        success : true,
        message : "Kullanıcı tarafından transkript belgesi kaldırıldı.",
        user : {
            _id : req.user.id,
            name : req.user.name,
        }
    })

});