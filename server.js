// server.js (修改后)

const express = require('express');
const { Pool } = require('pg'); // <-- 引入 PostgreSQL 的库
const sqlite3 = require('sqlite3').verbose();

const app = express();
// process.env.PORT 是云平台提供的端口号，本地则使用 3000
const PORT = process.env.PORT || 3000; 

let db;

// --- 关键改动：根据环境选择数据库 ---
if (process.env.DATABASE_URL) {
    // 如果在云端环境 (Render 会提供 DATABASE_URL)
    console.log("正在连接到 PostgreSQL 数据库...");
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // 对于 Render 的免费数据库，需要这个配置
        }
    });

    // 为 PostgreSQL 创建表 (注意语法与 SQLite 略有不同)
    db.query(`CREATE TABLE IF NOT EXISTS draws (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);

} else {
    // 如果在本地环境
    console.log("正在连接到本地 SQLite 数据库...");
    db = new sqlite3.Database('./weekend_fun.db', (err) => {
        if (err) return console.error("SQLite 连接失败:", err.message);
        console.log("成功连接到 SQLite 数据库.");
        db.run(`CREATE TABLE IF NOT EXISTS draws (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            activity TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

app.use(express.json());
app.use(express.static('.'));

// --- 修改 API 以兼容两种数据库 ---
// `db.query` 是 pg 的语法，`db.run`/`db.all` 是 sqlite3 的语法
app.post('/api/draw', async (req, res) => {
    const { userId, activity } = req.body;
    if (!userId || !activity) return res.status(400).json({ error: '用户ID和活动内容不能为空' });

    try {
        if (process.env.DATABASE_URL) { // PostgreSQL
            const sql = `INSERT INTO draws (user_id, activity) VALUES ($1, $2) RETURNING id`;
            const result = await db.query(sql, [userId, activity]);
            res.json({ success: true, id: result.rows[0].id });
        } else { // SQLite
            const sql = `INSERT INTO draws (user_id, activity) VALUES (?, ?)`;
            db.run(sql, [userId, activity], function(err) {
                if (err) throw err;
                res.json({ success: true, id: this.lastID });
            });
        }
    } catch (err) {
        console.error("数据插入失败:", err.message);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

app.get('/api/history/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        if (process.env.DATABASE_URL) { // PostgreSQL
            const sql = `SELECT activity, timestamp FROM draws WHERE user_id = $1 ORDER BY timestamp DESC`;
            const result = await db.query(sql, [userId]);
            res.json(result.rows);
        } else { // SQLite
            const sql = `SELECT activity, timestamp FROM draws WHERE user_id = ? ORDER BY timestamp DESC`;
            db.all(sql, [userId], (err, rows) => {
                if (err) throw err;
                res.json(rows);
            });
        }
    } catch (err) {
        console.error("数据查询失败:", err.message);
        res.status(500).json({ error: '服务器内部错误' });
    }
});


app.listen(PORT, () => {
    console.log(`服务器已启动，正在监听 http://localhost:${PORT}`);
});