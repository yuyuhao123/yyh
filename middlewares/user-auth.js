const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError } = require('../utils/errors');
const { success, failure } = require('../utils/responses');

module.exports = async (req, res, next) => {
    try {
        // 从 Authorization 头部提取 token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('当前user接口需要认证才能访问。');
            throw new UnauthorizedError('当前user接口需要认证才能访问。');
        }

        // Bearer token
        const token = authHeader.split(' ')[1]; // 获取 token 部分
        if (!token) {
            console.log('当前user接口需要认证才能访问。');
            throw new UnauthorizedError('当前user接口需要认证才能访问。');
        }

        console.log(token);
        // 验证 token 是否正确
        const decoded = jwt.verify(token, process.env.SECRET);

        // 从 jwt 中解析出之前存入的 userId
        const { userId } = decoded;

        // 查询一下，当前用户
        const user = await User.findByPk(userId);
        if (!user) {
            throw new UnauthorizedError('用户不存在。');
        }

        req.user = user;

        next();
    } catch (error) {
        failure(res, error);
    }
};
