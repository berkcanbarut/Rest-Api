const express = require("express");
const dotenv = require("dotenv");
const connectToDatabase = require("./helpers/database/connectToDb");
const router = require("./router/index");
const errorRouter = require("./middlewares/error/errorHandler");
const path = require("path");
dotenv.config({
    path : "./config/config.env",
})

//Connect To Database - MongoDB
connectToDatabase();

const PORT = process.env.PORT;

const app = express();

//Express - Body Parser Middleware
//content-type = application/json && application//form-urlencoded
app.use(express.json({limit : "50mb"}));
app.use(express.urlencoded({extended : true,limit : "50mb", parameterLimit : "1000000"}));

// app.set('views', './views');

//Static Files Middleware
app.use("/static",express.static(path.join(__dirname,"public")));

//Api Main - Index Router
app.use("/",router);

//Custom Error Middleware
app.use(errorRouter.errorHandler);


app.listen(PORT,()=>{
    console.log(`Started Rest Api ${PORT} | ${process.env.NODE_ENV}`);
})

