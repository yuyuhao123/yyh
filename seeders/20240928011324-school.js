'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Schools', [
      {
        name: '山东大学',
        number: 1,
        introduce: '这是山东大学的介绍。',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '华中科技大学',
        number: 2,
        introduce: '这是华中科技大学的介绍。',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '西安交通大学',
        number: 3,
        introduce: '这是西安交通大学的介绍。',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Schools', null, {});
  }
};
