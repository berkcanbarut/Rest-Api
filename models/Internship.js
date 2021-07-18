const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = require("./User");
const InternshipSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    company : {
        type : String,
        default : "Çalışılan Şirket Belirtilmemiş",
    },
    department : {
        type : String,
        default : "Departman Belirtilmemiş",
    },
    programmingLanguages : {
        type : [String],
    },
}); 

//Silinen staj bilgisini kullanicidan da kaldirma
InternshipSchema.post("remove",{document : true, query : false},async function(){

    const user = await User.findById(this.user);

    if(user.internships.includes(this._id)){
        const index = user.internships.indexOf(this._id);
        user.internships.splice(index,1);
    }

    await user.save();
});

module.exports = mongoose.model("Internship",InternshipSchema);