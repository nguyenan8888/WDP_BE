import UserService from "../services/user.service";
import { response } from "../utils/baseResponse";
import { ApiError } from "../helpers/errorHandle";

class UserController {
  async profile(req, res, next) {
    const userClientId = req.user.id;
    const { userId } = req.params;
    try {
      const user = await UserService.profile(userId, userClientId);
      res.status(200).json(
        response.success({
          data: { user },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async editProfile(req, res, next) {
    const userId = req.user.id;
    const data = req.body;
    const avatar = req.file;
    try {
      const user = await UserService.editProfile(userId, data, avatar);
      res.status(200).json(
        response.success({
          data: { user },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async follow(req, res, next) {
    const userId = req.user.id;
    const { friendId } = req.params;
    try {
      const user = await UserService.follow(userId, friendId);
      res.status(200).json(
        response.success({
          data: { user },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async changePassword(req, res, next) {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    try {
      const user = await UserService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      res.status(200).json(
        response.success({
          data: { user },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async getFollowers(req, res, next) {
    const { userId } = req.params;
    try {
      const user = await UserService.getFollowers(userId);
      res.status(200).json(
        response.success({
          data: user,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async getFollowing(req, res, next) {
    const { userId } = req.params;
    try {
      const user = await UserService.getFollowing(userId);
      res.status(200).json(
        response.success({
          data: user,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async searchUser(req, res, next) {
    const { userName } = req.query;
    try {
      const users = await UserService.searchUser(userName);
      res.status(200).json(
        response.success({
          data: users,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async savePost(req, res, next) {
    const userId = req.user.id;
    const { postId } = req.params;
    try {
      await UserService.savePost(userId, postId);
      res.status(200).json(response.success({}));
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async unSavePost(req, res, next) {
    const userId = req.user.id;
    const { postId } = req.params;
    try {
      await UserService.unSavePost(userId, postId);
      res.status(200).json(response.success({}));
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async getSavedPosts(req, res, next) {
    const userId = req.user.id;
    try {
      const posts = await UserService.getSavedPosts(userId);
      res.status(200).json(
        response.success({
          data: posts.reverse(),
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async allUsers(req, res, next) {
    const { page, size, search, role, isLocked } = req.query;
    const userId = req.user.id;
    try {
      const users = await UserService.getAllUsers(
        page,
        size,
        search,
        role,
        isLocked,
        userId,
      );
      res.status(200).json(
        response.success({
          data: users,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async editUserRole(req, res, next) {
    const { userId } = req.params;
    const { role } = req.body;
    try {
      const user = await UserService.editUserRole(userId, role);
      res.status(200).json(
        response.success({
          data: user,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async lockAccount(req, res, next) {
    const { userId } = req.params;
    try {
      const user = await UserService.lockAccount(userId);
      res.status(200).json(
        response.success({
          data: user,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async blockUser(req, res, next) {
    const userId = req.user.id;
    const { blockedUserId } = req.params;
    try {
      const user = await UserService.blockUser(userId, blockedUserId);
      res.status(200).json(
        response.success({
          data: user,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async getUserCanConversation(req, res, next) {
    const userId = req.user.id;
    const { search } = req.query;

    try {
      const users = await UserService.getListUserCanConversation({ userId, search });

      res.status(200).json(
        response.success({
          data: users,
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }

  async getTotalAccountLocked(req, res, next) {
    try {
      const totalAccountLocked = await UserService.getTotalAccountLocked();
      res.status(200).json(
        response.success({
          data: totalAccountLocked,
        })
      );
    } catch (error) {
      next(new ApiError(400, err?.message));
    }
  }
}

export default new UserController();
