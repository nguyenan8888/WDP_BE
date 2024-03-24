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

const Reel = mongoose.model(
  "Reel",
  new mongoose.Schema(
    {
      user: {
        type: ObjectId,
        ref: "User",
      },
      content: String,
      video: String,
      is_public: {
        type: Boolean,
        default: true,
      },
      can_comment : {
        type: Boolean,
        default: true,
      },
      reacts: [React],
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

export default Reel;
