// ** Express
import express from "express";
import commentController from "../../controllers/comment.controller";

// ** Controllers

const router = express.Router();

router.delete("/:commentId", commentController.deleteComment);
router.patch("/:commentId", commentController.editComment);

export default router;