# 📚 网页版刷题系统

一个功能完整的在线刷题平台，支持题库导入、组卷、刷题模式、限时考试和错题集管理。

## ✨ 功能特性

- **题库管理** - 上传 .docx 文件自动解析题目（单选/多选/判断/简答）
- **组卷系统** - 选择题型和数量，随机抽题，可设时间限制
- **刷题模式** - 逐题查看答案/提交后看答案
- **限时考试** - 倒计时自动提交
- **错题集** - 自动记录错题，做对自动移除，支持一键清空
- **做题记录** - 自动保存进度，刷新不丢失

## 🛠️ 技术栈

| 前端 | 后端 | 数据库 |
|------|------|--------|
| React 18 | Node.js + Express | JSON 文件 / MongoDB |
| React Router 6 | RESTful API | Mongoose |
| TailwindCSS | Multer (文件上传) | |
| Zustand | Mammoth (docx 解析) | |
| Vite | | |
| Axios | | |

## 🚀 快速启动（本地开发）

### 方法一：一键启动

```bash
# 在项目根目录
./deploy.sh
```

### 方法二：手动启动

```bash
# 1. 安装依赖
cd server && npm install
cd ../client && npm install

# 2. 启动后端（终端1）
cd server
PORT=3001 node src/index.js

# 3. 启动前端（终端2）
cd client
npx vite --host --port 5173
```

访问 http://localhost:5173 即可使用

## ☁️ 部署到云端

### 方案一：使用 JSON 文件数据库（最简单）

无需配置数据库，直接部署后端到任意 Node.js 托管平台。

### 方案二：使用 MongoDB Atlas（推荐生产环境）

1. 注册 [MongoDB Atlas](https://cloud.mongodb.com) 免费账号
2. 创建免费集群 (M0 Sandbox, 512MB)
3. 获取连接字符串
4. 部署后端时设置环境变量 `MONGODB_URI`

### 部署步骤

#### 1️⃣ 后端 → Render

1. 注册 [Render](https://render.com)（用 GitHub 登录）
2. 点击 "New +" → "Web Service"
3. 连接 GitHub 仓库
4. 设置：
   - Name: `quiz-system-api`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
   - Plan: **Free**
5. 添加环境变量：
   - `MONGODB_URI` = 你的 MongoDB 连接字符串
6. 部署完成，记录 URL（如 `https://quiz-system-api.onrender.com`）

#### 2️⃣ 前端 → Vercel

1. 注册 [Vercel](https://vercel.com)（用 GitHub 登录）
2. 点击 "Add New" → "Project"
3. 导入你的 GitHub 仓库
4. 设置：
   - Root Directory: `client`
   - Framework: `Vite`
5. 添加环境变量：
   - `VITE_API_URL` = Render 后端 URL（如 `https://quiz-system-api.onrender.com`）
6. 部署完成！访问 Vercel 提供的 URL

## 📂 项目结构

```
quiz-system/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── api/           # API 接口封装
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── store/         # Zustand 状态管理
│   │   └── App.jsx        # 路由配置
│   ├── vite.config.js
│   └── vercel.json
├── server/                 # 后端 Express 应用
│   ├── src/
│   │   ├── controllers/   # 控制器层
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── services/      # 业务逻辑
│   │   ├── db/            # 数据库层
│   │   └── index.js       # 入口文件
│   ├── data/              # JSON 数据库文件
│   ├── .env
│   └── package.json
├── deploy.sh              # 启动脚本
└── README.md
```

## 📡 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET/POST | /api/questions | 题目列表/创建 |
| GET/DELETE | /api/questions/:id | 题目详情/删除 |
| POST | /api/questions/upload | 上传 docx 题库 |
| POST | /api/exams | 创建试卷 |
| GET | /api/exams | 试卷列表 |
| GET/DELETE | /api/exams/:id | 试卷详情/删除 |
| GET/POST | /api/progress/:examId | 做题进度 |
| GET | /api/wrong-questions | 错题列表 |
| POST | /api/wrong-questions/check | 批改答案 |
| DELETE | /api/wrong-questions/:id | 移除错题 |
| DELETE | /api/wrong-questions/clear-all | 清空错题集 |

## 💡 使用说明

1. **上传题库**: 准备 .docx 格式的 Word 文档，在"上传题库"页面导入
2. **创建试卷**: 选择题型和题目数量，设置考试时间
3. **开始刷题**: 支持逐题模式（选完即出答案）和提交模式
4. **错题管理**: 自动记录错题，可在错题集中重新练习

## 🔧 切换数据库

默认使用 JSON 文件数据库（`server/data/` 目录），无需额外配置。

要切换回 MongoDB，编辑 `server/src/index.js`：
```javascript
// 取消注释 MongoDB 连接代码
// 注释掉 JSON 数据库初始化
```

设置环境变量：
```bash
MONGODB_URI=mongodb://你的地址:27017/quiz-system
```
