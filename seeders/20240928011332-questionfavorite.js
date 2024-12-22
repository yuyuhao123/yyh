// seeders/20231001-demo-question-favorites.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const questionFavorites = [];
    for (let i = 1; i <= 100; i++) { // 假设有 100 条主问题
      const userId = Math.floor(Math.random() * 6) + 1; // 随机选择用户 ID 1-6
      questionFavorites.push({
        question_id: i, // 主问题 ID
        user_id: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await queryInterface.bulkInsert('QuestionFavorites', questionFavorites);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('QuestionFavorites', null, {});
  }
};