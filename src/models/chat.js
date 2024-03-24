import mongoose from "mongoose";

const { Boolean, ObjectId } = mongoose.Schema.Types;

const Chat = mongoose.model(
  "Chat",
  new mongoose.Schema(
    {
      user_1: {
        type: ObjectId,
        ref: "User",
        required: true,
      },
      user_2: {
        type: ObjectId,
        ref: "User",
        required: true,
      },
    },
    { timestamps: true }
  )
);

export default Chat;
