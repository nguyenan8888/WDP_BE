import mongoose from "mongoose";

const { Boolean, ObjectId } = mongoose.Schema.Types;

const Activity = mongoose.model(
  "Activity",
  new mongoose.Schema(
    {
      post: {
        type: ObjectId,
        ref: "Post",
      },
      reel: {
        type: ObjectId,
        ref: "Reel",
      },
      user: {
        type: ObjectId,
        ref: "User",
        required: true,
      },
      type: {
        type: String,
        enum: ["POST", "REEL"],
      },
      contentType: {
        type: String,
        enum: ["LIKE", "COMMENT"],
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
        },
      
      ],
    },
    { timestamps: true }
  )
);

export default Activity;
