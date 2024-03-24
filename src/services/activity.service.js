import Activity from "../models/activity";
import Post from "../models/post";
import User from "../models/user";
import Reel from "../models/reel";

class ActivityService {
    async createActivity(id, userId, contentType, type) {
        if (type === 'POST') {
            const query = {
                post: id,
                user: userId,
                type,
                contentType,
            };
            const activity = new Activity(query);
            return await activity.save();
        }

        if (type === 'REEL') {
            const query = {
                reel: id,
                user: userId,
                type,
                contentType,
            };
            const activity = new Activity(query);
            return await activity.save();
        }
    }

    async commentActivity(id, userId, type, comment) {
        if (type === 'POST') {
            await Activity.findOneAndUpdate(
                { post: id, user: userId },
                {
                    $set: { post: id, user: userId, type, contentType: "COMMENT" },
                    $push: { comments: comment }
                },
                { upsert: true }
            );
        }

        if (type === 'REEL') {
            await Activity.findOneAndUpdate(
                { reel: id, user: userId },
                {
                    $set: { reel: id, user: userId, type, contentType: "COMMENT" },
                    $push: { comments: comment }
                },
                { upsert: true }
            );
        }
    }

    async deleteUserActivityBy(userId, id, contentType, type) {
        await Activity.findOneAndDelete({ user: userId, $or: [{ post: id }, { reel: id }], contentType, type });
    }

    async getUserActivity(userId, type, contentType = "LIKE") {
        const postSelect = 'images content user'
        const reelSelect = 'video content user'
        const userSelect = 'username firstName lastName avatar'
        const result = await Activity.find({
            user: userId,
            type,
            contentType,
        }).populate({
            path: 'post',
            select: postSelect,
            populate: {
                path: 'user',
                select: userSelect
            }
        }).populate({
            path: 'reel',
            select: reelSelect,
            populate: {
                path: 'user',
                select: userSelect
            }
        }).populate('comments.user', userSelect);
        return result;
    }

    async deleteActivityBy(activityId) {
        await Activity.findByIdAndDelete(activityId);
    }
}

export default new ActivityService();