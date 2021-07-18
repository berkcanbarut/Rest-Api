const router = require("express").Router();
const postController = require("../controller/post");
const authHelpers = require("../middlewares/authorization/auth");
const checkPost = require("../helpers/libaries/checkPost");
const uploadImg = require("../helpers/libaries/postImgUpload");
const uploadFile = require("../helpers/libaries/postFileUpload");

router.get("/searchpost",authHelpers.getAccessToUser,postController.getSearchPost);
router.get("/getallpost",authHelpers.getAccessToUser,postController.getAllPost);
router.get("/getpost/:id",authHelpers.getAccessToUser,postController.getSinglePost);

router.put("/:id/edit",authHelpers.getAccessToUser,authHelpers.getAccessToPost,postController.putEditPost);
router.post("/add",authHelpers.getAccessToUser,postController.postAddPost);
router.delete("/:id/delete",authHelpers.getAccessToUser,authHelpers.getAccessToPost,postController.deletePost);

router.get("/:id/like",authHelpers.getAccessToUser,checkPost,postController.getLike);

router.delete("/:id/deletecomment",authHelpers.getAccessToUser,authHelpers.getAccessToComment,postController.deleteCommentToPost);
router.post("/:id/addcomment",authHelpers.getAccessToUser,checkPost,postController.postAddCommentToPost);
router.get("/:id/getcomment",postController.getIdComment);

router.get("/:id/likedusers",authHelpers.getAccessToUser,checkPost,postController.getLikedUserToPost);

router.post("/addimgtopost",uploadImg.single("post_file"),authHelpers.getAccessToUserFileUpload,postController.postAddImgToPost);
router.post("/addfiletopost",uploadFile.single("post_file"),authHelpers.getAccessToUserFileUpload,postController.postAddFileToPost);

router.get("/likedposts",authHelpers.getAccessToUser,postController.getLikedPosts);

module.exports = router;