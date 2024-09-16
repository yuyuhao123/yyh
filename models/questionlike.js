'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuestionLike extends Model {
    static associate(models) {
      QuestionLike.belongsTo(models.Question, { foreignKey: 'question_id', as: 'question' });
      QuestionLike.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  QuestionLike.init({
    question_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      },
      validate: {
        notNull: { msg: '问题 ID 不能为空。' },
        isInt: { msg: '问题 ID 必须是整数。' }
      }
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      validate: {
        notNull: { msg: '用户 ID 不能为空。' },
        isInt: { msg: '用户 ID 必须是整数。' }
      }
    }
  }, {
    sequelize,
    modelName: 'QuestionLike',
    hooks: {
      beforeCreate: validateForeignKeys,
      beforeUpdate: validateForeignKeys
    }
  });

  async function validateForeignKeys(questionLike) {
    const { Question, User } = sequelize.models;

    const question = await Question.findByPk(questionLike.question_id);
    if (!question) {
      throw new Error(`问题 ID: ${questionLike.question_id} 不存在。`);
    }

    const user = await User.findByPk(questionLike.user_id);
    if (!user) {
      throw new Error(`用户 ID: ${questionLike.user_id} 不存在。`);
    }
  }

  return QuestionLike;
};