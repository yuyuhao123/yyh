const express = require('express');
const router = express.Router();
const { UserQuestion, Question, User } = require('../../models');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


/**
 * 查询 UserQuestion 列表
 * GET /admin/userquestions
 */
router.get('/', async function (req, res) {
  try {
    const userQuestions = await UserQuestion.findAll({
      include: [
        { model: Question, as: 'question' },
        { model: User, as: 'user' }
      ]
    });
    success(res, '获取所有 UserQuestion 成功', { userQuestions });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 查询特定的 UserQuestion
 * GET /admin/userquestions/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const userQuestion = await getUserQuestion(req);
    success(res, '获取 UserQuestion 成功', { userQuestion });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 创建或更新 UserQuestion
 * POST /admin/userquestions
 */
router.post('/', async function (req, res) {
  try {
    const body = filterBody(req);
    const [foundOrCreatedUserQuestion, created] = await UserQuestion.findOrCreate({
      where: { question_id: body.question_id, user_id: body.user_id },
      defaults: body
    });

    if (!created) {
      await foundOrCreatedUserQuestion.update(body);
    }

    success(res, created ? '创建 UserQuestion 成功' : '更新 UserQuestion 成功', { userQuestion }, created ? 201 : 200);
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
        message: '创建或更新 UserQuestion 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 更新特定的 UserQuestion
 * PUT /admin/userquestions/:id
 */
router.put('/:id', async function (req, res) {
  try {
    const userQuestion = await getUserQuestion(req);
    const body = filterBody(req);

    await userQuestion.update(body);
    success(res, '更新 UserQuestion 成功', { userQuestion });
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
        message: '更新 UserQuestion 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 删除特定的 UserQuestion
 * DELETE /admin/userquestions/:id
 */
router.delete('/:id', async function (req, res) {
  try {
    const userQuestion = await getUserQuestion(req);
    await userQuestion.destroy();
    success(res, '删除 UserQuestion 成功');
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 获取特定的 UserQuestion
 * @param {Object} req - 请求对象
 * @returns {Promise<UserQuestion>}
 */
async function getUserQuestion(req) {
  const id = req.params.id;
  const userQuestion = await UserQuestion.findByPk(id, {
    include: [
      { model: Question, as: 'question' },
      { model: User, as: 'user' }
    ]
  });
  if (!userQuestion) {
    throw new NotFoundError('UserQuestion 未找到');
  }
  return userQuestion;
}

/**
 * 过滤请求体
 * @param {Object} req - 请求对象
 * @returns {Object}
 */
function filterBody(req) {
  const { question_id, user_id, like, collect, resolve } = req.body;
  return { question_id, user_id, like, collect, resolve };
}

module.exports = router;