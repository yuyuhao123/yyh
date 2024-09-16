const express = require('express');
const router = express.Router();
const { Category } = require('../../models');
const { Op } = require('sequelize');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


/**
 * 查询分类列表
 * GET /admin/categories
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

        const { count, rows } = await Category.findAndCountAll(condition);
        success(res, '查询分类列表成功。', {
            categories: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error); // 打印错误对象
        failure(res, error);
    }
});

/**
 * 查询分类详情
 * GET /admin/categories/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const category = await getCategory(req);
        success(res, '查询分类成功。', { category });
    } catch (error) {
        console.error('Error fetching category:', error); // 打印错误对象
        failure(res, error);
    }
});

/**
 * 创建分类
 * POST /admin/categories
 */
router.post('/', async function (req, res) {
    try {
        const body = filterBody(req);

        // 验证 parent_id 是否存在
        if (body.parent_id) {
            const parentCategory = await Category.findByPk(body.parent_id);
            if (!parentCategory) {
                return res.status(400).json({
                    status: false,
                    message: '父分类不存在。',
                    errors: [`父分类ID: ${body.parent_id} 不存在。`]
                });
            }
        }

        const category = await Category.create(body);
        success(res, '创建分类成功。', { category }, 201);
    } catch (error) {
        console.error('Error creating category:', error); // 打印错误对象

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
            message: '创建分类失败。',
            errors: [error.message]
        });
    }
});

/**
 * 更新分类
 * PUT /admin/categories/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const category = await getCategory(req);
        const body = filterBody(req);

        // 验证 parent_id 是否存在
        if (body.parent_id) {
            const parentCategory = await Category.findByPk(body.parent_id);
            if (!parentCategory) {
                return res.status(400).json({
                    status: false,
                    message: '父分类不存在。',
                    errors: [`父分类ID: ${body.parent_id} 不存在。`]
                });
            }
        }

        await category.update(body);
        success(res, '更新分类成功。', { category });
    } catch (error) {
        console.error('Error updating category:', error); // 打印错误对象

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
            message: '更新分类失败。',
            errors: [error.message]
        });
    }
});

/**
 * 删除分类
 * DELETE /admin/categories/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const category = await getCategory(req);

        await category.destroy();
        success(res, '删除分类成功。');
    } catch (error) {
        console.error('Error deleting category:', error); // 打印错误对象
        res.status(500).json({
            status: false,
            message: '删除分类失败。',
            errors: [error.message]
        });
    }
});

/**
 * 公共方法：查询当前分类
 */
async function getCategory(req) {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
        throw new NotFoundError(`ID: ${id}的分类未找到。`);
    }

    return category;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{name, parent_id}}
 */
function filterBody(req) {
    return {
        name: req.body.name,
        parent_id: req.body.parent_id
    };
}

module.exports = router;