'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 定义关联关系
      User.belongsTo(models.School, {
        foreignKey: 'target_school_id',
        as: 'targetSchool'
      });
      User.hasMany(models.Post, {
        foreignKey: 'user_id',
        as: 'posts'
      });
      User.hasMany(models.Question, {
        foreignKey: 'user_id',
        as: 'questions'
      });
      User.belongsToMany(models.Post, {
        through: models.PostFavorite,
        foreignKey: 'user_id',
        as: 'UserFavoritedPosts'
      });
      User.belongsToMany(models.Post, {
        through: models.PostLike,
        foreignKey: 'user_id',
        as: 'UserLikedPosts'
      });
      User.belongsToMany(models.Question, {
        through: models.QuestionLike,
        foreignKey: 'user_id',
        as: 'UserLikedQuestions'
      });
      User.belongsToMany(models.Question, {
        through: models.QuestionFavorite,
        foreignKey: 'user_id',
        as: 'UserFavoritedQuestions'
      });
    }
  }

  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: '邮箱必须填写。' },
        notEmpty: { msg: '邮箱不能为空。' },
        isEmail: { msg: '邮箱格式不正确。' },
        async isUnique(value) {
          try {
            const user = await User.findOne({ where: { email: value } });
            if (user) {
              throw new Error('邮箱已存在，请直接登录。');
            }
          } catch (error) {
            throw new Error('检查邮箱唯一性时出错。');
          }
        }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: '用户名必须填写。' },
        notEmpty: { msg: '用户名不能为空。' },
        len: { args: [2, 45], msg: '用户名长度必须是2 ~ 45之间。' },
        async isUnique(value) {
          const user = await User.findOne({ where: { username: value } })
          if (user) {
            throw new Error('用户名已经存在。');
          }
        }
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        // 检查是否为空
        if (!value) {
          throw new Error('密码必须填写。');
        }

        // 检查长度
        if (value.length < 6 || value.length > 45) {
          throw new Error('密码长度必须是6 ~ 45之间。');
        }

        // 如果通过所有验证，进行hash处理并设置值
        this.setDataValue('password', bcrypt.hashSync(value, 10));
      }
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: '昵称必须填写。' },
        notEmpty: { msg: '昵称不能为空。' },
        len: { args: [2, 45], msg: '昵称长度必须是2 ~ 45之间。' }
      }
    },
    sex: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        notNull: { msg: '性别必须填写。' },
        notEmpty: { msg: '性别不能为空。' },
        isIn: { args: [[0, 1, 2]], msg: '性别的值必须是,男性:0 女性:1 未选择:2。' }
      }
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isIn: {
          args: [[0, 1, 2]],
          msg: '角色必须是0(普通用户)、1(管理员)或2(封禁用户)。'
        }
      }
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    introduce: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    original_school_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    target_school_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'Schools',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};