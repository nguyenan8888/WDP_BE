// ** Express
import express from "express";

// ** Controllers
import PostController from "../../controllers/post.controller";

import { upload } from "../../configs/multer";
import { postValidation } from "../../middlewares/validate-data/post";
const router = express.Router();

router.get("/getPosts", PostController.newFeed);
router.get("/likes", PostController.getPostLikes)
router.get("/comments", PostController.getPostComments)
router.get("/saved", PostController.getPostSaved)
router.post("/createPost", upload.array('files'), postValidation.createPost(), PostController.createPost);
router.get("/personalPosts/:userId", PostController.personalPosts);
router.patch("/reactPost/:postId", PostController.reactPost);
router.put("/editPost/:postId", upload.array('files'), PostController.editPost);
router.get("/postDetail/:postId", PostController.getPostDetail)
router.get("/getComments/:postId", PostController.getComments);
router.get("/getAllPosts", PostController.getAllPosts);
router.delete("/:postId", PostController.delete)
router.patch("/setComment/:postId", PostController.setComment)
router.patch("/setPublic/:postId", PostController.setPublic)


export default router;