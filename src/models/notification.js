import mongoose from "mongoose";

const { Boolean, ObjectId } = mongoose.Schema.Types;

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema(
    {
      user: {
        type: ObjectId,
        ref: "User",
      },
      title: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        enum: ["FOLLOW", "TAG", "POST", "WARNING", "REEL"],
        required: true,
      },
      is_read: {
        type: Boolean,
        default: false,
      },
      is_trash: {
        type: Boolean,
        default: false,
      },
      meta_data: {
        sender: {
          type: ObjectId,
          ref: "User",
        },
        postId: {
          type: ObjectId,
          red: "Post",
        },
        type: {
          type: String,
          enum: ["LIKE", "COMMENT", "ACCEPT_FOLLOW", "FOLLOW_REQUEST", "POST_WARNING", "COMMENT_WARNING", "ACCOUNT_LOCKED"],
          // default: "LIKE",
        },
        subject: String,
      },
    },
    { timestamps: true }
  )
);

export default Notification;
