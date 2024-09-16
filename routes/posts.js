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
      attributes: { exclude: ['content'] },
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset,
      where: {
        parent_id: null,
      }
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
 * 查询文章详情
 * GET /posts/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const { id } = req.params;

    // const post = await Post.findByPk(id);
    const post = await Post.findByPk(id, {
      include: [
        {
          model: Post,
          as: 'children', // 获取子评论
          include: [
            {
              model: Post,
              as: 'children' // 递归获取多级评论
            }
          ]
        },
        { model: User, as: 'user' },
        { model: School, as: 'school' }
      ]
    });
    if (!post) {
      throw new NotFoundError(`ID: ${id}的文章未找到。`)
    }

    success(res, '查询文章成功。', { post });
  } catch (error) {
    failure(res, error);
  }
});


module.exports = router; 
