import mongoose from "mongoose";

const { String, Date, Boolean, ObjectId } = mongoose.Schema.Types;

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: false,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      biography: {
        type: String,
        required: false,

        default: null
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Male",
      },
      dob: {
        type: Date,
        default: null
      },
      address: {
        type: String,
        required: false,
        default: null
      },
      blockedUsers: {
        type: [ObjectId],
      },
      refreshToken: {
        type: String,
        default: null
      },
      role: {
        type: String,
        enum: ["Member", "Moderator", "Admin"],
        default: "Member",
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      isDelete: {
        type: Boolean,
        default: false,
      },
      saved: {
        type: [ObjectId],
        ref: "Post",
      },
      avatar: {
        type: String,
        default: null
      },
      isLocked: {
        type: Boolean,
        default: false
      },
    },
    { timestamps: true }
  )
);

export default User;
