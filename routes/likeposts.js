const express = require('express');
const router = express.Router();
const { Post, PostLike, User } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError } = require('../utils/errors');

/**
 * 点赞、取消赞 对posts
 * POST /likedposts
 */
router.post('/', async function (req, res) {
    try {
        const userId = req.user.id;
        const { postId } = req.body;
        if (!postId) {
            throw new NotFoundError('需要传入postId');
        }

        const post = await Post.findByPk(postId);
        if (!post) {
            throw new NotFoundError('帖子不存在。');
        }

        // 检查帖子之前是否已经点赞
        const likeHistory = await PostLike.findOne({
            where: {
                post_id: postId,
                user_id: userId,
            }
        });

        // 如果没有点赞过，那就新增。并且帖子的 likesCount + 1
        if (!likeHistory) {
            await PostLike.create({ post_id: postId, user_id: userId });
            await post.increment('likes_count');
            success(res, '点赞成功。');
        } else {
            // 如果点赞过了，那就删除点赞记录，并且帖子的 likesCount - 1
            await likeHistory.destroy();
            await post.decrement('likes_count');
            success(res, '取消赞成功。');
        }
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 查询用户点赞的帖子
 * GET /likedposts
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        // 查询当前用户
        const user = await User.findByPk(req.user.id);

        // 查询当前用户点赞过的帖子
        const posts = await user.getUserLikedPosts({
            include: [{
                model: Post,
                as: 'parent', // 在这里指定别名
                attributes: { exclude: ['content'] }
            }],
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset,
        });

        // 查询当前用户点赞过的帖子总数
        const count = await user.countUserLikedPosts();

        success(res, '查询用户点赞的帖子成功。', {
            posts,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            }
        });

    } catch (error) {
        failure(res, error);
    }
});

module.exports = router;