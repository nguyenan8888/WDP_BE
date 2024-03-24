import { message } from "../helpers/message";
import Chat from "../models/chat";
import ChatBucket from "../models/chatBucket";

import _ from "lodash";

const LIMIT_MESSAGE = 15;

class ChatService {
  async canGetChatContent({ userId, chatId }) {
    return !!(await Chat.findOne({
      $or: [{ user_1: userId }, { user_2: userId }],
      _id: chatId,
    }));
  }

  async getOrCreateChat({ user_1, user_2 }) {
    const selectUser = "_id firstName lastName gender avatar role isActive";
    return await Chat.findOneAndUpdate(
      {
        $or: [
          { $and: [{ user_1 }, { user_2 }] },
          { $and: [{ user_1: user_2, user_2: user_1 }] },
        ],
      },
      {
        user_1,
        user_2,
      },
      { upsert: true, new: true }
    )
      .populate("user_1", selectUser)
      .populate("user_2", selectUser)
      .exec();
  }

  async insertChatMessage({
    targetUserId,
    senderId,
    message = {},
    isNew = false,
  }) {
    const selectUser = "_id firstName lastName gender avatar role isActive";
    const chat = await this.getOrCreateChat({
      user_1: targetUserId,
      user_2: senderId,
    });

    const chatBucket = await ChatBucket.findOneAndUpdate(
      {
        chat: new RegExp(`^${chat.id}_`),
        count: { $lt: LIMIT_MESSAGE },
      },
      {
        $push: { messages: message },
        $inc: { count: 1 },
        $setOnInsert: {
          chat: `${chat.id}_${new Date().valueOf()}`,
        },
      },
      {
        new: true,
        upsert: true,
      }
    )
      .populate("messages.user", selectUser)
      .exec();

    if (chatBucket.messages.length === 1) {
      const prevBucket = await ChatBucket.findOne({
        chat: new RegExp(`^${chat.id}_`),
      })
        .sort({ chat: -1 })
        .skip(chatBucket.page)
        .populate("messages.user", selectUser)
        .exec();

      if (prevBucket) {
        chatBucket.page = prevBucket?.page + 1;
        await chatBucket.save();
      }
    }

    return isNew
      ? {
          chat: {
            _id: chat._id,
            user: chat.user_1._id === targetUserId ? chat.user_2 : chat.user_1,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            lastMessage: chatBucket.messages[chatBucket.messages.length - 1],
          },
        }
      : chatBucket.messages[chatBucket.messages.length - 1];
  }

  async getChatContent({ chatId, page = null }) {
    const selectUser = "_id firstName lastName gender avatar role isActive";
    const filter = page
      ? {
          chat: new RegExp(`^${chatId}_`),
          page,
        }
      : { chat: new RegExp(`^${chatId}`) };
    let hasMore = false;

    let bucket = (
      await ChatBucket.findOne(filter)
        .sort({ page: -1 })
        .populate("messages.user", selectUser)
        .exec()
    ).toJSON();

    if (!bucket) throw new Error("Not Found");

    bucket.messages = bucket.messages.reverse();

    // First time get Chat content, page = null so get the last 2 chatBucket
    if (!page && bucket.page > 1) {
      const bucket_2 = await ChatBucket.findOne({
        chat: new RegExp(`^${chatId}_`),
        page: bucket.page - 1,
      })
        .populate("messages.user", selectUser)
        .exec();

      const lastMessages = bucket.messages;
      bucket = _.cloneDeep(bucket_2.toJSON());
      bucket.count = bucket.messages.length + lastMessages.length;
      bucket.messages = [...lastMessages, ...bucket.messages];
    }

    // Check the bucket has more messages or not
    if (bucket.messages.length === LIMIT_MESSAGE || bucket.page > 1) {
      const nextBucket = await ChatBucket.findOne({
        chat: new RegExp(`^${chatId}_`),
        page: bucket.page - 1,
      });

      if (nextBucket) hasMore = true;
    }

    return {
      ...bucket,
      hasMore,
    };
  }

