'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
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
        category_id: { 
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'Categories', 
                key: 'id'
            }
        },
        parent_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'Questions', // 引用自身
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
            defaultValue: 1 // 默认值为 1选择题 2填空题 3判断题 4简答题 5大题
        },
        difficulty: {
            type: DataTypes.INTEGER, // 难度字段
            allowNull: true // 允许为空
        },
        status: {
            type: DataTypes.ENUM('published', 'draft', 'archived'),
            defaultValue: 'published' // 默认状态为已发布
        },
    }, {
        hooks: {
            beforeCreate: async (question, options) => {
                await validateForeignKeys(question);
            },
            beforeUpdate: async (question, options) => {
                await validateForeignKeys(question);
            }
        }
    });

    Question.associate = function (models) {
        Question.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
        Question.belongsTo(models.Category, { as: 'category', foreignKey: 'category_id' }); // 假设你有一个 Categories 模型
        Question.belongsToMany(models.User, { through: models.QuestionLike, foreignKey: 'question_id', as: 'questionLikeUsers' });
        Question.belongsToMany(models.User, { through: models.QuestionFavorite, foreignKey: 'question_id', as: 'questionFavoriteUsers' });

        // 自引用关系
        Question.belongsTo(Question, { as: 'parent', foreignKey: 'parent_id' }); // 父问题
        Question.hasMany(Question, { as: 'children', foreignKey: 'parent_id' }); // 子问题
    };

    return Question;
};

async function validateForeignKeys(question) {
    const { User, Category } = require('./index'); // 确保路径正确

    const user = await User.findByPk(question.user_id);
    if (!user) {
        throw new Error('用户ID不存在。');
    }

    if (question.category_id) {
        const category = await Category.findByPk(question.category_id);
        if (!category) {
            throw new Error('分类ID不存在。');
        }
    }
}