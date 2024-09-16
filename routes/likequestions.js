const express = require('express');
const router = express.Router();
const { Question, QuestionLike, User } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError } = require('../utils/errors');

/**
 * 点赞、取消赞 对questions
 * POST /likedquestions
 */
router.post('/', async function (req, res) {
    try {
        const userId = req.user.id;
        const { questionId } = req.body;
        if (!questionId) {
            throw new NotFoundError('需要传入questionId');
        }

        const question = await Question.findByPk(questionId);
        if (!question) {
            throw new NotFoundError('题目不存在。');
        }

        // 检查题目之前是否已经点赞
        const likeHistory = await QuestionLike.findOne({
            where: {
                question_id: questionId,
                user_id: userId,
            }
        });

        // 如果没有点赞过，那就新增。并且题目的 likesCount + 1
        if (!likeHistory) {
            await QuestionLike.create({ question_id: questionId, user_id: userId });
            await question.increment('likes_count');
            success(res, '点赞成功。');
        } else {
            // 如果点赞过了，那就删除点赞记录，并且题目的 likesCount - 1
            await likeHistory.destroy();
            await question.decrement('likes_count');
            success(res, '取消赞成功。');
        }
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 查询用户点赞的题目
 * GET /likedquestions
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        // 查询当前用户
        const user = await User.findByPk(req.user.id);

        // 查询当前用户点赞过的题目
        const questions = await user.getUserLikedQuestions({
            include: [{
                model: Question,
                as: 'parent', // 在这里指定别名
                attributes: { exclude: ['content'] }
            }],
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset,
        });

        // 查询当前用户点赞过的题目总数
        const count = await user.countUserLikedQuestions();

        success(res, '查询用户点赞的题目成功。', {
            questions,
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