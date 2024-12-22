'use strict';

const { User } = require('../models'); // 确保路径正确

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const posts = [];
    const comments = [];
    const userIds = [1, 2, 3, 4, 5, 6]; // 用户 ID 范围
    const schoolIds = [1, 2, 3]; // 学校 ID 范围

    // 随机封面图片数组（使用真实的图片链接）
    const coverImages = [
      'https://picsum.photos/seed/picsum/400/300',
      'https://picsum.photos/seed/lorem/400/300',
      'https://picsum.photos/seed/1/400/300',
      'https://picsum.photos/seed/2/400/300',
      'https://picsum.photos/seed/3/400/300',
      'https://picsum.photos/seed/4/400/300',
      'https://picsum.photos/seed/5/400/300',
      'https://picsum.photos/seed/6/400/300',
      'https://picsum.photos/seed/7/400/300',
      'https://picsum.photos/seed/8/400/300'
    ];

    // 生成 100 条主帖子
    for (let i = 1; i <= 100; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const schoolId = schoolIds[Math.floor(Math.random() * schoolIds.length)];
      
      // 随机决定是否添加封面图片
      const shouldHaveImage = Math.random() < 0.7; // 70% 的概率有图片
      const coverImage = shouldHaveImage ? coverImages[Math.floor(Math.random() * coverImages.length)] : null; // 70% 概率选择图片，30% 概率为 null

      const post = {
        title: `帖子标题${i}`,
        content: `帖子内容${i}`,
        user_id: userId,
        school_id: schoolId,
        parent_id: null, // 主帖子没有父 ID
        likes_count: Math.floor(Math.random() * 100),
        views_count: Math.floor(Math.random() * 1000),
        favorite_count: Math.floor(Math.random() * 50),
        is_recommended: Math.random() < 0.5,
        video: null,
        type: Math.floor(Math.random() * 5) + 1,
        status: Math.random() < 0.5 ? 'published' : 'draft',
        cover_image: coverImage, // 使用随机选择的封面图片或 null
        createdAt: new Date(),
        updatedAt: new Date()
      };

      posts.push(post);
    }

    // 批量插入主帖子
    await queryInterface.bulkInsert('Posts', posts, {});

    // 生成多级评论
    for (let i = 1; i <= 100; i++) { // 为每个主帖子生成 2 条评论
      for (let j = 1; j <= 2; j++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const comment = {
          title: `评论标题${i}-${j}`,
          content: `评论内容${i}-${j}`,
          user_id: userId,
          school_id: schoolIds[Math.floor(Math.random() * schoolIds.length)],
          parent_id: i, // 将评论的 parent_id 设置为主帖子的 ID
          likes_count: Math.floor(Math.random() * 10),
          views_count: Math.floor(Math.random() * 100),
          favorite_count: Math.floor(Math.random() * 5),
          is_recommended: Math.random() < 0.5,
          video: null,
          type: 4, // 评论类型
          status: 'published',
          cover_image: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        comments.push(comment);

        // 为每条评论生成 1 条子评论
        const subComment = {
          title: `子评论标题${i}-${j}-1`,
          content: `子评论内容${i}-${j}-1`,
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          school_id: schoolIds[Math.floor(Math.random() * schoolIds.length)],
          parent_id: comments.length + 1, // 将子评论的 parent_id 设置为当前评论的 ID
          likes_count: Math.floor(Math.random() * 5),
          views_count: Math.floor(Math.random() * 50),
          favorite_count: Math.floor(Math.random() * 2),
          is_recommended: Math.random() < 0.5,
          video: null,
          type: 5, // 子评论类型
          status: 'published',
          cover_image: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        comments.push(subComment);
      }
    }

    // 批量插入评论
    await queryInterface.bulkInsert('Posts', comments, {});
  },

  down: async (queryInterface, Sequelize) => {
    // 删除所有 Posts 数据
    await queryInterface.bulkDelete('Posts', null, {});
  }
};