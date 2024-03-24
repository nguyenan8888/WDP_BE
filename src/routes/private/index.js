// ** Express
import express from "express";

// ** Routes
import userRouter from "./user.router";
import postRouter from "./post.router";
import authRouter from "./auth.router";
import chatRouter from "./chat.router";
import notificationRouter from "./notification.router";
import reportRouter from "./report.router";
import commentRouter from "./comment.router"
import reelRouter from "./reel.router";
import activityRouter from "./activity.router";

const privateRouter = express.Router();

privateRouter.use("/activity", activityRouter);
privateRouter.use("/auth", authRouter);
privateRouter.use("/user", userRouter);
privateRouter.use("/post", postRouter);
privateRouter.use("/chat", chatRouter);
privateRouter.use("/notification", notificationRouter);
privateRouter.use("/report", reportRouter);
privateRouter.use("/comment", commentRouter);
privateRouter.use("/reel", reelRouter);

export { privateRouter };
