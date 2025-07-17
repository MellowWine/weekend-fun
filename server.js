// server.js

// 1. 引入必要的库
const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // .verbose() 可以在调试时提供更多信息

// 2. 初始化 Express 应用 和 数据库
const app = express();
const PORT = 3000; // 我们让后端运行在 3000 端口
const db = new sqlite3.Database('./weekend_fun.db', (err) => {
    if (err) {
        console.error("数据库连接失败:", err.message);
    } else {
        console.log("成功连接到 SQLite 数据库.");
        // 连接成功后，创建我们的数据表（如果它还不存在）
        db.run(`CREATE TABLE IF NOT EXISTS draws (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            activity TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// 3. 设置中间件
// 这个中间件让 Express 能够解析前端发送过来的 JSON 格式的请求体
app.use(express.json());
// 这个中间件让浏览器可以直接访问你项目里的静态文件（html, css, js）
app.use(express.static('.'));

// 4. 创建 API 接口

// API 接口 1: 保存一次抽卡记录
// 前端会向 'POST /api/draw' 这个地址发送请求
app.post('/api/draw', (req, res) => {
    // 从前端发来的请求中获取 user_id 和抽到的活动 activity
    const { userId, activity } = req.body;

    if (!userId || !activity) {
        return res.status(400).json({ error: '用户ID和活动内容不能为空' });
    }

    const sql = `INSERT INTO draws (user_id, activity) VALUES (?, ?)`;
    db.run(sql, [userId, activity], function(err) {
        if (err) {
            console.error("数据插入失败:", err.message);
            return res.status(500).json({ error: '服务器内部错误' });
        }
        // 成功后返回一个成功的消息
        res.json({ success: true, id: this.lastID });
    });
});

// API 接口 2: 获取某个用户的抽卡历史
// 前端会请求 'GET /api/history/某个用户ID'
app.get('/api/history/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT activity, timestamp FROM draws WHERE user_id = ? ORDER BY timestamp DESC`;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error("数据查询失败:", err.message);
            return res.status(500).json({ error: '服务器内部错误' });
        }
        res.json(rows); // 将查询到的历史记录作为 JSON 返回给前端
    });
});

// 5. 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动，正在监听 http://localhost:${PORT}`);
});