const express = require('express');
const router = express.Router();
const axios = require('axios');
const { User } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../utils/errors");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");


/**
 * 微信登录
 * POST /auth/wechat_login
 */
router.post('/wechat_login', async (req, res) => {
    const { code, avatarUrl, nickName, gender } = req.body; // 接收头像、昵称和性别
    const appid = process.env.WECHAT_APPID; // 微信小程序的 appid
    const secret = process.env.WECHAT_SECRET; // 微信小程序的 secret
    try {
        console.log('请求微信服务器获取 openid 和 session_key');
        const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
            params: {
                appid,
                secret,
                js_code: code,
                grant_type: 'authorization_code',
            },
        });

        console.log('微信服务器响应:', response.data);
        const { openid } = response.data;

        // 在数据库中查找用户
        console.log('查找用户，openid:', openid);
        let user = await User.findOne({ where: { openid } });
        if (!user) {
            console.log('用户不存在，创建新用户');
            user = await User.create({
                openid,
                email: '123456@qq.com', // 使用默认邮箱
                username: `user_${openid}`, // 生成一个默认用户名
                nickname: nickName || `用户_${openid}`, // 使用微信昵称
                password: bcryptjs.hashSync('12345678', 10), // 使用默认密码
                sex: gender || 2, // 使用微信性别，默认值为2
                photo: avatarUrl, // 存储头像 URL
                role: 0 // 默认角色
            });
            console.log('新用户创建成功:', user);
        } else {
            console.log('用户已存在:', user);
        }

        // 生成 JWT token
        const token = jwt.sign({ userId: user.id }, process.env.SECRET, { expiresIn: '30d' });
        console.log('生成的token:', token);
        success(res, '登录成功', { token });
    } catch (error) {
        console.error('登录过程中发生错误:', error);
        failure(res, error);
    }
});


/**
 * 用户注册
 * POST /auth/sign_up
 */
router.post('/sign_up', async function (req, res) {
    try {
        const body = {
            email: req.body.email,
            username: req.body.username,
            nickname: req.body.nickname,
            password: req.body.password,
            sex: 2,
            role: 0
        }

        const user = await User.create(body);
        delete user.dataValues.password;

        success(res, '创建用户成功。', { user }, 201);
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 用户登录
 * POST /auth/sign_in
 */
router.post('/sign_in', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login) {
            throw new BadRequestError('邮箱/用户名必须填写。');
        }

        if (!password) {
            throw new BadRequestError('密码必须填写。');
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
            throw new NotFoundError('用户不存在，无法登录。');
        }

        // 验证密码
        const isPasswordValid = bcryptjs.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('密码错误。');
        }

        // 生成身份验证令牌
        const token = jwt.sign({
            userId: user.id
        }, process.env.SECRET, { expiresIn: '30d' }
        );
        success(res, '登录成功。', { token });
    } catch (error) {
        failure(res, error);
    }
});


module.exports = router;
