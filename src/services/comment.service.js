// ** Schema
import Comment from '../models/commentBucket';
import Post from '../models/post';
import User from '../models/user';
import postService from './post.service';
import Reel from '../models/reel.js';

class CommentService {
    // async newComment({ id, userId, content, image, reply = [], reacts }) {
    //     const selectUser = "_id firstName lastName gender picture role isActive";
    //     const post = await Post.findById(id);
    //     const user = await User.findById(userId);
    //     const commentBucket = await Comment.findOneAndUpdate(
    //         {
    //             post: id,
    //             count: { $lt: 10 }
    //         },
    //         {
    //             post: post,
    //             $push: {
    //                 comments: {
    //                     user: user,
    //                     content,
    //                     image,
    //                     reacts,
    //                     replies: reply
    //                 }
    //             },
    //             $inc: { count: 1 },
    //         },
    //         {
    //             new: true,
    //             upsert: true
    //         }
    //     );
    //     if (post.hasComment.get(userId)) {
    //         post.hasComment.set(userId, post.hasComment.get(userId) + 1);
    //     } else {
    //         post.hasComment.set(userId, 1);
    //     }
    //     post.totalComment += 1;
    //     post.save();
    //     if (commentBucket.comments.length === 1) {
    //         const prevBucket = await Comment.findOne({
    //             post: id,
    //         })
    //             .sort({ page: -1 })
    //             .skip(commentBucket.page)
    //             .populate("comments.user", selectUser)
    //             .exec();

    //         if (prevBucket) {
    //             console.log('?2');

    //             commentBucket.page = prevBucket.page + 1;
    //             await commentBucket.save();
    //         }
    //     }
    // }
    async createComment({ id, userId, content, image, reply = [], reacts }) {
        const user = await User.findById(userId);
        const query = {
            $push: {
                comments: {
                    user: user,
                    content,
                    image,
                    reacts,
                    replies: reply
                }
            },
            $inc: { count: 1 },
        };
        const post = await Post.findById(id);
        const reel = await Reel.findById(id);

        if (post) query.post = post;
        if (reel) query.reel = reel;
        const commentBucket = await Comment.findOneAndUpdate(
            {
                $or: [
                    { post: id },
                    { reel: id }
                ],
                count: { $lt: 10 }
            },
            query,
            {
                new: true,
                upsert: true
            }
        );
        if (post) {
            if (post.hasComment.get(userId)) {
                post.hasComment.set(userId, post.hasComment.get(userId) + 1);
            } else {
                post.hasComment.set(userId, 1);
            }
            post.totalComment += 1;
            post.save();
        }

        if (reel) {
            if (reel.hasComment.get(userId)) {
                reel.hasComment.set(userId, reel.hasComment.get(userId) + 1);
            } else {
                reel.hasComment.set(userId, 1);
            }
            reel.totalComment += 1;
            reel.save();
        }
        return commentBucket;
    }

    async newComment(data) {
        const { id } = data;
        const selectUser = "_id firstName lastName gender picture role isActive";
        const commentBucket = await this.createComment(data);
        if (commentBucket.comments.length === 1) {
            const prevBucket = await Comment.findOne({
                post: id,
            })
                .sort({ page: -1 })
                .skip(commentBucket.page)
                .populate("comments.user", selectUser)
                .exec();

            if (prevBucket) {
                commentBucket.page = prevBucket.page + 1;
                await commentBucket.save();
            }
        }
    }

    async getNewestCommentsByPostId(postId) {
        const selectUser = "_id username firstName lastName gender avatar role isActive";
        const result = await Comment.findOne({
            $or: [
                { post: postId },
                { reel: postId }
            ]
        }).sort({ page: -1 }).populate('post').populate('reel').populate('comments.user', selectUser);
        // console.log('result', );

        // const comments = [];
        // for (const comment of result.comments) {
        //     const userComment = await User.findById(comment.user);
        //     const replies = [];
        //     for (const reply of comment.replies) {
        //         const userReply = await User.findById(reply.user);
        //         if (!userReply) continue;
        //         replies.push({
        //             userId: reply.user,
        //             username: userReply.username,
        //             firstName: userReply.firstName,
        //             lastName: userReply.lastName,
        //             avatar: userReply.picture,
        //             content: reply.content,
        //             image: reply.image,
        //             reacts: reply.reacts
        //         });
        //     }
        //     comments.push({
        //         commentId: comment._id,
        //         postId: result.post._id,
        //         userId: comment.user._id,
        //         username: userComment.username,
        //         firstName: userComment.firstName,
        //         lastName: userComment.lastName,
        //         avatar: userComment.picture,
        //         content: comment.content,
        //         image: comment.image,
        //         reacts: comment.reacts,
        //         replies
        //     });
        // }
        return result.comments.reverse()[0];
    }


