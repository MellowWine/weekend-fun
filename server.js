// server.js (修改后)

const express = require('express');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000; 

let db;

// --- 数据库连接逻辑 (保持不变) ---
if (process.env.DATABASE_URL) {
    console.log("正在连接到 PostgreSQL 数据库...");
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    db.query(`CREATE TABLE IF NOT EXISTS draws (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);
} else {
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

// --- API: 保存抽卡记录 (保持不变) ---
app.post('/api/draw', async (req, res) => {
    const { userId, activity } = req.body;
    if (!userId || !activity) return res.status(400).json({ error: '用户ID和活动内容不能为空' });

    try {
        if (process.env.DATABASE_URL) {
            const sql = `INSERT INTO draws (user_id, activity) VALUES ($1, $2) RETURNING id`;
            const result = await db.query(sql, [userId, activity]);
            res.json({ success: true, id: result.rows[0].id });
        } else {
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

// --- API: 获取历史记录 (保持不变) ---
app.get('/api/history/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        if (process.env.DATABASE_URL) {
            const sql = `SELECT activity, timestamp FROM draws WHERE user_id = $1 ORDER BY timestamp DESC`;
            const result = await db.query(sql, [userId]);
            res.json(result.rows);
        } else {
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

// --- 新增 API：清空指定用户的历史记录 ---
app.delete('/api/history/:userId', async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ error: '用户ID不能为空' });
    }

    try {
        if (process.env.DATABASE_URL) { // PostgreSQL
            const sql = `DELETE FROM draws WHERE user_id = $1`;
            await db.query(sql, [userId]);
            res.json({ success: true, message: '历史记录已清空' });
        } else { // SQLite
            const sql = `DELETE FROM draws WHERE user_id = ?`;
            db.run(sql, [userId], function(err) {
                if (err) throw err;
                // this.changes 可以获取到被删除的行数
                console.log(`为用户 ${userId} 删除了 ${this.changes} 条记录。`);
                res.json({ success: true, message: '历史记录已清空' });
            });
        }
    } catch (err) {
        console.error(`清空用户 ${userId} 的历史记录失败:`, err.message);
        res.status(500).json({ error: '服务器内部错误' });
    }
});


app.listen(PORT, () => {
    console.log(`服务器已启动，正在监听 http://localhost:${PORT}`);
});