const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = require('./User');
const WorkedPlaceSchema = Schema({
    user : {
        type : Schema.Types.ObjectId,
        require : true,
    },
    company : {
        type : String,
        default : "Çalışılan Şirket Belirtilmemiş",
    },
    department : {
        type : String,
        default : "Departman Belirtilmemiş",
    },
    project : {
        type : String,
    },
    programmingLanguages : {
        type : [String],
    },
    technologys : {
        type : [String],
    },
    timeWorked : {
        type : String,
    }
});

WorkedPlaceSchema.post("remove",{document : true,query:false},async function(){
    const user = await User.findById(this.user);

    if(user.workedplaces.includes(this._id)){
        const index = user.workedplaces.indexOf(this._id);
        user.workedplaces.splice(index,1);
    }

    await user.save();
})

module.exports = mongoose.model("WorkedPlace",WorkedPlaceSchema);