import ReelService from '../services/reel.service.js';
import CommentService from '../services/comment.service.js';
import { response } from "../utils/baseResponse";

class ReelController {
    async newReel(req, res) {
        const data = req.body;
        const userId = req.user.id;
        const video = req.file;
        try {
            const reel = await ReelService.create(data, userId, video);
            res.status(200).json({
                data: reel,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getReel(req, res) {
        const userId = req.user.id;
        const { page } = req.query;
        try {
            const reels = await ReelService.getReels(userId, page);
            res.status(200).json({
                data: reels,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async personalReels(req, res, next) {
        const userClientId = req.user.id;
        const { userId } = req.params;
        try {
            const reels = await ReelService.personalReels(userClientId, userId);
            res.status(200).json({
                data: reels,
            });
        } catch (err) {
            res.status(500).json({ message: error.message });
        }
    }

    async reactReel(req, res) {
        const userId = req.user.id;
        const { reelId } = req.params;
        const { type } = req.query;
        try {
            const reel = await ReelService.reactReel(userId, reelId, type);
            res.status(200).json(
                response.success({
                    data: { reel },
                })
            );
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async editReel(req, res) {
        const userId = req.user.id;
        const { reelId } = req.params;
        const dataEdit = req.body;
        const video = req.file;
        try {
            const reelEdited = await ReelService.editReel(reelId, dataEdit, video, userId);
            res.status(200).json({
                data: reelEdited,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getReelDetail(req, res) {
        try {
            const { reelId } = req.params;
            const userId = req.user.id;
            const reel = await ReelService.getReelById(reelId, userId);
            res.status(200).json({
                data: reel,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getComments(req, res) {
        try {
            const { reelId } = req.params;
            const { page } = req.query;
            const comments = await ReelService.getCommentsBy(reelId, page);
            res.status(200).json({
                data: comments,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllReels(req, res) {
        try {
            const { page, size, createdAt, content, totalLike, totalComment } = req.query;
            const reels = await ReelService.getAllReels(page, size, createdAt, content, totalLike, totalComment);
            res.status(200).json({
                data: reels,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { reelId } = req.params;
            await ReelService.delete(reelId);
            res.status(200).json(
                { data: "success" }
            );
        } catch (err) {
            res.status(500).json({ message: error.message });

        }
    }

    async setComment(req, res, next) {
        try {
            const { reelId } = req.params;
            const reel = await ReelService.setComment(reelId);
            res.status(200).json(
                response.success({
                    data: { reel },
                })
            );
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async setPublic(req, res, next) {
        try {
            const { reelId } = req.params;
            const reel = await ReelService.setPublic(reelId);
            res.status(200).json(
                response.success({
                    data: { reel },
                })
            );
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new ReelController();