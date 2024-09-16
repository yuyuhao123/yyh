const express = require('express');
const router = express.Router();
const { PostLike, Post, User } = require('../../models');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/**
 * 查询 PostLike 列表
 * GET /admin/postlikes
 */
router.get('/', async function (req, res) {
  try {
    const postLikes = await PostLike.findAll({
      include: [
        { model: Post, as: 'post' },
        { model: User, as: 'user' }
      ]
    });
    success(res, '获取所有 PostLike 成功', { postLikes });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 查询特定的 PostLike
 * GET /admin/postlikes/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const postLike = await getPostLike(req);
    success(res, '获取 PostLike 成功', { postLike });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 创建或更新 PostLike
 * POST /admin/postlikes
 */
router.post('/', async function (req, res) {
  try {
    const body = filterBody(req);
    const [postLike, created] = await PostLike.findOrCreate({
      where: { post_id: body.post_id, user_id: body.user_id },
      defaults: body // 这里可以设置其他默认字段
    });

    if (!created) {
      // 如果记录已存在，更新它
      await postLike.update(body);
    }

    success(res, created ? '创建 PostLike 成功' : '更新 PostLike 成功', { postLike }, created ? 201 : 200);
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
        message: '创建或更新 PostLike 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 更新特定的 PostLike
 * PUT /admin/postlikes/:id
 */
router.put('/:id', async function (req, res) {
  try {
    const postLike = await getPostLike(req);
    const body = filterBody(req);

    await postLike.update(body);
    success(res, '更新 PostLike 成功', { postLike });
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
        message: '更新 PostLike 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 删除特定的 PostLike
 * DELETE /admin/postlikes/:id
 */
router.delete('/:id', async function (req, res) {
  try {
    const postLike = await getPostLike(req);
    await postLike.destroy();
    success(res, '删除 PostLike 成功');
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 获取特定的 PostLike
 * @param {Object} req - 请求对象
 * @returns {Promise<PostLike>}
 */
async function getPostLike(req) {
  const id = req.params.id;
  console.log(`Fetching PostLike with ID: ${id}`);
  const postLike = await PostLike.findByPk(id, {
    include: [
      { model: Post, as: 'post' },
      { model: User, as: 'user' }
    ]
  });
  if (!postLike) {
    throw new NotFoundError(`ID: ${id}的 PostLike 未找到。`);
  }
  return postLike;
}

/**
 * 过滤请求体
 * @param {Object} req - 请求对象
 * @returns {Object}
 */
function filterBody(req) {
  const { post_id, user_id } = req.body; // 只保留 post_id 和 user_id
  return { post_id, user_id };
}

module.exports = router;