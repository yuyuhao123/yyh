const express = require('express');
const router = express.Router();
const { Question, User, Category } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError } = require("../utils/errors");

/**
 * 查询题目列表
 * GET /questions
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

    const { count, rows } = await Question.findAndCountAll(condition);
    success(res, '查询题目列表成功。', {
      questions: rows,
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
 * 查询题目详情
 * GET /questions/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const { id } = req.params;

    // const question = await Question.findByPk(id);
    const question = await Question.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'children', // 获取子评论
          include: [
            {
              model: Question,
              as: 'children' // 递归获取多级评论
            }
          ]
        },
        { model: User, as: 'user' },
        { model: Category, as: 'category'},
      ]
    });
    if (!question) {
      throw new NotFoundError(`ID: ${id}的题目未找到。`)
    }

    success(res, '查询题目成功。', { question });
  } catch (error) {
    failure(res, error);
  }
});


module.exports = router; 
