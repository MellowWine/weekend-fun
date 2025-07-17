# 周末抽卡机 (Weekend Fun Gacha)

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</div>

一个有趣的全栈 Web 小应用，帮你解决“周末去哪儿？”的世纪难题。只需轻轻一点，即可随机抽取一项为你量身定制的周末活动！

**线上体验地址**: [https://weekend-fun.onrender.com](https://weekend-fun.onrender.com) `<!-- 请确认这个链接是你的线上应用地址 -->`

---

## ✨ 主要功能

- **随机抽卡**：从预设的活动池中随机抽取一个周末活动，并伴有酷炫的翻转动画。
- **用户识别**：通过 `localStorage` 自动为每个浏览器生成唯一用户 ID，实现个性化数据存储。
- **历史记录**：自动将用户的每一次抽卡结果（活动内容及时间）保存到数据库。
- **记录管理**：用户可以随时查看自己的抽卡历史，并能一键清空所有记录。
- **环境自适应**：项目代码能够自动识别运行环境，在本地开发时使用 SQLite，在云端生产环境无缝切换至 PostgreSQL。

---

## 🛠️ 技术栈

- **前端 (Frontend)**

  - **HTML5**: 构建页面结构。
  - **CSS3**: 美化页面样式，实现卡片翻转等动画效果。
  - **原生 JavaScript (ES6+)**: 实现所有前端交互逻辑，如 DOM 操作、事件绑定、API 请求 (`fetch`) 等。

- **后端 (Backend)**

  - **Node.js**: JavaScript 运行时环境。
  - **Express.js**: 轻量、灵活的 Node.js Web 应用框架，用于搭建后端服务器和 API 路由。

- **数据库 (Database)**

  - **SQLite**: 用于本地开发，轻量便捷，无需额外安装配置。
  - **PostgreSQL**: 用于生产环境，功能强大、稳定可靠。

- **部署 (Deployment)**

  - **Render**: 提供免费的 Web Service 和 PostgreSQL 数据库托管，支持通过 Git 自动部署。

---

## 📂 项目结构

```
.
├── index.html          # 主页面结构
├── style.css           # 全局样式表
├── script.js           # 前端交互逻辑
├── server.js           # 后端服务器与 API
├── package.json        # 项目信息与依赖管理
└── weekend_fun.db      # (本地运行时自动生成) SQLite 数据库文件
```

---

## 🚀 如何在本地运行

请确保您的电脑已安装 [Node.js](https://nodejs.org/) (推荐 v16 或更高版本)。

1. **克隆项目到本地**

   ```bash
   git clone https://github.com/MellowWine/weekend-fun.git
   ```

2. **进入项目目录**

   ```bash
   cd weekend-fun
   ```

3. **安装项目依赖**

   ```bash
   npm install
   ```

   此命令会根据 `package.json` 文件自动安装 `express`, `pg`, `sqlite3` 等必要的库。

4. **启动本地服务器**

   ```bash
   node server.js
   ```

   启动成功后，你会在终端看到:

   ```
   正在连接到本地 SQLite 数据库...
   成功连接到 SQLite 数据库.
   服务器已启动，正在监听 http://localhost:3000
   ```

5. **在浏览器中打开**
   访问 [http://localhost:3000](http://localhost:3000) 即可开始体验！

---

## ☁️ 部署说明

本项目已为云平台部署进行了优化，可直接部署在 [Render](https://render.com/) 等 PaaS 平台。

- **自动环境检测**: 后端代码通过 `process.env.DATABASE_URL` 环境变量来判断当前是生产环境还是本地环境。
- **数据库切换**:
  - 当检测到 `DATABASE_URL` 存在时（Render 会自动注入此变量），项目会使用 `pg` 库连接到 PostgreSQL 数据库。
  - 否则，项目会回退到使用 `sqlite3` 库，并在本地创建/连接 `weekend_fun.db` 文件。
- **启动命令**: 在 Render 等平台部署时，请将启动命令设置为 `node server.js`。

感谢使用！祝你有一个愉快的周末！❤️
