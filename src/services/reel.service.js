import Reel from '../models/reel.js';
import FirebaseService from './firebase.service';
import userService from "./user.service";
import { message } from "../helpers/message";
import Comment from '../models/commentBucket.js';
import activityService from "./activity.service";

const userSelected = "_id username firstName lastName avatar isActive saved";

class ReelService {
    async create(data, userId, video) {
        const url = await FirebaseService.uploadToStorage(userId, [video]);
        const reel = new Reel({
            ...data,
            is_public: data.is_public || false,
            video: url[0],
            user: userId,
        });
        return await reel.save();
    }

    async getReels(userId, page = 1) {
        const skip = page - 1;
        const reels = await Reel.find({ is_public: true }).sort({ createdAt: -1 }).populate("user", userSelected).skip(skip).limit(1);
        const result = [];

        for (const reel of reels) {
            const userIsBlocked = await userService.userIsBlocked(reel.user._id, userId);
            if (!userIsBlocked) {
                const userLiked = reel.reacts.find((e) => e.user == userId);
                const reelIsSaved = reel.user.saved.find((e) => e == reel._id.toString());
                result.push({
                    ...reel._doc,
                    isLiked: userLiked ? true : false,
                    isSaved: reelIsSaved ? true : false
                });
            }
        }

        return {
            reels: result[0],
            totalPage: Math.ceil(await Reel.countDocuments({ is_public: true }) / 1),
            totalDocuments: await Reel.countDocuments({ is_public: true }),
        };
    }

    async personalReels(userClientId, userId) {
        if (userClientId == userId) {
            return {
                reels: (await Reel.find({ user: userClientId })).reverse(),
                totalDocuments: await Reel.countDocuments({ user: userClientId }),
            }
        }
        const client = await userService.profile(userId, userClientId);
        if (client.isBlocked) {
            return {
                reels: [],
                totalDocuments: 0
            }
        }
        return {
            reels: (await Reel.find({ user: userId, is_public: true })).reverse(),
            totalDocuments: await Reel.countDocuments({ user: userId, is_public: true }),
        }
    }

    async reactReel(userId, reelId, type) {
        const updatedReel = await Reel.findOneAndUpdate(
            { _id: reelId, reacts: { $elemMatch: { user: userId } } },
            {
                $inc: { totalLike: -1 },
                $pull: { reacts: { user: userId } }
            },
            { new: true }
        );

        activityService.deleteUserActivityBy(userId, reelId, type.toUpperCase(), "REEL");

        if (!updatedReel) {
            const newReel = await Reel.findOneAndUpdate(
                { _id: reelId },
                {
                    $inc: { totalLike: 1 },
                    $addToSet: {
                        reacts: {
                            user: userId,
                            type: type.toUpperCase()
                        }
                    }
                },
                { new: true }
            );

            if (!newReel) {
                throw new Error("Reel not found");
            }

            await activityService.createActivity(reelId, userId, type.toUpperCase(), "REEL");


            return newReel;
        }

        return updatedReel;
    }

    async editReel(reelId, data, file, userId) {
        const url = await FirebaseService.uploadToStorage(userId, [file]);
        const reel = await Reel.findById(reelId);
        if (!reel) throw new Error("Reel not found");
        reel.set({
            ...data,
            video: url[0],
        });
        return await reel.save();
    }

    async getReelById(reelId, userId) {
        const reel = await Reel.findById(reelId).populate("user", userSelected);
        const userLiked = reel.reacts.find((e) => e.user == userId)
        const reelIsSaved = reel.user.saved.find((e) => e == reel._id.toString())
        if (!reel) throw new Error("Reel not found");
        return {
            ...reel._doc,
            isLiked: userLiked ? true : false,
            isSaved: reelIsSaved ? true : false
        };
    }

    async getReelssUserInteract({ userId }) {
        const query = {};
        const key = `hasComment.${userId}`;
        query[key] = { $exists: true };
        const reels = await Reel.find(
            {
                $or: [{ user: userId }, query]
            }
        );
        return reels.map((reel) => reel._id.toString());
    }

    async getAllReels(page, size, createdAt, content, totalLike, totalComment) {
        const skip = (page - 1) * size;
        const query = {};
        if (content) query.content = { $regex: content, $options: "i" };
        const sortOptions = {};
        if (createdAt) sortOptions.createdAt = parseInt(createdAt);
        if (totalLike) sortOptions.totalLike = parseInt(totalLike);
        if (totalComment) sortOptions.totalComment = parseInt(totalComment);

        const totalDocuments = await Reel.countDocuments(query);
        const totalPage = Math.ceil(totalDocuments / size);
        const reels = await Reel.find(query).skip(skip).limit(size).sort(sortOptions).populate("user");
        reels.map((reel) => {
            reel.user.password = undefined;
        });
        return {
            reels,
            totalPage,
            totalDocuments,
        };
    }

    async delete(reelId) {
        const result = await Reel.findOneAndDelete({ _id: reelId });
        if (!result) {
            throw new Error(message.notFound(reelId))
        }
    }

    async getCommentsBy(id, page = 1, size = 10) {
        const selectUser = "_id username firstName lastName gender avatar role isActive";
        const start = (page - 1) * size;
        const end = start + size;
        const results = await Comment.find({
            reel: id
        })
            .sort({ page: -1 }).populate('reel').populate('comments.user', selectUser);
        const allComments = [];
        for (const result of results) {
            allComments.push(...result.comments);
        }
        return {
            reel: id,
            comments: allComments.slice(start, end),
            totalPage: Math.ceil(allComments.length / size)
        };
    }

    async setComment(reelId) {
        const reel = await Reel.findById(reelId);
        if (!reel) throw new Error("Reel not found");
        reel.can_comment = !reel.can_comment;
        reel.save();
        return reel;
    }

    async setPublic(reelId) {
        const reel = await Reel.findById(reelId);
        if (!reel) throw new Error("Reel not found");
        reel.is_public = !reel.is_public;
        reel.save();
        return reel;
    }
}

export default new ReelService();