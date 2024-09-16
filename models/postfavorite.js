'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostFavorite extends Model {
    static associate(models) {
      PostFavorite.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
      PostFavorite.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  PostFavorite.init({
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
    modelName: 'PostFavorite',
    hooks: {
      beforeCreate: validateForeignKeys,
      beforeUpdate: validateForeignKeys
    }
  });

  async function validateForeignKeys(postFavorite) {
    const { Post, User } = sequelize.models;

    const post = await Post.findByPk(postFavorite.post_id);
    if (!post) {
      throw new Error(`帖子 ID: ${postFavorite.post_id} 不存在。`);
    }

    const user = await User.findByPk(postFavorite.user_id);
    if (!user) {
      throw new Error(`用户 ID: ${postFavorite.user_id} 不存在。`);
    }
  }

  return PostFavorite;
};