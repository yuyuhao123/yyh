'use strict';
const express = require('express');
const router = express.Router();
const { Category, User, School, SchoolCategory, Question } = require('../models');
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

    // 查询用户信息，获取用户的目标学校
    const user = await User.findByPk(userId, {
      include: [{
        model: School,
        as: 'targetSchool' // 假设您在 User 模型中定义了这个别名
      }]
    });

    if (!user || !user.targetSchool) {
      throw new NotFoundError(`用户 ID: ${userId} 或其关联的学校未找到。`);
    }

    const schoolId = user.targetSchool.id; // 获取学校 ID

    // 查询与目标学校相关的一级章节及其下的二级章节
    const categories = await Category.findAll({
      where: {
        parent_id: null // 查找一级章节
      },
      include: [
        {
          model: SchoolCategory,
          where: { school_id: schoolId }, // 过滤条件：只获取与目标学校相关的一级章节
          as: 'schoolCategories', // 确保使用正确的别名
          attributes: [] // 不返回 schoolCategories 的字段
        },
        {
          model: Category,
          as: 'children', // 递归获取二级章节
          include: [
            {
              model: SchoolCategory,
              where: { school_id: schoolId }, // 过滤条件：只获取与目标学校相关的二级章节
              as: 'schoolCategories', // 确保使用正确的别名
              attributes: [] // 不返回 schoolCategories 的字段
            }
          ],
          attributes: { exclude: ['schoolCategories'] } // 不返回二级章节的 schoolCategories 字段
        }
      ],
      attributes: { exclude: ['schoolCategories'] } // 不返回一级章节的 schoolCategories 字段
    });

    success(res, '查询目标学校要考的一级章节及其下的二级章节成功。', { categories });
  } catch (error) {
    failure(res, error);
  }
});


// // 查询某个分类的所有题目
// router.get('/:categoryId/questions', async (req, res) => {
//   const { categoryId } = req.params;

//   try {
//     // 查找指定分类
//     const category = await Category.findOne({
//       where: { id: categoryId },
//       include: [
//         {
//           model: Category,
//           as: 'children', // 关联二级章节
//           include: [
//             {
//               model: Question,
//               as: 'questions', // 确保使用正确的别名
//               attributes: ['id', 'content', 'createdAt'],
//             }
//           ]
//         },
//         {
//           model: Question,
//           as: 'questions', // 确保使用正确的别名
//           attributes: ['id', 'content', 'createdAt'],
//         }
//       ]
//     });

//     if (!category) {
//       return res.status(404).json({ status: false, message: '分类未找到' });
//     }

//     // 整理题目列表
//     const questions = [];

//     // 如果是一级章节，添加二级章节的题目
//     if (category.parent_id === null) {
//       if (Array.isArray(category.children)) {
//         category.children.forEach(child => {
//           if (Array.isArray(child.questions)) {
//             questions.push(...child.questions); // 添加二级章节的题目
//           }
//         });
//       }
//     }

//     // 添加当前分类的题目
//     if (Array.isArray(category.questions)) {
//       questions.push(...category.questions);
//     }

//     return res.json({
//       status: true,
//       message: '查询成功',
//       data: questions
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ status: false, message: '服务器错误', error: error.message });
//   }
// });


// 查询某个分类的所有题目，包括所有子分类
router.get('/:categoryId/questions', async (req, res) => {
  const { categoryId } = req.params;

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
      attributes: ['id', 'content', 'createdAt']
    });

    return res.json({
      status: true,
      message: '查询成功',
      data: questions
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: '服务器错误', error: error.message });
  }
});


module.exports = router;