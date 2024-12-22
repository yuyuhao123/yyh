// seeders/20231001-demo-post-favorites.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const postFavorites = [];
    for (let i = 1; i <= 100; i++) { // 假设有 100 条主帖子
      const userId = Math.floor(Math.random() * 6) + 1; // 随机选择用户 ID 1-6
      postFavorites.push({
        post_id: i, // 主帖子 ID
        user_id: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await queryInterface.bulkInsert('PostFavorites', postFavorites);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PostFavorites', null, {});
  }
};