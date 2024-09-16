const express = require('express');
const router = express.Router();
const { SchoolCategory, Category, School } = require('../../models');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


/**
 * 查询 SchoolCategory 列表
 * GET /admin/schoolcategories
 */
router.get('/', async function (req, res) {
  try {
    const schoolCategories = await SchoolCategory.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: School, as: 'school' }
      ]
    });
    success(res, '获取所有 SchoolCategory 成功', { schoolCategories });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 查询特定的 SchoolCategory
 * GET /admin/schoolcategories/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const schoolCategory = await getSchoolCategory(req);
    success(res, '获取 SchoolCategory 成功', { schoolCategory });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 创建新的 SchoolCategory
 * POST /admin/schoolcategories
 */
router.post('/', async function (req, res) {
  try {
    const body = filterBody(req);
    const [foundOrCreatedSchoolCategory, created] = await SchoolCategory.findOrCreate({
      where: { category_id: body.category_id, school_id: body.school_id },
      defaults: body
    });
    if (!created) {
      await foundOrCreatedSchoolCategory.update(body);
    }
    success(res, created ? '创建 SchoolCategory 成功' : '更新 SchoolCategory 成功', { foundOrCreatedSchoolCategory }, created ? 201 : 200);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => e.message);
      res.status(400).json({
        status: false,
        message: '请求参数错误。',
        errors
      });
    } else {
      res.status(500).json({
        status: false,
        message: '创建 SchoolCategory 失败。',
        errors: [err]
      });
    }
  }
});

/**
 * 更新特定的 SchoolCategory
 * PUT /admin/schoolcategories/:id
 */
router.put('/:id', async function (req, res) {
  try {
    const schoolCategory = await getSchoolCategory(req);
    const body = filterBody(req);

    await schoolCategory.update(body);
    success(res, '更新 SchoolCategory 成功', { schoolCategory });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => e.message);
      res.status(400).json({
        status: false,
        message: '请求参数错误。',
        errors
      });
    } else {
      res.status(500).json({
        status: false,
        message: '更新 SchoolCategory 失败。',
        errors: [err]
      });
    }
  }
});

/**
 * 删除特定的 SchoolCategory
 * DELETE /admin/schoolcategories/:id
 */
router.delete('/:id', async function (req, res) {
  try {
    const schoolCategory = await getSchoolCategory(req);
    await schoolCategory.destroy();
    success(res, '删除 SchoolCategory 成功');
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 公共方法：查询当前 SchoolCategory
 */
async function getSchoolCategory(req) {
  const { id } = req.params;
  const schoolCategory = await SchoolCategory.findByPk(id, {
    include: [
      { model: Category, as: 'category' },
      { model: School, as: 'school' }
    ]
  });
  if (!schoolCategory) {
    throw new NotFoundError(`ID: ${id} 的 SchoolCategory 未找到。`);
  }
  return schoolCategory;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{category_id, school_id}}
 */
function filterBody(req) {
  return {
    category_id: req.body.category_id,
    school_id: req.body.school_id,
    exam_frequency: req.exam_frequency
  };
}

module.exports = router;