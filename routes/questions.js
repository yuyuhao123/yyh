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
      attributes: {  },
      // attributes: { exclude: ['content'] },
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
 * 递归获取多级评论并简化数据结构
 */
async function getComments(question) {
  const children = await Question.findAll({
    where: { parent_id: question.id },
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
 * 查询题目详情
 * GET /questions/:id
 */
router.get('/:id', async function (req, res) {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'photo'] }
      ]
    });

    if (!question) {
      throw new NotFoundError(`ID: ${id}的题目未找到。`);
    }

    const questionData = question.toJSON();
    questionData.children = await getComments(question);

    const simplifiedQuestion = {
      id: questionData.id,
      title: questionData.title,
      content: questionData.content,
      user: questionData.user,
      parent_id: questionData.parent_id,
      likes_count: questionData.likes_count,
      type: questionData.type,
      difficulty: questionData.difficulty,
      createdAt: questionData.createdAt,
      children: questionData.children
    };

    success(res, '查询题目成功。', { question: simplifiedQuestion });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;