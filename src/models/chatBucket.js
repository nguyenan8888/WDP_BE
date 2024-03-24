import mongoose from "mongoose";
import { React } from "./post";

const { Boolean, ObjectId, Map } = mongoose.Schema.Types;

export const Message = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    reacts: {
      type: Map,
      of: String,
      default: {},
    },
    reply_to: {
      type: ObjectId,
      ref: "Message",
      default: null,
    },
    seen: {
      type: Map,
      of: String,
      default: {},
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ChatBucket = mongoose.model(
  "ChatBucket",
  new mongoose.Schema(
    {
      chat: {
        type: String,
        required: true,
      },
      page: {
        type: Number,
        default: 1,
      },
      count: {
        type: Number,
        default: 0,
        max: 20,
      },
      messages: [Message],
    },
    { timestamps: true }
  )
);

export default ChatBucket;
