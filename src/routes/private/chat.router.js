// ** Express
import express from "express";

// ** Controllers
import ChatController from "../../controllers/chat.controller";

// ** Middleware
import { chatValidation } from "../../middlewares/validate-data/chat";
import { authChat } from "../../middlewares/auth/chat";
import { upload } from "../../configs/multer";

const router = express.Router();

router.get(
  "/",
  chatValidation.chatContent(),
  authChat.canGetChatContent,
  ChatController.getChatContent
);

router.get("/list", chatValidation.getChats(), ChatController.getChatsOfUser);

router.post(
  "/message",
  // chatValidation.sendMessage(),
  upload.array("files"),
  ChatController.sendMessage
);

router.post(
  "/message/upload",
  upload.array("files"),
  ChatController.sendMessageFiles
);

router.post(
  "/message/react",
  chatValidation.reactMessage(),
  ChatController.reactMessage
);

export default router;
