const express = require('express');
const router = express.Router();
const { QuestionFavorite, Question, User } = require('../../models');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/**
 * 查询 QuestionFavorite 列表
 * GET /admin/questionfavorites
 */
router.get('/', async function (req, res) {
  try {
    const questionFavorites = await QuestionFavorite.findAll({
      include: [
        { model: Question, as: 'question' },
        { model: User, as: 'user' }
      ]
    });
    success(res, '获取所有 QuestionFavorite 成功', { questionFavorites });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 查询特定的 QuestionFavorite
 * GET /admin/questionfavorites/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const questionFavorite = await getQuestionFavorite(req);
    success(res, '获取 QuestionFavorite 成功', { questionFavorite });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 创建或更新 QuestionFavorite
 * POST /admin/questionfavorites
 */
router.post('/', async function (req, res) {
  try {
    const body = filterBody(req);
    const [questionFavorite, created] = await QuestionFavorite.findOrCreate({
      where: { question_id: body.question_id, user_id: body.user_id },
      defaults: body // 这里可以设置其他默认字段
    });

    if (!created) {
      // 如果记录已存在，更新它
      await questionFavorite.update(body);
    }

    success(res, created ? '创建 QuestionFavorite 成功' : '更新 QuestionFavorite 成功', { questionFavorite }, created ? 201 : 200);
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
        message: '创建或更新 QuestionFavorite 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 更新特定的 QuestionFavorite
 * PUT /admin/questionfavorites/:id
 */
router.put('/:id', async function (req, res) {
  try {
    const questionFavorite = await getQuestionFavorite(req);
    const body = filterBody(req);

    await questionFavorite.update(body);
    success(res, '更新 QuestionFavorite 成功', { questionFavorite });
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
        message: '更新 QuestionFavorite 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 删除特定的 QuestionFavorite
 * DELETE /admin/questionfavorites/:id
 */
router.delete('/:id', async function (req, res) {
  try {
    const questionFavorite = await getQuestionFavorite(req);
    await questionFavorite.destroy();
    success(res, '删除 QuestionFavorite 成功');
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 获取特定的 QuestionFavorite
 * @param {Object} req - 请求对象
 * @returns {Promise<QuestionFavorite>}
 */
async function getQuestionFavorite(req) {
  const id = req.params.id;
  console.log(`Fetching QuestionFavorite with ID: ${id}`);
  const questionFavorite = await QuestionFavorite.findByPk(id, {
    include: [
      { model: Question, as: 'question' },
      { model: User, as: 'user' }
    ]
  });
  if (!questionFavorite) {
    throw new NotFoundError(`ID: ${id}的 QuestionFavorite 未找到。`);
  }
  return questionFavorite;
}

/**
 * 过滤请求体
 * @param {Object} req - 请求对象
 * @returns {Object}
 */
function filterBody(req) {
  const { question_id, user_id } = req.body; // 只保留 question_id 和 user_id
  return { question_id, user_id };
}

module.exports = router;