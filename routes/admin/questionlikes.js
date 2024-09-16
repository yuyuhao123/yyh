const express = require('express');
const router = express.Router();
const { QuestionLike, Question, User } = require('../../models');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/**
 * 查询 QuestionLike 列表
 * GET /admin/questionlikes
 */
router.get('/', async function (req, res) {
  try {
    const questionLikes = await QuestionLike.findAll({
      include: [
        { model: Question, as: 'question' },
        { model: User, as: 'user' }
      ]
    });
    success(res, '获取所有 QuestionLike 成功', { questionLikes });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 查询特定的 QuestionLike
 * GET /admin/questionlikes/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const questionLike = await getQuestionLike(req);
    success(res, '获取 QuestionLike 成功', { questionLike });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 创建或更新 QuestionLike
 * POST /admin/questionlikes
 */
router.post('/', async function (req, res) {
  try {
    const body = filterBody(req);
    const [questionLike, created] = await QuestionLike.findOrCreate({
      where: { question_id: body.question_id, user_id: body.user_id },
      defaults: body // 这里可以设置其他默认字段
    });

    if (!created) {
      // 如果记录已存在，更新它
      await questionLike.update(body);
    }

    success(res, created ? '创建 QuestionLike 成功' : '更新 QuestionLike 成功', { questionLike }, created ? 201 : 200);
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
        message: '创建或更新 QuestionLike 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 更新特定的 QuestionLike
 * PUT /admin/questionlikes/:id
 */
router.put('/:id', async function (req, res) {
  try {
    const questionLike = await getQuestionLike(req);
    const body = filterBody(req);

    await questionLike.update(body);
    success(res, '更新 QuestionLike 成功', { questionLike });
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
        message: '更新 QuestionLike 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 删除特定的 QuestionLike
 * DELETE /admin/questionlikes/:id
 */
router.delete('/:id', async function (req, res) {
  try {
    const questionLike = await getQuestionLike(req);
    await questionLike.destroy();
    success(res, '删除 QuestionLike 成功');
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 获取特定的 QuestionLike
 * @param {Object} req - 请求对象
 * @returns {Promise<QuestionLike>}
 */
async function getQuestionLike(req) {
  const id = req.params.id;
  console.log(`Fetching QuestionLike with ID: ${id}`);
  const questionLike = await QuestionLike.findByPk(id, {
    include: [
      { model: Question, as: 'question' },
      { model: User, as: 'user' }
    ]
  });
  if (!questionLike) {
    throw new NotFoundError(`ID: ${id}的 QuestionLike 未找到。`);
  }
  return questionLike;
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