'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PostLikes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED // 无符号
      },
      post_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: false, // 不允许为空
        references: {
          model: 'Posts', // 引用的目标模型名
          key: 'id', // 引用的目标模型的键
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 添加联合唯一索引
    await queryInterface.addIndex('PostLikes', ['post_id', 'user_id'], {
      unique: true,
      name: 'post_user_unique_index'
    });
  },

  async down(queryInterface, Sequelize) {
    // 移除联合唯一索引
    await queryInterface.removeIndex('PostLikes', 'post_user_unique_index');
    // 删除 PostLikes 表
    await queryInterface.dropTable('PostLikes');
  }
};