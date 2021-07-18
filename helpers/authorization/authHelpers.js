const bcrypt = require("bcryptjs");
const CustomError = require("../error/CustomError");
const sendGridMail = require("../libaries/sendGridMail");
//Kullanici girisinde token olusturuluyor. response cookielerine bu token kaydediliyor.
//geriye token ve user bilgileri donuluyor.
exports.createToken = (user,res) =>{

    const token =  user.generateJwtFromUser();

    return res
    .status(200)
    .cookie("access_token",token,{
        httpOnly : true,
        secure : false,
        expires : new Date(Date.now() * Number(process.env.COOKIE_EXPIRE) * 1000 * 60),
    })
    .json({
        success : true,
        access_token : token,
        data : {
            id : user.id,
            name : user.name,
            email : user.email,
        }
    })
}

//Kullanici girisindeki parola dogrulugu kontrol ediliyor
exports.comparePassword = (password,hashedPassword) =>{

    return bcrypt.compareSync(password,hashedPassword);
}

//Kullanici kayit olunan emaili onaylama maili gonderimi
exports.sendVerifactionMail = async (user,res,next) =>{
    const {SENDGRID_MAIL} =process.env;
    const token = user.verificationMail();
    const tokenUrl = `http://localhost:5000/auth/verification?verificationToken=${token}`;

    try {
        user.verifactionToken = token;
        await user.save();
        const msg = {
            to: user.email, // Change to your recipient
            from: SENDGRID_MAIL, // Change to your verified sender
            subject: 'Mezunlar Buluşuyor',
            html: `
            <h1>Mezunlar Buluşuyor</h1>
            <p stlye="font-size: 20px;">
                Platformumuza hoşgeldiniz. Hesabınıza giriş yapmak için email adresinizi onaylamanız gerekmektedir.
                Hesabınızı doğrulamak için aşağıdaki bağlantı linkine tıklayınız.
            </p>
            <p>
                <a href=${tokenUrl} target="_blank" style="
                    background-color: #008CBA;
                    border: none;
                    color: white;
                    padding: 15px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    cursor: pointer;">
                    Hesabımı Doğrula
                </a> 
            </p>
            <p style="color:#f44336;font-size:14">
                *** Hesabınızla platforma kayıt işlemi sizin tarafınızdan gerçekleşmediyse lütfen linke tıklamayınız. ***
            </p>
            `,
        }
        await sendGridMail(msg);
        res.status(201).json({
            success : true,
            message : "Hesabınıza giriş için email adresini doğrulamanız gerekmektedir. Lütfen email adresinizi kontrol ediniz.",
        });
    }
    catch(err){
        console.log(err);
        await user.remove();
        return next(new CustomError("Server hatası oluştu. Email gönderilemedi lütfen daha sonra tekrar deneyiniz",500));
    }
}
