'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class School extends Model {
    static associate(models) {
      // 定义与 User 的一对多关系
      School.hasMany(models.User, { as: 'users', foreignKey: 'target_school_id' });

      // 定义与 Category 的多对多关系
      School.belongsToMany(models.Category, {
        through: models.SchoolCategory,
        foreignKey: 'school_id',
        as: 'Categories'
      });
    }
  }

  School.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '学校名称不能为空。'
        }
      }
    },
    number: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: {
          msg: '学校编号必须是整数。'
        },
        min: {
          args: [1],
          msg: '学校编号必须是正整数。'
        }
      }
    },
    introduce: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'School',
  });

  return School;
};