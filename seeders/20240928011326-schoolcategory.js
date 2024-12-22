'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('SchoolCategories', [
      // 山东大学
      {
        category_id: 1, // 自由度
        school_id: 1,    // 山东大学
        exam_frequency: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 2,
        school_id: 1,    // 山东大学
        exam_frequency: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 3, // 凸轮
        school_id: 1,    // 山东大学
        exam_frequency: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 4, // 齿轮
        school_id: 1,    // 山东大学
        exam_frequency: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 5,
        school_id: 1,    // 山东大学
        exam_frequency: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 华中科技大学
      {
        category_id: 1, // 自由度
        school_id: 2,    // 华中科技大学
        exam_frequency: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 2, // 连杆
        school_id: 2,    // 华中科技大学
        exam_frequency: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 3, // 凸轮
        school_id: 2,    // 华中科技大学
        exam_frequency: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 4, // 齿轮
        school_id: 2,    // 华中科技大学
        exam_frequency: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 5, // 轮系
        school_id: 2,    // 华中科技大学
        exam_frequency: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 6,
        school_id: 2,    // 华中科技大学
        exam_frequency: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 7,
        school_id: 2,    // 华中科技大学
        exam_frequency: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 西安交通大学
      {
        category_id: 1, // 自由度
        school_id: 3,    // 西安交通大学
        exam_frequency: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 2,
        school_id: 3,    // 西安交通大学
        exam_frequency: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 3, // 凸轮
        school_id: 3,    // 西安交通大学
        exam_frequency: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 4, // 齿轮
        school_id: 3,    // 西安交通大学
        exam_frequency: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 5,
        school_id: 3,    // 西安交通大学
        exam_frequency: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 6,
        school_id: 3,    // 西安交通大学
        exam_frequency: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('SchoolCategories', null, {});
  }
};