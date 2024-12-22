// seeders/20231001-demo-post-likes.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const postLikes = [];
    for (let i = 1; i <= 100; i++) { // 假设有 100 条主帖子
      const userId = Math.floor(Math.random() * 6) + 1; // 随机选择用户 ID 1-6
      postLikes.push({
        post_id: i, // 主帖子 ID
        user_id: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await queryInterface.bulkInsert('PostLikes', postLikes);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PostLikes', null, {});
  }
};