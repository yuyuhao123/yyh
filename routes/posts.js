const express = require('express');
const router = express.Router();
const { Post, User, School } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError } = require("../utils/errors");

/**
 * 查询文章列表
 * GET /posts
 */
router.get('/', async function (req, res) {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      // attributes: { exclude: ['content'] },
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset,
      where: {
        parent_id: null,
      },
      include: [
        { model: User, as: 'user' }, // 包含用户信息
      ]
    };

    const { count, rows } = await Post.findAndCountAll(condition);
    success(res, '查询文章列表成功。', {
      posts: rows,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      }
    });
  } catch (error) {
    failure(res, error);
  }
});


/**
 * 递归获取多级评论并简化数据结构
 */
async function getComments(post) {
  const children = await Post.findAll({
    where: { parent_id: post.id },
    include: [
      { model: User, as: 'user', attributes: ['id', 'nickname', 'photo'] }
    ]
  });

  return await Promise.all(children.map(async (child) => {
    const childData = child.toJSON();
    childData.children = await getComments(child);
    return {
      id: childData.id,
      title: childData.title,
      content: childData.content,
      user: childData.user,
      parent_id: childData.parent_id,
      likes_count: childData.likes_count,
      type: childData.type,
      difficulty: childData.difficulty,
      createdAt: childData.createdAt,
      children: childData.children
    };
  }));
}



/**
 * 查询文章详情
 * GET /posts/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'photo'] },
        { model: School, as: 'school' }
      ]
    });

    if (!post) {
      throw new NotFoundError(`ID: ${id}的文章未找到。`);
    }

    const postData = post.toJSON();
    postData.children = await getComments(post);

    const simplifiedPost = {
      id: postData.id,
      title: postData.title,
      content: postData.content,
      user: postData.user,
      parent_id: postData.parent_id,
      likes_count: postData.likes_count,
      type: postData.type,
      difficulty: postData.difficulty,
      createdAt: postData.createdAt,
      children: postData.children
    };

    success(res, '查询文章成功。', { post: simplifiedPost });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;
