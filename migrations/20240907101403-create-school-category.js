'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SchoolCategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED // 无符号
      },
      category_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: false, // 不允许为空
        references: {
          model: 'Categories', // 引用的目标模型名
          key: 'id', // 引用的目标模型的键
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      school_id: {
        type: Sequelize.INTEGER.UNSIGNED, // 无符号
        allowNull: false, // 不允许为空
        references: {
          model: 'Schools', // 引用的目标模型名
          key: 'id', // 引用的目标模型的键
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      exam_frequency: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
          min: 1,
          max: 5
        }
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

    await queryInterface.addIndex('SchoolCategories', ['category_id', 'school_id'], {
      unique: true,
      name: 'school_category_unique_index'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('SchoolCategories', 'school_category_unique_index');
    await queryInterface.dropTable('SchoolCategories');
  }
};