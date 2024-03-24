import ChatService from "../services/chat.service";

// ** Utils
import { response } from "../utils/baseResponse";

// ** Helpers
import { ApiError } from "../helpers/errorHandle";
import firebaseService from "../services/firebase.service";

class ChatController {
  async getChatContent(req, res, next) {
    const { page, chatId } = req.query;

    try {
      const chat = await ChatService.getChatContent({ chatId, page });

      res.status(200).json(
        response.success({
          data: { chat },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async sendMessage(req, res, next) {
    const files = req.files;
    const { id } = req.user;
    const { content, target_user_id, replyTo = null, isNew } = req.body;

    let images = [];

    try {
      if (id === target_user_id)
        throw new Error("You can't send messages to yourself");

      if (files) {
        images = await firebaseService.uploadToStorage(id, files);
      }

      const data = await ChatService.insertChatMessage({
        targetUserId: target_user_id,
        senderId: id,
        message: {
          content,
          images,
          replyTo,
          user: id,
        },
        isNew,
      });

      res.status(200).json(
        response.success({
          data,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async sendMessageFiles(req, res, next) {
    const { id } = req.user;
    const files = req.files;
    const { content, target_user_id, replyTo = null, isNew } = req.body;

    try {
      const images = await firebaseService.uploadToStorage(id, files);

      const data = await ChatService.insertChatMessage({
        targetUserId: target_user_id,
        senderId: id,
        message: {
          content,
          images,
          replyTo,
          user: id,
        },
        isNew,
      });

      res.status(200).json(
        response.success({
          data,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async getChatsOfUser(req, res, next) {
    const { id } = req.user;
    const { limit, offset } = req.query;

    try {
      const chats = await ChatService.getChats({ limit, offset, userId: id });

      res.status(200).json(
        response.success({
          data: { chats },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async reactMessage(req, res, next) {
    try {
      const { id } = req.user;
      const { chatId, action, messageId } = req.body;

      const message = await ChatService.reactMessage({
        chatId,
        action,
        messageId,
        userId: id,
      });

      res.status(200).json(
        response.success({
          isSuccess: Boolean(message),
          data: { message },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }
}

export default new ChatController();
