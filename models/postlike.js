'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostLike extends Model {
    static associate(models) {
      PostLike.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
      PostLike.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  PostLike.init({
    post_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id'
      },
      validate: {
        notNull: { msg: '帖子 ID 不能为空。' },
        isInt: { msg: '帖子 ID 必须是整数。' }
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
    modelName: 'PostLike',
    hooks: {
      beforeCreate: validateForeignKeys,
      beforeUpdate: validateForeignKeys
    }
  });

  async function validateForeignKeys(postLike) {
    const { Post, User } = sequelize.models;

    const post = await Post.findByPk(postLike.post_id);
    if (!post) {
      throw new Error(`帖子 ID: ${postLike.post_id} 不存在。`);
    }

    const user = await User.findByPk(postLike.user_id);
    if (!user) {
      throw new Error(`用户 ID: ${postLike.user_id} 不存在。`);
    }
  }

  return PostLike;
};