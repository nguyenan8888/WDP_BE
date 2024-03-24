import { authConstant } from "../../constants";
import { ApiError } from "../../helpers/errorHandle";
import chatService from "../../services/chat.service";

export const authChat = {
  canGetChatContent: async (req, res, next) => {
    const { id } = req.user;
    const { chatId } = req.query;

    const can = await chatService.canGetChatContent({ chatId, userId: id });

    try {
      if (can) return next();
      else throw new Error(authConstant.UNAUTHORIZED);
    } catch (err) {
      next(new ApiError(403, err.message));
    }
  },
};
