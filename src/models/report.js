import mongoose from "mongoose";

const { String, Date, Boolean, ObjectId } = mongoose.Schema.Types;

const Report = mongoose.model(
    "Report",
    new mongoose.Schema(
        {
            reportedTarget: {
                type: ObjectId,
                required: true,
            },
            type: {
                type: String,
                enum: ["Post", "User", "Comment"],
            },
            reports: [
                {
                    user: {
                        type: ObjectId,
                        ref: "User",
                    },
                    reportContent: {
                        type: String,
                        required: true,
                    },
                    reason: {
                        type: [String],
                        required: true,
                    },
                },
            ],
            totalReport: {
                type: Number,
                default: 0,
            },
        },
        { timestamps: true }
    )
);

export default Report;
