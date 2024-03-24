import mongoose from "mongoose";
import { React } from "./post";

const { Boolean, ObjectId } = mongoose.Schema.Types;

const CommentBucket = mongoose.model(
  "CommentBucket",
  new mongoose.Schema(
    {
      post: {
        type: ObjectId,
        ref: "Post",
        required: true,
      },
      reel: {
        type: ObjectId,
        ref: "Reel",
        required: false,
      },
      page: {
        type: Number,
        required: true,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
        max: 10,
      },
      comments: [
        {
          user: {
            type: ObjectId,
            ref: "User",
            required: true,
          },
          content: String,
          image: String,
          // replies: [
          //   {
          //     user: {
          //       type: ObjectId,
          //       ref: "User",
          //       required: true,
          //     },
          //     content: String,
          //     image: String,
          //     reacts: [React],
          //   },
          // ],
          // reacts: [React],
        },
      ],
    },
    { timestamps: true }
  )
);

export default CommentBucket;
