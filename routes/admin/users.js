const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { Op } = require('sequelize');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');
const bcrypt = require('bcrypt');

/**
 * 查询用户列表
 * GET /admin/users
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

        if (query.username) {
            condition.where = {
                username: {
                    [Op.like]: `%${query.username}%`
                }
            };
        }

        const { count, rows } = await User.findAndCountAll(condition);
        success(res, '查询用户列表成功。', {
            users: rows,
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
 * 查询用户详情
 * GET /admin/users/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const user = await getUser(req);
        success(res, '查询用户成功。', { user });
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 创建用户
 * POST /admin/users
 */
router.post('/', async function (req, res) {
    try {
        const body = filterBody(req);
        // body.password = await bcrypt.hash(body.password, 10); // 加密密码

        const user = await User.create(body);
        success(res, '创建用户成功。', { user }, 201);
    } catch (error) {
        console.error('Error creating user:', error); // 打印错误对象

        if (error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({
                status: false,
                message: '请求参数错误。',
                errors
            });
        }
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
            message: '创建用户失败。',
            errors: [error.message]
        });
    }
});

/**
 * 更新用户
 * PUT /admin/users/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const user = await getUser(req);
        const body = filterBody(req);

        // if (body.password) {
        //     body.password = await bcrypt.hash(body.password, 10); // 加密密码
        // }

        await user.update(body);
        success(res, '更新用户成功。', { user });
    } catch (error) {
        console.error('Error updating user:', error); // 打印错误对象

        if (error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({
                status: false,
                message: '请求参数错误。',
                errors
            });
        }
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
            message: '更新用户失败。',
            errors: [error.message]
        });
    }
});

/**
 * 删除用户
 * DELETE /admin/users/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const user = await getUser(req);

        await user.destroy();
        success(res, '删除用户成功。');
    } catch (error) {
        console.error('Error deleting user:', error); // 打印错误对象
        res.status(500).json({
            status: false,
            message: '删除用户失败。',
            errors: [error.message]
        });
    }
});

/**
 * 公共方法：查询当前用户
 */
async function getUser(req) {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
        throw new NotFoundError(`ID: ${id}的用户未找到。`);
    }

    return user;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{email, username, password, nickname, sex, photo, introduce, role, original_school_id, target_school_id}}
 */
function filterBody(req) {
    return {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        nickname: req.body.nickname,
        sex: req.body.sex,
        photo: req.body.photo,
        introduce: req.body.introduce,
        role: req.body.role,
        original_school_id: req.body.original_school_id,
        target_school_id: req.body.target_school_id
    };
}

module.exports = router;