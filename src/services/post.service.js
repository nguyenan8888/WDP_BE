import Post from "../models/post";
import Comment from "../models/commentBucket";
import FirebaseService from "./firebase.service";
import userService from "./user.service";
import { message } from "../helpers/message";
import Report from "../models/report";
import CommentBucket from "../models/commentBucket";
import activityService from "./activity.service";

import User from "../models/user";
class PostService {
  async getNewFeed(userId) {
    const posts = await Post.find({ is_public: true })
      .sort({ createdAt: -1 })
      .populate("user");
    const result = [];

    for (const post of posts) {
      const userIsBlocked = await userService.userIsBlocked(
        post.user._id,
        userId
      );
      if (!userIsBlocked) {
        const userLiked = post.reacts.find((e) => e.user == userId);
        const postIsSaved = post.user.saved.find(
          (e) => e == post._id.toString()
        );
        result.push({
          ...post._doc,
          isLiked: userLiked ? true : false,
          isSaved: postIsSaved ? true : false,
        });
      }
    }

    return result;
  }

  async createPost(data, userId, file = []) {
    const url = await FirebaseService.uploadToStorage(userId, file);
    const post = new Post({
      ...data,
      images: url,
      user: userId,
    });
    return await post.save();
  }

  async personalPosts(userClientId, userId) {
    if (userClientId == userId) {
      return {
        posts: (await Post.find({ user: userClientId })).reverse(),
        totalDocuments: await Post.countDocuments({ user: userClientId }),
      };
    }
    const client = await userService.profile(userId, userClientId);
    if (client.isBlocked) {
      return {
        posts: [],
        totalDocuments: 0,
      };
    }
    return {
      posts: (await Post.find({ user: userId, is_public: true })).reverse(),
      totalDocuments: await Post.countDocuments({
        user: userId,
        is_public: true,
      }),
    };
  }

  // async reactPost(userId, postId, type) {
  //     const post = await Post.findById(postId);
  //     if (!post)
  //         throw new Error("Post not found");
  //     const reactIndex = post.reacts.findIndex((react) => react.user == userId);
  //     if (reactIndex > -1) {
  //         if (post.reacts[reactIndex].type === type.toUpperCase()) {
  //             post.reacts.splice(reactIndex, 1);
  //             post.totalLike = post.totalLike - 1;
  //             return await post.save();
  //         }
  //         post.reacts[reactIndex].type = type.toUpperCase();
  //     } else {
  //         post.reacts.push({ user: userId, type: type.toUpperCase() });
  //         post.totalLike = post.totalLike + 1;
  //     }
  //     return await post.save();
  // }

  async reactPost(userId, postId, type) {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, reacts: { $elemMatch: { user: userId } } },
      {
        $inc: { totalLike: -1 },
        $pull: { reacts: { user: userId } },
      },
      { new: true }
    );

    activityService.deleteUserActivityBy(userId, postId, type.toUpperCase(), "POST");

    if (!updatedPost) {
      const newPost = await Post.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { totalLike: 1 },
          $addToSet: {
            reacts: {
              user: userId,
              type: type.toUpperCase(),
            },
          },
        },
        { new: true }
      );

      if (!newPost) {
        throw new Error("Post not found");
      }
      await activityService.createActivity(postId, userId, type.toUpperCase(), "POST");
      return newPost;
    }
    return updatedPost;
  }

  async checkUserIsReacted(userId, postId) {
    const post = await Post.findOne({ _id: postId, "reacts.user": userId });
    return !!post;
  }

  async checkUserIsCommented(userId, postId) {
    const comment = await Comment.findOne({
      post: postId,
      "comments.user": userId,
    });
    return !!comment;
  }

  async editPost(postId, data, file = [], userId) {
    const url = await FirebaseService.uploadToStorage(userId, file);
    const query = { ...data };

    if (url.length > 0) {
      query.images = url;
    }
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");
    post.set(query);
    return await post.save();
  }

  async getPostById(postId, userId) {
    const post = await Post.findById(postId).populate("user");
    const userLiked = post.reacts.find((e) => e.user == userId);
    const postIsSaved = post.user.saved.find((e) => e == post._id.toString());
    if (!post) throw new Error("Post not found");
    return {
      ...post._doc,
      isLiked: userLiked ? true : false,
      isSaved: postIsSaved ? true : false,
    };
  }

  async getPostsUserInteract({ userId }) {
    const query = {};
    const key = `hasComment.${userId}`;
    query[key] = { $exists: true };
    const posts = await Post.find({
      $or: [{ user: userId }, query],
    });
    return posts.map((post) => post._id.toString());
  }

  async getAllPosts(page, size, createdAt, content, totalLike, totalComment) {
    const skip = (page - 1) * size;
    const query = {};
    if (content) query.content = { $regex: content, $options: "i" };
    const sortOptions = {};
    if (createdAt) sortOptions.createdAt = parseInt(createdAt);
    if (totalLike) sortOptions.totalLike = parseInt(totalLike);
    if (totalComment) sortOptions.totalComment = parseInt(totalComment);

    const totalDocuments = await Post.countDocuments(query);
    const totalPage = Math.ceil(totalDocuments / size);
    const posts = await Post.find(query)
      .skip(skip)
      .limit(size)
      .sort(sortOptions)
      .populate("user");
    posts.map((post) => {
      post.user.password = undefined;
    });
    return {
      posts,
      totalPage,
      totalDocuments,
    };
  }

  async delete(postId) {
    const result = await Post.findOneAndDelete({ _id: postId });
    if (!result) {
      throw new Error(message.notFound(postId));
    }
    await Comment.deleteMany({ post: postId });
    await Report.deleteMany({ reportedTarget: postId });
  }

  async setComment(postId) {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");
    post.can_comment = !post.can_comment;
    post.save();
    return post;
  }

  async setPublic(postId) {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");
    post.is_public = !post.is_public;
    post.save();
    return post;
  }

  async getPostLikes(userId) {
    const posts = await Post.find({
      reacts: { $elemMatch: { user: userId } },
    });

    return posts;
  }

  async getPostComments(userId) {
    const commentBuckets = await CommentBucket.find({
      comments: { $elemMatch: { user: userId } },
    })
      .populate("post")
      .populate("comments.user")
      .exec();

    const buckets = await Promise.all(
      commentBuckets.map(async (bucket) => {
        let data = await bucket.populate("post.user");

        data.comments = data.comments.filter(
          (comment) => comment.user._id.toString() === userId
        );

        return data;
      })
    );

    return buckets;
  }

  async getPostSaved(userId) {
    const user = await User.findById(userId).populate('saved')

    return user.toJSON().saved
  }
}

export default new PostService();
