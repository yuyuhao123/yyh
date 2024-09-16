'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED // 无符号
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false, // 不允许为空
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false, // 不允许为空
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false, // 不允许为空
      },
      nickname: {
        type: Sequelize.STRING,
        allowNull: true, // 允许为空
      },
      sex: {
        type: Sequelize.INTEGER,
        allowNull: false, // 不允许为空
        defaultValue: 0, // 默认值为0，0代表未知，1代表男性，2代表女性
      },
      photo: {
        type: Sequelize.STRING,
        allowNull: true, // 允许为空
      },
      introduce: {
        type: Sequelize.STRING,
        allowNull: true, // 允许为空
      },
      role: {
        type: Sequelize.INTEGER,
        allowNull: false, // 不允许为空
        defaultValue: 0, // 默认值为0，0代表普通用户，1代表管理员， 2代表封禁用户
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true, // 允许为空
      },
      original_school_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: true, // 允许为空
      },
      target_school_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: true, // 允许为空
        references: {
          model: 'Schools', // 确保这里的表名与实际表名一致
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // 添加索引
    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      fields: 'email'
    });
    await queryInterface.addIndex('Users', ['nickname']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};