const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError } = require('../utils/errors');
const { success, failure } = require('../utils/responses');

module.exports = async (req, res, next) => {
    try {
        // 判断 Token 是否存在
        const { token } = req.headers;
        if (!token) {
            throw new UnauthorizedError('当前user接口需要认证才能访问。')
        }

        // 验证token是否正确
        const decoded = jwt.verify(token, process.env.SECRET);

        // 从jwt中，解析出之前存入的userId
        const { userId } = decoded;

        // 查询一下，当前用户
        const user = await User.findByPk(userId);
        if (!user) {
            throw new UnauthorizedError('用户不存在。')
        }

        req.user = user;

        next();
    } catch (error) {
        failure(res, error);
    }
};
