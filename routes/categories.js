'use strict';
const express = require('express');
const router = express.Router();
const { Category, User, School, SchoolCategory, Question, QuestionLike } = require('../models'); // 确保使用正确的模型名称
const { success, failure } = require('../utils/responses');
const { NotFoundError } = require("../utils/errors");
const { Op } = require('sequelize');

/**
 * 查询当前用户目标学校要考的一级章节及其下的二级章节
 * GET /categories
 */
router.get('/', async function (req, res) {
  try {
    const userId = req.user.id; // 假设用户信息存储在 req.user 中

    // 查询与目标学校相关的一级章节及其下的二级章节
    const categories = await Category.findAll({
      where: {
        parent_id: null // 查找一级章节
      },
      include: [
        {
          model: SchoolCategory,
          as: 'schoolCategories',
          attributes: []
        },
        {
          model: Category,
          as: 'children',
          include: [
            {
              model: SchoolCategory,
              as: 'schoolCategories',
              attributes: []
            }
          ],
          attributes: { exclude: ['schoolCategories'] }
        }
      ],
      attributes: { exclude: ['schoolCategories'] }
    });

    // 获取当前分类和所有子分类的 ID
    const categoryIds = categories.map(category => category.id);
    const childCategoryIds = categories.flatMap(category => category.children.map(child => child.id));
    const allCategoryIds = [...categoryIds, ...childCategoryIds];

    // 查询题目表，使用 OR 来查找多个章节 ID 的题目
    const questions = await Question.findAll({
      where: {
        category_id: {
          [Op.or]: allCategoryIds
        }
      },
      attributes: ['id', 'content', 'createdAt', 'category_id', 'type']
    });

    // 查询用户完成的题目
    const likeQuestions = await QuestionLike.findAll({ // 使用 QuestionLike
      where: {
        user_id: userId,
        question_id: {
          [Op.in]: questions.map(q => q.id)
        }
      },
      attributes: ['question_id']
    });

    const likeQuestionIds = likeQuestions.map(fq => fq.question_id);

    // 计算每个分类的题目数量和完成的题目数量
    const questionsCount = questions.reduce((acc, question) => {
      const categoryId = question.category_id;

      // 初始化分类计数
      if (!acc[categoryId]) {
        acc[categoryId] = {
          questionCount: 0,
          completeCount: 0
        };
      }

      // 更新总数
      acc[categoryId].questionCount += 1;

      // 更新完成数量
      if (likeQuestionIds.includes(question.id)) {
        acc[categoryId].completeCount += 1;
      }

      return acc;
    }, {});

    // 将题目数量和完成数量添加到分类中
    const categoriesWithCounts = categories.map(category => {
      const counts = questionsCount[category.id] || {
        questionCount: 0,
        completeCount: 0
      };

      // 为子分类添加 questionCount 和 completeCount 字段
      const childrenWithCounts = category.children.map(child => {
        const childCounts = questionsCount[child.id] || {
          questionCount: 0,
          completeCount: 0
        };
        return {
          ...child.toJSON(),
          ...childCounts
        };
      });

      // 合并子分类的计数到一级分类
      childrenWithCounts.forEach(child => {
        counts.questionCount += child.questionCount;
        counts.completeCount += child.completeCount;
      });

      return {
        ...category.toJSON(),
        ...counts,
        children: childrenWithCounts
      };
    });

    success(res, '查询目标学校要考的一级章节及其下的二级章节成功。', { categories: categoriesWithCounts });
  } catch (error) {
    failure(res, error);
  }
});


// 查询某个分类的所有题目，包括所有子分类
router.get('/:categoryId/questions', async (req, res) => {
  const { categoryId } = req.params;
  const { type } = req.query; // 获取查询参数 type
  const userId = req.user.id; // 从请求中获取用户 ID

  try {
    // 查找指定分类及其子分类
    const category = await Category.findOne({
      where: { id: categoryId },
      include: [
        {
          model: Category,
          as: 'children', // 关联子分类
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ status: false, message: '分类未找到' });
    }

    // 获取当前分类和所有子分类的 ID
    const categoryIds = [category.id, ...(category.children.map(child => child.id))];

    // 查询题目表，使用 OR 来查找多个章节 ID 的题目
    const questions = await Question.findAll({
      where: {
        category_id: {
          [Op.or]: categoryIds // 使用 OR 查询多个章节 ID
        }
      },
      include: [
        {
          model: User,
          as: 'questionLikeUsers', // 使用定义的别名
          required: false, // 允许没有关联
          where: { id: userId }, // 只获取当前用户的点赞
          attributes: ['id'] // 只获取 ID
        },
        {
          model: User,
          as: 'questionFavoriteUsers', // 使用定义的别名
          required: false, // 允许没有关联
          where: { id: userId }, // 只获取当前用户的点赞
          attributes: ['id'] // 只获取 ID
        }
      ]
    });

    // 根据 type 参数过滤题目
    let filteredQuestions;
    if (type === 'unfinished') {
      // 过滤出未完成的题目
      filteredQuestions = questions.filter(question => 
        !question.questionLikeUsers.some(user => user.id === userId)
      );
    } else {
      // 默认返回所有题目
      filteredQuestions = questions;
    }

    return res.json({
      status: true,
      message: '查询成功',
      data: filteredQuestions
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: '服务器错误', error: error.message });
  }
});

module.exports = router;