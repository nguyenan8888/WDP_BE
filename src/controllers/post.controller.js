import PostService from "../services/post.service";
import CommentService from "../services/comment.service";
import { response } from "../utils/baseResponse";

import { ApiError } from "../helpers/errorHandle";
import { jwtService } from "../utils/jwt";
import { message } from "../helpers/message";

class PostController {
  async newFeed(req, res, next) {
    const userId = req.user.id;
    try {
      const posts = await PostService.getNewFeed(userId);
      res.status(200).json(
        response.success({
          data: { posts },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async createPost(req, res, next) {
    const data = req.body;
    const userId = req.user.id;
    const files = req.files;
    try {
      const post = await PostService.createPost(data, userId, files);
      res.status(200).json(
        response.success({
          data: { post },
        })
      );
    } catch (err) {
      next(new ApiError(409, err?.message));
    }
  }

  async personalPosts(req, res, next) {
    const userClientId = req.user.id;
    const { userId } = req.params;
    try {
      const posts = await PostService.personalPosts(userClientId, userId);
      res.status(200).json(
        response.success({
          data: posts,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async reactPost(req, res, next) {
    const userId = req.user.id;
    const { postId } = req.params;
    const { type } = req.query;
    try {
      const post = await PostService.reactPost(userId, postId, type);
      res.status(200).json(
        response.success({
          data: { post },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async editPost(req, res, next) {
    const userId = req.user.id;
    const { postId } = req.params;
    const dataEdit = req.body;
    const files = req.files;
    try {
      const postEdited = await PostService.editPost(
        postId,
        dataEdit,
        files,
        userId
      );
      res.status(200).json(
        response.success({
          data: { postEdited },
        })
      );
    } catch (error) {
      next(new ApiError(400, error?.message));
    }
  }

  async getPostDetail(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const post = await PostService.getPostById(postId, userId);
      res.status(200).json(
        response.success({
          data: { post },
        })
      );
    } catch (error) {
      next(new ApiError(400, error?.message));
    }
  }

  async getComments(req, res, next) {
    try {
      const { postId } = req.params;
      const { page } = req.query;
      const comments = await CommentService.getCommentsBy(postId, page);
      res.status(200).json(
        response.success({
          data: comments,
        })
      );
    } catch (error) {
      next(new ApiError(400, error?.message));
    }
  }

  async getAllPosts(req, res, next) {
    try {
      const { page, size, createdAt, content, totalLike, totalComment } =
        req.query;
      const posts = await PostService.getAllPosts(
        page,
        size,
        createdAt,
        content,
        totalLike,
        totalComment
      );
      res.status(200).json(
        response.success({
          data: posts,
        })
      );
    } catch (error) {
      next(new ApiError(400, error?.message));
    }
  }

  async delete(req, res, next) {
    try {
      const { postId } = req.params;
      await PostService.delete(postId);
      res.status(200).json(response.success({}));
    } catch (err) {
      res.status(400).json(response.error({ message: err.toString() }));
    }
  }

  async setComment(req, res, next) {
    try {
      const { postId } = req.params;
      const post = await PostService.setComment(postId);
      res.status(200).json(
        response.success({
          data: { post },
        })
      );
    } catch (error) {
      next(new ApiError(400, error?.message));
    }
  }

  async setPublic(req, res, next) {
    try {
      const { postId } = req.params;
      const post = await PostService.setPublic(postId);
      res.status(200).json(
        response.success({
          data: { post },
        })
      );
    } catch (error) {
      next(new ApiError(400, error?.message));
    }
  }

  async getPostLikes(req, res, next) {
    try {
      const userId = req.user.id;

      const posts = await PostService.getPostLikes(userId);
      res.status(200).json(
        response.success({
          data: { posts },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async getPostComments(req, res, next) {
    try {
      const userId = req.user.id;

      const comments = await PostService.getPostComments(userId);
      res.status(200).json(
        response.success({
          data: { comments },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async getPostSaved(req, res, next) {
    try {
      const userId = req.user.id;

      const posts = await PostService.getPostSaved(userId);
      res.status(200).json(
        response.success({
          data: { posts },
        })
      );
    }catch(err) {
      next(new ApiError(400, err?.message));
    }
  }
}

export default new PostController();
