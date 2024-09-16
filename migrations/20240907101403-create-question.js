'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED // 无符号
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false, // 不允许为空
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false, // 不允许为空
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: false, // 不允许为空
        references: {
          model: 'Users', // 引用的目标模型名
          key: 'id', // 引用的目标模型的键
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: true, // 允许为空
        references: {
          model: 'Categories', // 引用的目标模型名
          key: 'id', // 引用的目标模型的键
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // 如果分类被删除，设置为 NULL
      },
      parent_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: true, // 允许为空，表示根问题
        references: {
          model: 'Questions', // 引用自身
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // 如果父问题被删除，设置为 NULL
      },
      video: {
        type: Sequelize.STRING, // 视频字段
        allowNull: true, // 允许为空
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1 // 默认1，为经验贴，2为学校相关信息分析贴，3为求助答疑，4为学习笔记
      },
      difficulty: {
        type: Sequelize.INTEGER, // 难度字段
        allowNull: true, // 允许为空
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0 // 默认点赞数为 0
      },
      views_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0 // 默认阅读数为 0
      },
      favorite_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0 // 默认收藏数为 0
      },
      is_recommended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false // 默认不推荐
      },
      status: {
        type: Sequelize.ENUM('published', 'draft', 'ban'), // published（已发布）、draft（草稿）、ban（设为不可见）
        defaultValue: 'published' // 默认状态为已发布
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Questions');
  }
};