    // async getCommentsBy(id, page = 1, size = 1) {
    //     const skip = (page - 1) * size;

    //     const result = await Comment.find({
    //         $or: [
    //             { post: id },
    //             { reel: id }
    //         ]
    //     })
    //     .sort({ page: -1 })
    //     .skip(skip)
    //     .limit(size)
    //     .populate('post').populate('reel');
    //     if (result.length === 0) {
    //         return {
    //             totalPage: 0,
    //             comments: []
    //         };
    //     }
    //     const comments = [];
    //     for (const comment of result[0].comments) {
    //         const userComment = await User.findById(comment.user);
    //         const replies = [];
    //         for (const reply of comment.replies) {
    //             const userReply = await User.findById(reply.user);
    //             if (!userReply) continue;
    //             replies.push({
    //                 userId: reply.user,
    //                 username: userReply.username,
    //                 firstName: userReply.firstName,
    //                 lastName: userReply.lastName,
    //                 avatar: userReply.picture,
    //                 content: reply.content,
    //                 image: reply.image,
    //                 reacts: reply.reacts
    //             });
    //         }
    //         comments.push({
    //             commentId: comment._id,
    //             userId: comment.user._id,
    //             username: userComment.username,
    //             firstName: userComment.firstName,
    //             lastName: userComment.lastName,
    //             avatar: userComment.picture,
    //             content: comment.content,
    //             image: comment.image,
    //             reacts: comment.reacts,
    //             replies
    //         });
    //     }
    //     const totalPage = await Comment.find({
    //         $or: [
    //             { post: id },
    //             { reel: id }
    //         ],
    //     });
    //     if (result[0].post) {
    //         return {
    //             postId: result[0].post._id,
    //             totalPage: totalPage.length,
    //             comments
    //         };
    //     }
    //     return {
    //         reelId: result[0].reel._id,
    //         totalPage: totalPage.length,
    //         comments
    //     };
    // }

    async getCommentsBy(id, page = 1, size = 10) {
        const selectUser = "_id username firstName lastName gender avatar role isActive";
        const start = (page - 1) * size;
        const end = start + size;
        const results = await Comment.find({
            post: id
        })
            .sort({ page: 1 }).populate('post').populate('comments.user', selectUser);
        const allComments = [];
        for (const result of results) {
            allComments.push(...result.comments);
        }
        return {
            postId: id,
            comments: allComments.slice(start, end),
            totalPage: Math.ceil(allComments.length / size)
        };
    }

    async getCommentByCommentId(commentId) {
        const userSelect = "_id firstName lastName username avatar";
        const comments = await Comment.find().populate('comments.user', userSelect);
        for (const comment of comments) {
            for (const cmt of comment.comments) {
                if (cmt._id.toString() === commentId) {
                    const post = await Post.findById(comment.post._id).populate('user', userSelect);
                    return {
                        cmt,
                        post,
                    };
                }
            }
        }
    }

    async delete(commentId) {
        const commentBuckets = await Comment.find({});
        for (const commentBucket of commentBuckets) {
            for (const comment of commentBucket.comments) {
                if (comment._id.toString() === commentId) {
                    commentBucket.comments.pull(comment);
                    commentBucket.count -= 1;
                    commentBucket.save();
                    const post = await Post.findById(commentBucket.post);
                    post.hasComment.set(comment.user, post.hasComment.get(comment.user) - 1);
                    post.totalComment -= 1;
                    post.save();
                }
            }
        }
    }

    async editComment(commentId, content) {
        const commentBuckets = await Comment.find({});
        for (const commentBucket of commentBuckets) {
            for (const comment of commentBucket.comments) {
                if (comment._id.toString() === commentId) {
                    comment.content = content;
                    commentBucket.save();
                }
            }
        }
    }
}

export default new CommentService();