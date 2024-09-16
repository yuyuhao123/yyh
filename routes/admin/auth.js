const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { Op } = require('sequelize');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * 管理员登录
 * POST /admin/auth/sign_in
 */
router.post('/sign_in', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login) {
            throw new BadRequestError('邮箱/用户名必须填写。');
        }

        if (!password) {
            throw new BadRequestError('密码必须填写');
        }

        const condition = {
            where: {
                [Op.or]: [
                    { email: login },
                    { username: login }
                ]
            }
        };

        // 通过email或username，查询用户是否存在
        const user = await User.findOne(condition);
        if (!user) {
            throw new NotFoundError('用户不存在，无法登陆');
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('密码错误。');
        }

        // 验证是否管理员
        if (user.role !== 1) {
            throw new UnauthorizedError('您没有权限登陆管理员后台。');
        }

        // 生成身份验证令牌
        const token = jwt.sign({
            userId: user.id
        }, process.env.SECRET, { expiresIn: '30d' });

        success(res, '登录成功。', { token });
    } catch (error) {
        failure(res, error);
    }
});

module.exports = router;