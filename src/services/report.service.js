import Report from "../models/report";
import User from "../models/user";
import Post from "../models/post";
import commentService from "./comment.service";
import FirebaseService from "./firebase.service";
import Reel from "../models/reel";

class ReportService {
    async newReport(userId, targetId, data) {
        const reports = {
            user: userId,
            reportContent: data.reportContent,
            reason: data.reason,
        };

        const newReport = {
            reportedTarget: targetId,
            type: '',
            reports,
        };

        if (data.type === "Post") {
            const post = await Post.findById(targetId);
            if (!post) throw new Error("Post not found");
            newReport.type = data.type;
            return await this.save(newReport);
        } else if (data.type === "User") {
            const user = await User.findById(targetId);
            if (!user) throw new Error("User not found");
            newReport.type = data.type;
            return await this.save(newReport);
        } else if (data.type === "Comment") {
            const comment = await commentService.getCommentByCommentId(targetId);
            if (!comment.cmt) throw new Error("Comment not found");
            newReport.type = data.type;
            return await this.save(newReport);
        } else if (data.type === "Reel") {
            const reel = await Reel.findById(targetId);
            if (!reel) throw new Error("Reel not found");
            newReport.type = data.type;
            return await this.save(newReport);
        }
        throw new Error("Invalid Report");
    }

    async save(data) {
        const reporter = await User.findById(data.reports.user);
        if (!reporter) throw new Error("Reporter not found");
        await Report.findOneAndUpdate(
            { reportedTarget: data.reportedTarget },
            {
                type: data.type,
                $push: {
                    reports: {
                        user: reporter,
                        reportContent: data.reports.reportContent,
                        reason: data.reports.reason
                    },
                },
                $inc: {
                    totalReport: 1,
                },
            },
            {
                new: true,
                upsert: true
            });
    }

    async allReport(page = 1, size = 10, type, createdAt, totalReport, search) {
        const skip = (page - 1) * size;
        const query = {};
        if (type) query.type = type;
        if (search) query['reports.reportContent'] = { $regex: search, $options: "i" };
        const sortOptions = {};
        if (createdAt) sortOptions.createdAt = parseInt(createdAt);
        if (totalReport) sortOptions.totalReport = parseInt(totalReport);
        const userSelect = "_id firstName lastName username avatar";

        const results = await Report.find(query)
            .skip(skip)
            .limit(size)
            .sort(sortOptions).populate('reports.user', userSelect);
        const reports = [];
        for (const result of results) {
            if (result.type === "Post") {
                const post = await Post.findById(result.reportedTarget.toString()).populate("user", userSelect);
                if (post) reports.push({ ...result._doc, post: post });
            } else if (result.type === "User") {
                const user = await User.findById(result.reportedTarget.toString());
                if (user) reports.push({ ...result._doc, password: undefined, user: user });
            } else if (result.type === "Comment") {
                const comment = await commentService.getCommentByCommentId(result.reportedTarget.toString());
                if (comment) reports.push({ ...result._doc, comment: comment});
            } else if (result.type === "Reel") {
                const reel = await Reel.findById(result.reportedTarget.toString()).populate("user", userSelect);
                if (reel) reports.push({ ...result._doc, reel: reel });
            }
        }
        const totalDocuments = await Report.countDocuments(query);
        const totalPage = Math.ceil(totalDocuments / size);
        return {
            reports,
            totalPage,
            totalDocuments,
        };
    }

    async reportDetail(reportId) {
        const report = await Report.findById(reportId);
        if (!report) throw new Error("Report not found");
        return report;
    }
}
export default new ReportService();