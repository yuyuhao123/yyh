'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Categories', [
      {
        name: '自由度',
        parent_id: null, // 顶级分类
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '连杆',
        parent_id: null, // 顶级分类
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '凸轮',
        parent_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '齿轮',
        parent_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '轮系',
        parent_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '高副低代',
        parent_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '拆分杆组',
        parent_id: 1, 
        createdAt: new Date(),
        updatedAt: new Date()
      } ,
      {
        name: '连杆解析法',
        parent_id: 2, 
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '凸轮画图题',
        parent_id: 3, 
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '齿轮普通题',
        parent_id: 4, 
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '轮系普通题',
        parent_id: 5, 
        createdAt: new Date(),
        updatedAt: new Date()
      }
  
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};