  async getLastMessageOfChat({ chatId }) {
    const bucket = await ChatBucket.findOne({
      chat: new RegExp(`^${chatId}_`),
    }).sort({ chat: -1 });

    return bucket.messages[bucket.messages.length - 1];
  }

  async getNumberOfUnreadMessage({ chatId, userId }) {
    const chatBuckets = await ChatBucket.find({
      chat: new RegExp(`^${chatId}_`)
    })

    let unReadMessages = 0;

    for (let i = 0; i < chatBuckets.length; ++i) {
      const messages = chatBuckets[i].messages
      for (let j = 0; j < messages.length; ++j) {
        if (!messages[j].seen.has(userId) && messages[j].user._id.toString() !== userId) unReadMessages++;
      }
    }

    return unReadMessages;
  }

  async getChats({ limit, offset, userId }) {
    const selectUser = "_id firstName lastName gender avatar role isActive";

    let chats = await Chat.find({
      $or: [{ user_1: userId }, { user_2: userId }],
    })
      .populate("user_1", selectUser)
      .populate("user_2", selectUser)
      .exec();

    chats = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await this.getLastMessageOfChat({
          chatId: chat.id,
        });

        const unReadMessages = await this.getNumberOfUnreadMessage({
          chatId: chat.id,
          userId
        });

        return {
          _id: chat._id,
          user: chat.user_1.id === userId ? chat.user_2 : chat.user_1,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          lastMessage,
          unReadMessages,
        };
      })
    );

    return chats;
  }

  async getChatIdOfUser({ userId }) {
    const chats = await Chat.find({
      $or: [{ user_1: userId }, { user_2: userId }],
    });

    const chatIds = chats.map((chat) => chat.id);

    return chatIds;
  }

  async reactMessage({ chatId, action, messageId, userId }) {
    const chat = await Chat.findOne({
      $or: [{ user_1: userId }, { user_2: userId }],
    });

    if (!chat) throw new Error("You are not allowed to react messages");

    const chatBucket = await ChatBucket.findOne({
      chat: new RegExp(`^${chatId}_`),
      "messages._id": messageId,
    });

    if (!chatBucket) throw new Error(message.notFound("Message"));

    let updatedMessage = null;
    for (let i = 0; i < chatBucket.messages.length; i++) {
      if (chatBucket.messages[i].id === messageId) {
        if (chatBucket.messages[i].reacts.get(userId) === action)
          chatBucket.messages[i].reacts.delete(userId);
        else chatBucket.messages[i].reacts.set(userId, action);
        updatedMessage = chatBucket.messages[i].toJSON();
        break;
      }
    }

    await chatBucket.save();
    return updatedMessage;
  }

  async seenMessage({ chatId, userId }) {
    const chatBuckets = await ChatBucket.find({
      chat: new RegExp(`^${chatId}_`),
    });

    for (let i = 0; i < chatBuckets.length; ++i) {
      for (let j = 0; j < chatBuckets[i].messages.length; ++j) {
        if (!chatBuckets[i].messages[j].seen.has(userId)) {
          chatBuckets[i].messages[j].seen.set(userId, new Date().valueOf());
        }
      }
      await chatBuckets[i].save();
    }
  }

  async deleteMessage({ chatId, messageId }) {
    const chatBucket = await ChatBucket.findOne({
      chat: new RegExp(`^${chatId}_`),
      'messages._id': messageId
    })

    if (!chatBucket) return;

    let messageDeleted = null;
    for (let i = 0; i < chatBucket.messages.length; ++i) {
      if (chatBucket.messages[i]._id.toString() === messageId) {
        chatBucket.messages[i].isDelete = true;
        messageDeleted = chatBucket.messages[i].toJSON();
      }
    }

    await chatBucket.save();

    return messageDeleted;
  }
}

export default new ChatService();
