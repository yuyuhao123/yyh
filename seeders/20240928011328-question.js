'use strict';

const { User } = require('../models'); // 确保路径正确

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const questions = [];
    const comments = [];
    const userIds = [1, 2, 3, 4, 5, 6]; // 用户 ID 范围
    const userNicknames = {
      1: '管理员1',
      2: '普通用户1',
      3: '管理员2',
      4: '普通用户2',
      5: '管理员3',
      6: '普通用户3'
    };

    // 生成 100 条主问题
    for (let i = 1; i <= 100; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];

      const question = {
        title: `问题标题${i}`,
        content: `问题内容${i}`,
        user_id: userId,
        parent_id: null, // 主问题没有父 ID
        likes_count: Math.floor(Math.random() * 100),
        views_count: Math.floor(Math.random() * 1000),
        favorite_count: Math.floor(Math.random() * 50),
        is_recommended: Math.random() < 0.5,
        category_id: Math.floor(Math.random() * 6) + 6,
        video: null,
        type: Math.floor(Math.random() * 6) + 6,
        status: Math.random() < 0.5 ? 'published' : 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      questions.push(question);
    }

    // 批量插入主问题
    await queryInterface.bulkInsert('Questions', questions, {});

    // 生成多级评论
    let commentIdCounter = 101; // 假设评论的 ID 是从 101 开始的
    for (let i = 1; i <= 100; i++) { // 为每个主问题生成 2 条一级评论
      for (let j = 1; j <= 2; j++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const comment = {
          title: `一级评论标题${i}-${j}`,
          content: `一级评论内容${i}-${j}`,
          user_id: userId,
          parent_id: i, // 将评论的 parent_id 设置为主问题的 ID
          likes_count: Math.floor(Math.random() * 10),
          views_count: Math.floor(Math.random() * 100),
          favorite_count: Math.floor(Math.random() * 5),
          is_recommended: Math.random() < 0.5,
          video: null,
          type: 1, // 评论类型
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        comments.push(comment);

        // 计算当前评论的 ID
        const currentCommentId = commentIdCounter;
        commentIdCounter++;

        // 为每条一级评论生成 1 条二级评论
        const subComment = {
          title: `二级评论标题${i}-${j}-1`,
          content: `二级评论内容${i}-${j}-1`,
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          parent_id: currentCommentId, // 将子评论的 parent_id 设置为当前评论的 ID
          likes_count: Math.floor(Math.random() * 5),
          views_count: Math.floor(Math.random() * 50),
          favorite_count: Math.floor(Math.random() * 2),
          is_recommended: Math.random() < 0.5,
          video: null,
          type: 2, // 子评论类型
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        comments.push(subComment);

        // 计算当前二级评论的 ID
        const currentSubCommentId = commentIdCounter;
        commentIdCounter++;

        // 为每条二级评论生成 1 条三级评论
        const thirdLevelComment = {
          title: userNicknames[subComment.user_id], // 三级评论的 title 为二级评论用户的昵称
          content: `三级评论内容${i}-${j}-1-1`,
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          parent_id: currentSubCommentId, // 将三级评论的 parent_id 设置为当前二级评论的 ID
          likes_count: Math.floor(Math.random() * 3),
          views_count: Math.floor(Math.random() * 30),
          favorite_count: Math.floor(Math.random() * 1),
          is_recommended: Math.random() < 0.5,
          video: null,
          type: 3, // 三级评论类型
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        comments.push(thirdLevelComment);
        commentIdCounter++; // 三级评论的 ID 也需要递增
      }
    }

    // 批量插入评论和子评论
    await queryInterface.bulkInsert('Questions', comments, {});
  },

  down: async (queryInterface, Sequelize) => {
    // 删除所有 Questions 数据
    await queryInterface.bulkDelete('Questions', null, {});
  }
};