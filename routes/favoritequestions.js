const express = require('express');
const router = express.Router();
const { Question, QuestionFavorite, User } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError } = require('../utils/errors');

/**
 * 点收藏、取消收藏 对questions
 * POST /favoritequestions
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

        // 检查题目之前是否已经点收藏
        const favoriteHistory = await QuestionFavorite.findOne({
            where: {
                question_id: questionId,
                user_id: userId,
            }
        });

        // 如果没有点收藏过，那就新增。并且题目的 favoritesCount + 1
        if (!favoriteHistory) {
            await QuestionFavorite.create({ question_id: questionId, user_id: userId });
            await question.increment('favorite_count');
            success(res, '点收藏成功。');
        } else {
            // 如果点收藏过了，那就删除点收藏记录，并且题目的 favoritesCount - 1
            await favoriteHistory.destroy();
            await question.decrement('favorite_count');
            success(res, '取消收藏成功。');
        }
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 查询用户点收藏的题目
 * GET /favoritequestions
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        // 查询当前用户
        const user = await User.findByPk(req.user.id);

        // 查询当前用户点收藏过的题目
        const questions = await user.getUserFavoritedQuestions({
            include: [{
                model: Question,
                as: 'parent', // 在这里指定别名
                attributes: { exclude: ['content'] }
            }],
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset,
        });

        // 查询当前用户点收藏过的题目总数
        const count = await user.countUserFavoritedQuestions();

        success(res, '查询用户点收藏的题目成功。', {
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