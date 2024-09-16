const express = require('express');
const router = express.Router();
const { Question, Category } = require('../../models');
const { Op } = require('sequelize');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


/**
 * 查询问题列表
 * GET /admin/questions
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        const condition = {
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        };

        if (query.content) {
            condition.where = {
                content: {
                    [Op.like]: `%${query.content}%`
                }
            };
        }

        const { count, rows } = await Question.findAndCountAll(condition);
        success(res, '查询问题列表成功。', {
            questions: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            }
        });
    } catch (error) {
        console.error('Error fetching questions:', error); // 打印错误对象
        failure(res, error);
    }
});

/**
 * 查询问题详情
 * GET /admin/questions/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const question = await getQuestion(req);
        success(res, '查询问题成功。', { question });
    } catch (error) {
        console.error('Error fetching question:', error); // 打印错误对象
        failure(res, error);
    }
});

/**
 * 创建问题
 * POST /admin/questions
 */
router.post('/', async function (req, res) {
    try {
        const body = filterBody(req);

        // 验证 category_id 是否存在
        if (body.category_id) {
            const category = await Category.findByPk(body.category_id);
            if (!category) {
                return res.status(400).json({
                    status: false,
                    message: '分类不存在。',
                    errors: [`分类ID: ${body.category_id} 不存在。`]
                });
            }
        }

        const question = await Question.create(body);
        success(res, '创建问题成功。', { question }, 201);
    } catch (error) {
        console.error('Error creating question:', error); // 打印错误对象

        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({
                status: false,
                message: '请求参数错误。',
                errors
            });
        }
        res.status(500).json({
            status: false,
            message: '创建问题失败。',
            errors: [error.message]
        });
    }
});

/**
 * 更新问题
 * PUT /admin/questions/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const question = await getQuestion(req);
        const body = filterBody(req);

        // 验证 category_id 是否存在
        if (body.category_id) {
            const category = await Category.findByPk(body.category_id);
            if (!category) {
                return res.status(400).json({
                    status: false,
                    message: '分类不存在。',
                    errors: [`分类ID: ${body.category_id} 不存在。`]
                });
            }
        }

        await question.update(body);
        success(res, '更新问题成功。', { question });
    } catch (error) {
        console.error('Error updating question:', error); // 打印错误对象

        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({
                status: false,
                message: '请求参数错误。',
                errors
            });
        }
        res.status(500).json({
            status: false,
            message: '更新问题失败。',
            errors: [error.message]
        });
    }
});

/**
 * 删除问题
 * DELETE /admin/questions/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const question = await getQuestion(req);

        await question.destroy();
        success(res, '删除问题成功。');
    } catch (error) {
        console.error('Error deleting question:', error); // 打印错误对象
        res.status(500).json({
            status: false,
            message: '删除问题失败。',
            errors: [error.message]
        });
    }
});

/**
 * 获取问题详情
 * @param {Object} req - 请求对象
 * @returns {Promise<Question>} - 返回问题对象
 * @throws {NotFoundError} - 如果问题不存在，抛出 NotFoundError
 */
async function getQuestion(req) {
    const id = req.params.id;
    const question = await Question.findByPk(id);
    if (!question) {
        throw new NotFoundError(`问题ID: ${id} 不存在。`);
    }
    return question;
}

/**
 * 过滤请求体
 * @param {Object} req - 请求对象
 * @returns {Object} - 返回过滤后的请求体
 */
function filterBody(req) {
    return {
        title: req.body.title,
        content: req.body.content,
        category_id: req.body.category_id,
        parent_id: req.body.parent_id,
        likes_count: req.body.likes_count || 0, // 默认值为 0
        views_count: req.body.views_count || 0, // 默认值为 0
        favorite_count: req.body.favorite_count || 0,
        is_recommended: req.body.is_recommended || false, // 默认值为 false
        video: req.body.video,
        type: req.body.type,
        difficulty: req.body.difficulty,
        status: req.body.status || 'published', // 默认值为 'published'
    };
}

module.exports = router;