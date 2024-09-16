'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuestionLikes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED // 无符号
      },
      question_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: false, // 不允许为空
        references: {
          model: 'Questions', // 引用的目标模型名
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
    await queryInterface.addIndex('QuestionLikes', ['question_id', 'user_id'], {
      unique: true,
      name: 'question_user_unique_index'
    });
  },

  async down(queryInterface, Sequelize) {
    // 移除联合唯一索引
    await queryInterface.removeIndex('QuestionLikes', 'question_user_unique_index');
    // 删除 QuestionLikes 表
    await queryInterface.dropTable('QuestionLikes');
  }
};