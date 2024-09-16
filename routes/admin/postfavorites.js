const express = require('express');
const router = express.Router();
const { PostFavorite, Post, User } = require('../../models');
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/**
 * 查询 PostFavorite 列表
 * GET /admin/postfavorites
 */
router.get('/', async function (req, res) {
  try {
    const postFavorites = await PostFavorite.findAll({
      include: [
        { model: Post, as: 'post' },
        { model: User, as: 'user' }
      ]
    });
    success(res, '获取所有 PostFavorite 成功', { postFavorites });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 查询特定的 PostFavorite
 * GET /admin/postfavorites/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const postFavorite = await getPostFavorite(req);
    success(res, '获取 PostFavorite 成功', { postFavorite });
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 创建或更新 PostFavorite
 * POST /admin/postfavorites
 */
router.post('/', async function (req, res) {
  try {
    const body = filterBody(req);
    const [postFavorite, created] = await PostFavorite.findOrCreate({
      where: { post_id: body.post_id, user_id: body.user_id },
      defaults: body // 这里可以设置其他默认字段
    });

    if (!created) {
      // 如果记录已存在，更新它
      await postFavorite.update(body);
    }

    success(res, created ? '创建 PostFavorite 成功' : '更新 PostFavorite 成功', { postFavorite }, created ? 201 : 200);
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
        message: '创建或更新 PostFavorite 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 更新特定的 PostFavorite
 * PUT /admin/postfavorites/:id
 */
router.put('/:id', async function (req, res) {
  try {
    const postFavorite = await getPostFavorite(req);
    const body = filterBody(req);

    await postFavorite.update(body);
    success(res, '更新 PostFavorite 成功', { postFavorite });
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
        message: '更新 PostFavorite 失败。',
        errors: [error.message]
      });
    }
  }
});

/**
 * 删除特定的 PostFavorite
 * DELETE /admin/postfavorites/:id
 */
router.delete('/:id', async function (req, res) {
  try {
    const postFavorite = await getPostFavorite(req);
    await postFavorite.destroy();
    success(res, '删除 PostFavorite 成功');
  } catch (err) {
    failure(res, err);
  }
});

/**
 * 获取特定的 PostFavorite
 * @param {Object} req - 请求对象
 * @returns {Promise<PostFavorite>}
 */
async function getPostFavorite(req) {
  const id = req.params.id;
  console.log(`Fetching PostFavorite with ID: ${id}`);
  const postFavorite = await PostFavorite.findByPk(id, {
    include: [
      { model: Post, as: 'post' },
      { model: User, as: 'user' }
    ]
  });
  if (!postFavorite) {
    throw new NotFoundError(`ID: ${id}的 PostFavorite 未找到。`);
  }
  return postFavorite;
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