const express = require('express');
const router = express.Router();
const { Post, User, School } = require('../../models');
const { Op } = require('sequelize');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


/**
 * 查询帖子列表
 * GET /admin/posts
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
            offset: offset,
            include: [
                { model: User, as: 'user' },
                { model: School, as: 'school' }
            ]
        };

        if (query.title) {
            condition.where = {
                title: {
                    [Op.like]: `%${query.title}%`
                }
            };
        }

        const { count, rows } = await Post.findAndCountAll(condition);
        success(res, '查询帖子列表成功。', {
            posts: rows,
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

/**
 * 查询帖子详情
 * GET /admin/posts/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const post = await getPost(req);
        success(res, '查询帖子成功。', { post });
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 创建帖子
 * POST /admin/posts
 */
router.post('/', async function (req, res) {
    try {
        const body = filterBody(req);
        body.user_id = req.user.id;

        const post = await Post.create(body);
        success(res, '创建帖子成功。', { post }, 201);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            res.status(400).json({
                status: false,
                message: '请求参数错误。',
                errors
            });
        } else {
            res.status(500).json({
                status: false,
                message: '创建帖子失败。',
                errors: [error.message]
            });
        }
    }
});

/**
 * 更新帖子
 * PUT /admin/posts/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const post = await getPost(req);
        const body = filterBody(req);

        // 验证请求体
        if (!body.title || !body.content ) {
            return failure(res, '标题、内容和用户ID是必需的。', 400);
        }
        await post.update(body);
        success(res, '更新帖子成功。', { post });
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 删除帖子
 * DELETE /admin/posts/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const post = await getPost(req);
        await post.destroy();
        success(res, '删除帖子成功。');
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 公共方法：查询当前帖子
 */
async function getPost(req) {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
        include: [
            {
                model: Post,
                as: 'children', // 获取子评论
                include: [
                    {
                        model: Post,
                        as: 'children' // 递归获取多级评论
                    }
                ]
            },
            { model: User, as: 'user' },
            { model: School, as: 'school' }
        ]
        // include: [
        //     { model: User, as: 'user' },
        //     { model: School, as: 'school' }
        // ]
    });
    if (!post) {
        throw new NotFoundError(`ID: ${id}的帖子未找到。`)
    }

    return post;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{title, content: (string|string|DocumentFragment|*), user_id: *, school_id: *, video: *, type: *, likes_count: *, views_count: *, is_recommended: *, status: *, cover_image: *}}
 */
function filterBody(req) {
    return {
        title: req.body.title,
        content: req.body.content,
        school_id: req.body.school_id,
        parent_id: req.body.parent_id,
        likes_count: req.body.likes_count || 0, // 默认值为 0
        views_count: req.body.views_count || 0, // 默认值为 0
        favorite_count: req.body.favorite_count || 0,
        is_recommended: req.body.is_recommended || false, // 默认值为 false
        video: req.body.video,
        type: req.body.type,
        status: req.body.status || 'published', // 默认值为 'published'
        cover_image: req.body.cover_image // 允许为空
    };
}

module.exports = router;