'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 插入示例用户数据
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin1@example.com',
        username: 'admin1',
        password: bcrypt.hashSync('password123', 10), // 使用 bcrypt 进行密码哈希处理
        nickname: '管理员1',
        sex: 0,
        role: 1, // 管理员
        photo: 'https://picsum.photos/seed/1/400/300',
        introduce: '我是管理员1',
        last_login: null,
        original_school_id: null,
        target_school_id: 1, // 假设学校ID为1
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user1@example.com',
        username: 'user1',
        password: bcrypt.hashSync('password123', 10),
        nickname: '普通用户1',
        sex: 1,
        role: 0, // 普通用户
        photo: 'https://picsum.photos/seed/1/400/300',
        introduce: '我是普通用户1',
        last_login: null,
        original_school_id: null,
        target_school_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin2@example.com',
        username: 'admin2',
        password: bcrypt.hashSync('password123', 10),
        nickname: '管理员2',
        sex: 0,
        role: 1,
        photo: 'https://picsum.photos/seed/1/400/300',
        introduce: '我是管理员2',
        last_login: null,
        original_school_id: null,
        target_school_id: 2, // 假设学校ID为2
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user2@example.com',
        username: 'user2',
        password: bcrypt.hashSync('password123', 10),
        nickname: '普通用户2',
        sex: 1,
        role: 0,
        photo: 'https://picsum.photos/seed/1/400/300',
        introduce: '我是普通用户2',
        last_login: null,
        original_school_id: null,
        target_school_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin3@example.com',
        username: 'admin3',
        password: bcrypt.hashSync('password123', 10),
        nickname: '管理员3',
        sex: 0,
        role: 1,
        photo: 'https://picsum.photos/seed/1/400/300',
        introduce: '我是管理员3',
        last_login: null,
        original_school_id: null,
        target_school_id: 3, // 假设学校ID为3
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user3@example.com',
        username: 'user3',
        password: bcrypt.hashSync('password123', 10),
        nickname: '普通用户3',
        sex: 1,
        role: 0,
        photo: 'https://picsum.photos/seed/1/400/300',
        introduce: '我是普通用户3',
        last_login: null,
        original_school_id: null,
        target_school_id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // 删除 Users 表中的所有数据
    await queryInterface.bulkDelete('Users', null, {});
  }
};