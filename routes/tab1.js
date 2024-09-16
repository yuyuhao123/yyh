const express = require('express');
const { Post, User, School } = require('../models'); // 确保引入你的模型
const router = express.Router();

// 获取 tab1 的数据
router.get('/', async function (req, res, next) {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id; // 假设用户信息存储在 req.user 中
        const user = await User.findByPk(userId, {
            include: [{ model: School }] // 获取用户的目标学校
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const targetSchoolId = user.target_school_id;

        // 获取推荐的热门帖子
        const recommendedPosts = await Post.findAll({
            where: {
                is_recommended: true,
                status: 'published'
            },
            order: [['likes_count', 'DESC']], // 按照点赞数排序
            limit: 5 // 限制返回数量
        });

        // 获取经验贴
        const experiencePosts = await Post.findAll({
            where: {
                type: 1, // 经验贴
                status: 'published'
            },
            order: [['createdAt', 'DESC']], // 按照创建时间排序
            limit: 5
        });

        // 获取考情分析贴
        const analysisPosts = await Post.findAll({
            where: {
                type: 2, // 考情分析
                status: 'published'
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // 获取与当前用户考的学校相关的帖子
        const schoolRelatedPosts = await Post.findAll({
            where: {
                school_id: targetSchoolId,
                status: 'published'
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // 返回结果
        res.json({
            recommendedPosts,
            experiencePosts,
            analysisPosts,
            schoolRelatedPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;