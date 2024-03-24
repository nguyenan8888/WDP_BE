// ** Express
import express from "express";

// ** Controllers
import UserController from "../../controllers/user.controller";

// ** Middleware
import { userValidation } from "../../middlewares/validate-data/user";
import { upload } from "../../configs/multer";

const router = express.Router();

router.get("/profile/:userId", UserController.profile);
router.put("/editProfile", upload.single('avatar'), userValidation.editProfile() ,UserController.editProfile);
router.post("/follow/:friendId", UserController.follow);
router.put("/changePassword", userValidation.changePassword(), UserController.changePassword);
router.get("/getFollowers/:userId", UserController.getFollowers);
router.get("/getFollowing/:userId", UserController.getFollowing);
router.get("/search", UserController.searchUser);
router.patch("/savePost/:postId", UserController.savePost);
router.get("/getSavedPosts", UserController.getSavedPosts);
router.patch("/unSavePost/:postId", UserController.unSavePost);
router.get("/allUsers", UserController.allUsers);
router.patch("/editRole/:userId", UserController.editUserRole);
router.patch("/lockAccount/:userId", UserController.lockAccount);
router.patch("/blockUser/:blockedUserId", UserController.blockUser);
router.get("/conversation", UserController.getUserCanConversation)
router.get("/accountLocked", UserController.getTotalAccountLocked)
export default router;