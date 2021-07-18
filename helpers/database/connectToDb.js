const mongoose = require("mongoose");

const connectToDatabase = () =>{

    mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() =>{
        console.log("Connected to Database");
    }
    )
    .catch(err =>{
        console.log("Connection Error : "+ err);
    })
}

module.exports = connectToDatabase;