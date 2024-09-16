'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // 定义与 SchoolCategory 的多对多关系
      Category.belongsToMany(models.School, {
        through: models.SchoolCategory,
        foreignKey: 'category_id',
        as: 'schools'
      });

      // 定义与 SchoolCategory 的一对多关系
      Category.hasMany(models.SchoolCategory, {
        foreignKey: 'category_id',
        as: 'schoolCategories'
      });

      Category.hasMany(models.Question, {
        foreignKey: 'category_id', // 假设 Question 表中有 category_id 字段
        as: 'questions' // 定义别名
      });

      // 自引用关系，定义父分类和子分类的关系
      Category.belongsTo(models.Category, {
        foreignKey: 'parent_id',
        as: 'parent'
      });

      Category.hasMany(models.Category, {
        foreignKey: 'parent_id',
        as: 'children'
      });
    }
  }

  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '分类名称不能为空。'
        }
      }
    },
    parent_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      validate: {
        isInt: {
          msg: '父分类ID必须是整数。'
        },
        min: {
          args: [0],
          msg: '父分类ID不能为负数。'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
  });

  return Category;
};