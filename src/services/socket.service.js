// ** Service
import commentService from "./comment.service";
import notificationService from "./notification.service";
import chatService from "./chat.service";
import postService from "./post.service";
import activityService from "./activity.service";
import Post from "../models/post";
import User from "../models/user";
import Reel from "../models/reel";

class SocketService {
  async connection(socket) {
    console.log(`Socket connectted ID: ${socket.id}`);
    const chatIds =
      (await chatService.getChatIdOfUser({
        userId: socket.user.id,
      })) || [];
    chatIds.forEach((chat) => socket.join(`chat:${chat}`));

    const postIds =
      (await postService.getPostsUserInteract({ userId: socket.user.id })) ||
      [];
    postIds.forEach((post) => socket.join(`post:${post}`));

    socket.on("disconnect", () => {
      console.log(`User disconnected with id: ${socket.id}`);
    });

    socket.on("send-post-like", async (payload) => {
      const { id: userId } = socket.user;
      const { postId, type } = payload;
      const post = await Post.findById(postId);
      const userIsLiked = await postService.checkUserIsReacted(userId, postId);
      if (post.user._id.toString() !== userId && userIsLiked) {
        const notification = await notificationService.create({
          user: post.user,
          title: "like your post",
          type: type.toUpperCase(),
          meta_data: {
            sender: userId,
            postId: post.id,
            type: "LIKE",
          },
        });
        global._io.emit(`response-notification-${post.user._id.toString()}`, {
          notification,
        });
      }
    });

    socket.on("send-post-comment", async (payload) => {
      const { id: userId } = socket.user;
      const { id, type } = payload;
      const post = await Post.findById(id);

      if (post.user._id.toString() !== userId) {
        const notification = await notificationService.create({
          user: post.user,
          title: "comment your post",
          type: type.toUpperCase(),
          meta_data: {
            sender: userId,
            postId: post.id,
            type: "COMMENT",
          },
        });
        global._io.emit(`response-notification-${post.user._id.toString()}`, {
          notification,
        });
      }
    });

    socket.on("send-reel-comment", async (payload) => {
      const { id: userId } = socket.user;
      const { id, type } = payload;
      const reel = await Reel.findById(id);

      if (reel.user._id.toString() !== userId) {
        const notification = await notificationService.create({
          user: reel.user,
          title: "comment your reel",
          type: type.toUpperCase(),
          meta_data: {
            sender: userId,
            postId: reel.id,
            type: "COMMENT",
          },
        });
        global._io.emit(`response-notification-${reel.user._id.toString()}`, {
          notification,
        });
      }
    });

    socket.on("send-follow-request", async (payload) => {
      const { id: userId } = socket.user;
      const { id, type } = payload;
      const user = await User.findById(id);
      if (user._id.toString() !== userId) {
        const notification = await notificationService.create({
          user,
          title: "started following you",
          type: type.toUpperCase(),
          meta_data: {
            sender: userId,
            // postId: post.id,
            type: "FOLLOW_REQUEST",
          },
        });
        global._io.emit(`response-notification-${user._id.toString()}`, {
          notification,
        });
      }
    });

    socket.on("send-follow-accept", async (payload) => {
      const { id: userId } = socket.user;
      const { id, type } = payload;
      const user = await User.findById(id);
      // const userIsFollwed = await userService.userIsFollowed(userId, id);
      if (user._id.toString() !== userId) {
        const notification = await notificationService.create({
          user,
          title: "started following you",
          type: type.toUpperCase(),
          meta_data: {
            sender: userId,
            // postId: post.id,
            type: "ACCEPT_FOLLOW",
          },
        });
        global._io.emit(`response-notification-${user._id.toString()}`, {
          notification,
        });
      }
    });

    socket.on("send-post-warning", async (payload) => {
      const { id: userId } = socket.user;
      const { id, type, title } = payload;
      const post = await Post.findById(id);
      const notification = await notificationService.create({
        user: post.user,
        title: title,
        type: type.toUpperCase(),
        meta_data: {
          sender: userId,
          postId: post.id,
          type: "POST_WARNING",
        },
      });

      global._io.emit(`response-notification-${post.user._id.toString()}`, {
        notification,
      });
    });

    socket.on("send-message", async (payload) => {
      const { id: userId } = socket.user;
      const {
        chatId,
        message,
        targetUserId,
        images = [],
        replyTo = null,
      } = payload;

      const data = await chatService.insertChatMessage({
        message: {
          content: message,
          images,
          reply_to: replyTo,
          user: userId,
        },
        targetUserId,
        senderId: userId,
      });

      if (!socket.rooms.has(`chat:${chatId}`)) {
        socket.join(`chat:${chatId}`);
      }

      socket.nsp.to(`chat:${chatId}`).emit(`response-send-message`, {
        message: data,
        isSuccess: true,
      });
      global._io.emit(`noti-message-user-${targetUserId}`, { count: 1, chatId });
    });

    socket.on("send-message-upload", (payload) => {
      const { message, chatId } = payload;

      socket.nsp.to(`chat:${chatId}`).emit("response-send-message", {
        message,
        isSuccess: true,
      });
    });

    socket.on("react-message", (payload) => {
      const {
        message: { reacts, _id },
        chatId,
      } = payload;

      socket.to(`chat:${chatId}`).emit(`response-react-message-${_id}`, {
        isSuccess: true,
        reacts,
      });
    });

    socket.on("seen-message", async (payload) => {
      const { id: userId } = socket.user;
      const { chatId } = payload;

      await chatService.seenMessage({ chatId, userId });
      socket.nsp.to(`chat:${chatId}`).emit(`response-seen-message`, {
        chatId,
        isSuccess: true,
      });
    });

    socket.on("delete-message", async (payload) => {
      const { chatId, messageId } = payload;

      const message = await chatService.deleteMessage({ chatId, messageId });

      socket.nsp.to(`chat:${chatId}`).emit(`response-update-message`, {
        message,
        isSuccess: true,
      });
    });

    socket.on("typing-message", async (payload) => {
      const { id: userId } = socket.user;
      const { action, chatId } = payload;

      socket.to(`chat:${chatId}`).emit(`response-typing-message`, {
        isSuccess: true,
        userId,
        action,
      });
    });

    socket.on("comment", async (data) => {
      const { id: userId } = socket.user;
      await commentService.newComment(data, userId);
      const comment = await commentService.getNewestCommentsByPostId(data.id);
      if (data.type.toUpperCase() === "POST") {
        await activityService.commentActivity(data.id, userId, data.type.toUpperCase(), comment);
        global._io.emit(`comment-post-${data.id}`, comment);
      }

      if (data.type.toUpperCase() === "REEL") {
        await activityService.commentActivity(data.id, userId, data.type.toUpperCase(), comment);
        global._io.emit(`comment-reel-${data.id}`, comment);
      }
    });
  }
}

export default new SocketService();
