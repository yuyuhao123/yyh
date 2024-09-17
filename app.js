const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const adminAuth = require('./middlewares/admin-auth');
const userAuth = require('./middlewares/user-auth');
const cors = require('cors');

require('dotenv').config();

// 前台路由文件
const authRouter = require('./routes/auth');
const tab1Router = require('./routes/tab1'); 
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const likePostsRouter = require('./routes/likeposts');
const likeQuestionsRouter = require('./routes/likequestions');
const postsRouter = require('./routes/posts');
const questionsRouter = require('./routes/questions');
const categoriesRouter = require('./routes/categories');



// 后台路由文件
const adminPostsRouter = require('./routes/admin/posts');
const adminCategoriesRouter = require('./routes/admin/categories');
const adminUsersRouter = require('./routes/admin/users');
// const adminUserQuestionsRouter = require('./routes/admin/userQuestions');
const adminPostLikesRouter = require('./routes/admin/postlikes');
const adminPostFavoritesRouter = require('./routes/admin/postfavorites');
const adminQuestionLikesRouter = require('./routes/admin/questionlikes');
const adminQuestionFavoritesRouter = require('./routes/admin/questionfavorites');
const adminQuestionsRouter = require('./routes/admin/questions');
const adminSchoolCategoriesRouter = require('./routes/admin/schoolCategories');
const adminSchoolsRouter = require('./routes/admin/schools');
const adminAuthRouter = require('./routes/admin/auth')

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS 跨域配置
app.use(cors());

// 前台路由配置
app.use('/', indexRouter);


// 前台路由配置
// app.use('/api/tab1', tab1Router);
// app.use('/', userAuth, indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/likeposts', likePostsRouter);
app.use('/likequestions', likeQuestionsRouter);
app.use('/posts', postsRouter);
app.use('/questions', questionsRouter);
app.use('/categories', categoriesRouter);

// 后台路由配置
app.use('/admin/posts', adminAuth, adminPostsRouter);
app.use('/admin/categories', adminAuth, adminCategoriesRouter);
app.use('/admin/users', adminAuth, adminUsersRouter);
// app.use('/admin/userQuestions', adminAuth, adminUserQuestionsRouter);
app.use('/admin/postlikes', adminAuth, adminPostLikesRouter);
app.use('/admin/postfavorites', adminAuth, adminPostFavoritesRouter);
app.use('/admin/questionlikes', adminAuth, adminQuestionLikesRouter);
app.use('/admin/questionfavorites', adminAuth, adminQuestionFavoritesRouter);
app.use('/admin/questions', adminAuth, adminQuestionsRouter);
app.use('/admin/schoolCategories', adminAuth, adminSchoolCategoriesRouter);
app.use('/admin/schools', adminAuth, adminSchoolsRouter);
app.use('/admin/auth', adminAuthRouter);

module.exports = app;