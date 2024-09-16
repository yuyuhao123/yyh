'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SchoolCategory extends Model {
    static associate(models) {
      SchoolCategory.belongsTo(models.Category, { as: 'category', foreignKey: 'category_id' });
      SchoolCategory.belongsTo(models.School, { as: 'school', foreignKey: 'school_id' });
    }
  }

  SchoolCategory.init({
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    school_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id'
      }
    },
    exam_frequency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    sequelize,
    modelName: 'SchoolCategory',
    indexes: [
      {
        unique: true,
        fields: ['category_id', 'school_id']
      }
    ],
    hooks: {
      beforeCreate: async (schoolCategory, options) => {
        await validateForeignKeys(schoolCategory);
      },
      beforeUpdate: async (schoolCategory, options) => {
        await validateForeignKeys(schoolCategory);
      }
    }
  });

  async function validateForeignKeys(schoolCategory) {
    const { Category, School } = sequelize.models;

    const category = await Category.findByPk(schoolCategory.category_id);
    if (!category) {
      throw new Error(`分类 ID: ${schoolCategory.category_id} 不存在。`);
    }

    const school = await School.findByPk(schoolCategory.school_id);
    if (!school) {
      throw new Error(`学校 ID: ${schoolCategory.school_id} 不存在。`);
    }
  }

  return SchoolCategory;
};