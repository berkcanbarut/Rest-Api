const express = require("express");

//Kullanici Islemleri
const userRouter = require("./auth");
//Post Islemleri
const postRouter = require("./post");

const router = express.Router();


router.use("/auth",userRouter);
router.use("/post",postRouter);


module.exports = router;