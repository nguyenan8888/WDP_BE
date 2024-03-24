import mongoose from "mongoose";
import { React } from "./post";

const { Boolean, ObjectId } = mongoose.Schema.Types;

const FiendList = mongoose.model(
  "FiendList",
  new mongoose.Schema(
    {
      user: {
        type: ObjectId,
        ref: "User",
      },
      friends: [
        {
          user: {
            type: ObjectId,
            ref: "User",
          },
          best_friend: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    { timestamps: true }
  )
);

export default FiendList;
