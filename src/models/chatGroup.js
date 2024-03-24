import mongoose from "mongoose";

const { Boolean, ObjectId } = mongoose.Schema.Types;

const ChatGroupMember = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  is_root: {
    type: Boolean,
    default: false,
  },
  can_manage: {
    type: Boolean,
    default: false,
  },
});

const ChatGroup = mongoose.model(
  "ChatGroup",
  new mongoose.Schema(
    {
      members: [ChatGroupMember],
    },
    { timestamps: true }
  )
);

export default ChatGroup;
