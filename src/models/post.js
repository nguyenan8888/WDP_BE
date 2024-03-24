import mongoose from "mongoose";

const { Boolean, ObjectId } = mongoose.Schema.Types;

export const React = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"],
      default: "LIKE",
    },
  },
  { timestamps: true }
);

const Post = mongoose.model(
  "Post",
  new mongoose.Schema(
    {
      user: {
        type: ObjectId,
        ref: "User",
      },
      content: String,
      images: [String],
      is_public: {
        type: Boolean,
        default: true,
      },
      can_comment : {
        type: Boolean,
        default: true,
      },
      reacts: [React],
      shared: {
        type: Number,
        default: 0,
      },
      isDelete: {
        type: Boolean,
        default: false,
      },
      totalLike: {
        type: Number,
        default: 0,
      },
      totalComment: {
        type: Number,
        default: 0,
      },
      hasComment: {
        type: Map,
        of: Number,
        default: {},
      },
    },
    { timestamps: true }
  )
);

export default Post;
