const express = require("express");
const authController = require("../controller/auth");
const accessMiddleware = require("../middlewares/authorization/auth");
const router = express.Router();
const multer = require("multer");
const {storage,fileFilter} = require("../helpers/libaries/userImgUpload"); 
const upload = require("../helpers/libaries/transcriptUpload");

router.post("/register",authController.postRegister);
router.get("/verification",authController.getAccessVerification);

router.post("/login",authController.postLogin);
router.get("/logout",accessMiddleware.getAccessToUser,authController.getLogout);

router.get("/profile",accessMiddleware.getAccessToUser,authController.getUserProfile);

router.get("/getuser/:id",accessMiddleware.getAccessToUser,authController.getSingleUser);
router.put("/editDetails",accessMiddleware.getAccessToUser,authController.putEditDetails);

router.get("/searchuser",accessMiddleware.getAccessToUser,authController.getSearchUser);
router.get("/searchpl",accessMiddleware.getAccessToUser,authController.getSearchProgrammingLanguage);
router.get("/searchcompany",accessMiddleware.getAccessToUser,authController.getSearchCompany);

router.get("/follow/:id",accessMiddleware.getAccessToUser,authController.getFollowedUser);

router.post("/forgotpassword",authController.postForgotPassword)
router.post("/resetpassword",authController.postResetPassword);

router.post("/workedplace/add",accessMiddleware.getAccessToUser,authController.postWorkedPlace);
router.delete("/workedplace/delete/:id",accessMiddleware.getAccessToUser,accessMiddleware.getAccessToWorkedPlace,authController.deleteWorkedPlace);
router.put("/workedplace/edit/:id",accessMiddleware.getAccessToUser,accessMiddleware.getAccessToWorkedPlace,authController.putEditWorkedPlace);

router.post("/internship/add",accessMiddleware.getAccessToUser,authController.postInternship);
router.delete("/internship/delete/:id",accessMiddleware.getAccessToUser,accessMiddleware.getAccessToInternship,authController.deleteInternship);
router.put("/internship/edit/:id",accessMiddleware.getAccessToUser,accessMiddleware.getAccessToInternship,authController.putEditInternship);

router.delete("/deletetranscript",accessMiddleware.getAccessToUser,authController.deleteTranscript);
router.post("/addtranscript",upload.single("transcript"),accessMiddleware.getAccessToUserFileUpload,authController.postAddTranscript)

router.post("/profileImage",accessMiddleware.getAccessToUser,multer({storage,fileFilter}).single("profile_image"),authController.postUploadImg);
router.delete("/profileImage",accessMiddleware.getAccessToUser,authController.deleteImg);

module.exports = router;