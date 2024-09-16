const express = require('express');
const router = express.Router();
const { School } = require('../../models');
const { Op } = require('sequelize');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


/**
 * 查询学校列表
 * GET /admin/schools
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

        if (query.name) {
            condition.where = {
                name: {
                    [Op.like]: `%${query.name}%`
                }
            };
        }

        const { count, rows } = await School.findAndCountAll(condition);
        success(res, '查询学校列表成功。', {
            schools: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            }
        });
    } catch (error) {
        console.error('Error fetching schools:', error); // 打印错误对象
        failure(res, error);
    }
});

/**
 * 查询学校详情
 * GET /admin/schools/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const school = await getSchool(req);
        success(res, '查询学校成功。', { school });
    } catch (error) {
        console.error('Error fetching school:', error); // 打印错误对象
        failure(res, error);
    }
});

/**
 * 创建学校
 * POST /admin/schools
 */
router.post('/', async function (req, res) {
    try {
        const body = filterBody(req);

        const school = await School.create(body);
        success(res, '创建学校成功。', { school }, 201);
    } catch (error) {
        console.error('Error creating school:', error); // 打印错误对象

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
            message: '创建学校失败。',
            errors: [error.message]
        });
    }
});

/**
 * 更新学校
 * PUT /admin/schools/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const school = await getSchool(req);
        const body = filterBody(req);

        await school.update(body);
        success(res, '更新学校成功。', { school });
    } catch (error) {
        console.error('Error updating school:', error); // 打印错误对象

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
            message: '更新学校失败。',
            errors: [error.message]
        });
    }
});

/**
 * 删除学校
 * DELETE /admin/schools/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const school = await getSchool(req);

        await school.destroy();
        success(res, '删除学校成功。');
    } catch (error) {
        console.error('Error deleting school:', error); // 打印错误对象
        res.status(500).json({
            status: false,
            message: '删除学校失败。',
            errors: [error.message]
        });
    }
});

/**
 * 公共方法：查询当前学校
 */
async function getSchool(req) {
    const { id } = req.params;

    const school = await School.findByPk(id);
    if (!school) {
        throw new NotFoundError(`ID: ${id}的学校未找到。`);
    }

    return school;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{name, number, introduce}}
 */
function filterBody(req) {
    return {
        name: req.body.name,
        number: req.body.number,
        introduce: req.body.introduce
    };
}

module.exports = router;
``