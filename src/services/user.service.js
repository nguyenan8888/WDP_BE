import User from "../models/user";
import FriendList from "../models/friendList";
import bcrypt from "bcrypt";
import PostService from "./post.service";
import FirebaseService from "./firebase.service";

class UserService {
  async profile(userId, userClientId) {
    const user = await User.findById(userId);
    // const dob = user.dob;
    // const day = dob.getUTCDate();
    // const month = dob.getUTCMonth() + 1;
    // const year = dob.getUTCFullYear();
    // const dobFormated = `${day}-${month}-${year}`;
    if (userId == userClientId) {
      return {
        ...user._doc,
        password: undefined,
        // dob: dobFormated,
      };
    }

    return {
      ...user._doc,
      isBlocked: await this.userIsBlocked(userId, userClientId),
      password: undefined,
      isFollowed: await this.userIsFollwed(userId, userClientId),
      // dob: dobFormated,
    };
  }

  async userIsFollwed(userId, userClientId) {
    const clientFriendList = await FriendList.findOne({ user: userClientId, "friends.user": userId });
    if (clientFriendList) return true;
    return false;
  }

  async userIsBlocked(userId, userClientId) {
    const userClient = await User.findById(userClientId);
    if (userClient.blockedUsers.includes(userId)) return true;
    return false;
  }

  async editProfile(userId, data, avatar) {
    // const parts = data.dob.split('-');
    // const day = parseInt(parts[0], 10);
    // const month = parseInt(parts[1], 10) - 1;
    // const year = parseInt(parts[2], 10);

    // check nau ngay sau hien tai
    if (data.dob && new Date(data.dob) > new Date()) {
      throw new Error("Your Birth Day is invalid");
    }

    const query = { ...data };
    if (avatar) {
      const avatarUrl = await FirebaseService.uploadToStorage(userId, [avatar]);
      query.avatar = avatarUrl[0];
    }

    const user = await User.findByIdAndUpdate(userId, query, { new: true });
    return {
      ...user._doc,
      password: undefined,
    };
  }

  async userIsFollowed(userClientId, userId) {
    const clientFriendList = await FriendList.findOne({ user: userClientId, "friends.user": userId });
    if (clientFriendList) return true;
    return false;
  }

  async follow(userId, friendId) {
    const user = await User.findById(friendId);
    if (!user) throw new Error("User not found");
    const friendList = await FriendList.findOne({ user: userId, "friends.user": friendId });
    if (!friendList) {
      return await FriendList.findOneAndUpdate(
        {
          user: userId,
        },
        {
          $push: {
            friends: {
              user: user,
              best_friend: false,
            },
          },
        },
        {
          new: true,
          upsert: true,
        }
      );
    }

    return await FriendList.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $pull: {
          friends: {
            user: friendId,
          },
        },
      }
    );
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    const password = user.password;
    if (!bcrypt.compareSync(currentPassword, password))
      throw new Error("Password is incorrect");
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(newPassword, salt);
    const result = await user.save();
    return {
      ...result._doc,
      password: undefined,
    };
  }

  async getFollowers(userId) {
    const listFollowers = await FriendList.find({
      "friends.user": userId,
    }).populate("user");
    const result = [];
    listFollowers.map((e) => {
      result.push({
        _id: e.user._id,
        avatar: e.user.avatar,
        userName: e.user.username,
        firstName: e.user.firstName,
        lastName: e.user.lastName,
      });
    });
    return {
      followers: result,
      totalDocuments: result.length,
    };
  }

  async getFollowing(userId) {
    const ListFollowing = await FriendList.find({
      user: userId,
    }).populate("friends.user");
    const result = [];
    ListFollowing.map((e) => {
      e.friends.map((friend) => {
        result.push({
          _id: friend.user._id,
          avatar: e.user.avatar,
          userName: friend.user.username,
          firstName: friend.user.firstName,
          lastName: friend.user.lastName,
        });
      });
    });
    return {
      followings: result,
      totalDocuments: result.length,
    };
  }

  async searchUser(username) {
    const users = await User.find({
      username: { $regex: username, $options: "i" },
      role: { $ne: "Admin" }
    });
    const result = [];
    users.map((e) => {
      result.push({
        ...e._doc,
        password: undefined,
      });
    });
    return result;
  }

  async savePost(userId, postId) {
    const post = await PostService.getPostById(postId);
    return await User.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          saved: post,
        },
      },
      { new: true }
    );
  }

  async unSavePost(userId, postId) {
    return await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          saved: postId,
        },
      },
      { new: true }
    );
  }

  async getSavedPosts(userId) {
    const queryResult = await User.findById(userId).populate("saved");
    return queryResult.saved;
  }

  async getAllUsers(page, size, search, role, isLocked, userId) {
    const skip = (page - 1) * size;
    const query = {
      _id: { $ne: userId },
    };
    if (search) query.username = { $regex: search, $options: "i" };
    if (role) query.role = { $regex: role, $options: "i" };
    if (isLocked) query.isLocked = isLocked == 1 ? true : false;
    const totalDocuments = await User.countDocuments(query);
    const totalPage = Math.ceil(totalDocuments / size);
    const users = await User.find(query).skip(skip).limit(size);
    users.map((user) => {
      user.password = undefined;
    });
    return {
      users,
      totalPage,
      totalDocuments,
    };
  }

  async editUserRole(userId, role) {
    return await User.findByIdAndUpdate(userId, { role }, { new: true });
  }

  async lockAccount(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isLocked: !user.isLocked } },
      { new: true }
    );
  }

  async blockUser(userId, blockedUserId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.blockedUsers.includes(blockedUserId)) {
      return await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { blockedUsers: blockedUserId } },
        { new: true }
      );
    }
    return await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { blockedUsers: blockedUserId } },
      { new: true }
    );
  }

  // async getListUserCanConversation({ userId, search }) {
  //   const filter = {};

  //   const users = await User.find({
  //     _id: { $ne: userId },
  //     $or: [
  //       { firstName: { $regex: new RegExp(search, "i") } },
  //       { lastName: { $regex: new RegExp(search, "i") } },
  //     ],
  //   })
  //     .select("_id firstName lastName avatar gender role")
  //     .exec();

  //   return users;
  // }

  async getListUserCanConversation({ userId, search }) {
    const result = [];
    const listFriend = await FriendList.findOne({ user: userId });
    for (const friend of listFriend.friends) {
      const listFriendOfFriend = await FriendList.findOne({ user: friend.user.toString() });
      for (const friendOfFriend of listFriendOfFriend.friends) {
        if (friendOfFriend.user.toString() == userId) {
          const user = await User.findById(friend.user.toString()).select("_id username firstName lastName avatar gender role");
          result.push(user);
        }
      }
    }

    if (search) {
      const searchResult = []
      result.map((e) => {
        if (e.username.includes(search) || e.firstName.includes(search) || e.lastName.includes(search)) {
          searchResult.push(e);
        }
      });
      return searchResult;
    }
    return result;
  }

  async getTotalAccountLocked() {
    return User.countDocuments({ isLocked: true });
  }
}

export default new UserService();
