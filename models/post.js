'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        school_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'Schools', // 假设你有一个 Schools 模型
                key: 'id'
            }
        },
        parent_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'Posts', // 引用自身
                key: 'id'
            }
        },
        likes_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0 // 默认点赞数为 0
        },
        views_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0 // 默认阅读数为 0
        },
        favorite_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0 // 默认收藏数为 0
        },
        is_recommended: {
            type: DataTypes.BOOLEAN,
            defaultValue: false // 默认不推荐
        },
        video: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1 // 默认值为 1经验贴 2考情分析 3其他
        },
        status: {
            type: DataTypes.ENUM('published', 'draft', 'archived'),
            defaultValue: 'published' // 默认状态为已发布
        },
        cover_image: {
            type: DataTypes.STRING,
            allowNull: true // 允许为空
        }
    }, {
        hooks: {
            beforeCreate: async (post, options) => {
                await validateForeignKeys(post);
            },
            beforeUpdate: async (post, options) => {
                await validateForeignKeys(post);
            }
        }
    });

    Post.associate = function (models) {
        Post.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
        Post.belongsTo(models.School, { as: 'school', foreignKey: 'school_id' }); // 假设你有一个 Schools 模型
        Post.belongsToMany(models.User, { through: models.PostLike, foreignKey: 'post_id', as: 'postLikeUsers' });
        Post.belongsToMany(models.User, { through: models.PostFavorite, foreignKey: 'post_id', as: 'postFavoriteUsers' });

        // 自引用关系
        Post.belongsTo(Post, { as: 'parent', foreignKey: 'parent_id' }); // 父评论
        Post.hasMany(Post, { as: 'children', foreignKey: 'parent_id' }); // 子评论
    };

    return Post;
};

async function validateForeignKeys(post) {
    const { User, School } = require('./index'); // 确保路径正确

    const user = await User.findByPk(post.user_id);
    if (!user) {
        throw new Error('用户ID不存在。');
    }

    if (post.school_id) {
        const school = await School.findByPk(post.school_id);
        if (!school) {
            throw new Error('学校ID不存在。');
        }
    }
}