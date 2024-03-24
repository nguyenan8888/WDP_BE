import ChatService from "../services/chat.service";

// ** Utils
import { response } from "../utils/baseResponse";

// ** Helpers
import { ApiError } from "../helpers/errorHandle";

import commentService from "../services/comment.service";

class CommentController {
  async deleteComment(req, res) {
    try {
        const {commentId} = req.params
        await commentService.delete(commentId)
        res.status(200).json(
            response.success("Success")
        )
    } catch (err) {
        res.status(400).json(
            new ApiError().badRequest("Delete fail")
        )
    }
  }

  async editComment(req, res) {
    try {
        const {commentId} = req.params
        const {content} = req.body
        await commentService.editComment(commentId, content)
        res.status(200).json(
            response.success("Success")
        )
    } catch (err) {
        res.status(400).json(
            new ApiError().badRequest("Edit fail")
        )
    }
  }
}

export default new CommentController();