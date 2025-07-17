// script.js (修改后)

document.addEventListener('DOMContentLoaded', () => {

    const resultCard = document.getElementById('result-card');
    const drawButton = document.getElementById('draw-button');
    const historyList = document.getElementById('history-list'); 
    // 新增：获取清空历史按钮
    const clearHistoryButton = document.getElementById('clear-history-button');

    // --- 用户识别 ---
    let userId = localStorage.getItem('weekendFunUserId');
    if (!userId) {
        userId = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('weekendFunUserId', userId);
    }
    console.log("当前用户ID:", userId);

    const cardPool = [
        "去一个没去过的公园，享受阳光和草地。",
        "找一家评分高的独立咖啡馆，安静地读一本书。",
        "一起去逛宜家，为未来的小家寻找灵感。",
        "在家举办“电影马拉松”，看完一整个系列。",
        "挑战一起做一道复杂的菜，比如惠灵顿牛排或提拉米苏。",
        "去打一次保龄球或羽毛球，尽情出汗。",
        "逛逛城市里的花鸟市场，给寝室添点绿意。",
        "来一次“断舍离”，整理房间和衣柜。",
        "去超市进行一次“主题采购”，比如“只买蓝色包装的东西”。",
        "坐上任意一趟公交车，到终点站看看有什么惊喜。",
        "找个DIY工作室，做一次陶艺或银饰。",
        "去科技馆或博物馆，给大脑充充电。",
        "晚上去江边或山顶，看城市的夜景。",
        "学习一个新技能，比如用一小时学会基础尤克里里。",
        "玩一次密室逃脱或剧本杀。"
    ];

    function drawCard() {
        drawButton.disabled = true;
        resultCard.classList.add('flipping');
        resultCard.querySelector('p').textContent = '洗牌中...';

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * cardPool.length);
            const randomActivity = cardPool[randomIndex];
            resultCard.querySelector('p').textContent = randomActivity;
            saveDrawRecord(randomActivity);
        }, 300);

        setTimeout(() => {
            resultCard.classList.remove('flipping');
            drawButton.disabled = false;
        }, 600);
    }

    async function saveDrawRecord(activity) {
        try {
            const response = await fetch('/api/draw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, activity }),
            });
            const result = await response.json();
            if (result.success) {
                console.log("记录保存成功!");
                loadHistory(); // 刷新历史记录
            }
        } catch (error) {
            console.error("保存记录失败:", error);
        }
    }

    // --- 修改后的 loadHistory 函数 ---
    async function loadHistory() {
        try {
            const response = await fetch(`/api/history/${userId}`);
            const historyData = await response.json();
            
            historyList.innerHTML = ''; 
            
            if (historyData.length > 0) {
                historyData.forEach(item => {
                    const li = document.createElement('li');
                    const date = new Date(item.timestamp).toLocaleString('zh-CN');
                    li.textContent = `[${date}] 你抽到了: ${item.activity}`;
                    historyList.appendChild(li);
                });
                // **核心改动：如果历史记录不为空，则启用清空按钮**
                clearHistoryButton.disabled = false;
            } else {
                historyList.innerHTML = '<li>还没有抽卡记录哦~</li>';
                // **核心改动：如果历史记录为空，则禁用清空按钮**
                clearHistoryButton.disabled = true;
            }
        } catch (error) {
            console.error("加载历史失败:", error);
            historyList.innerHTML = '<li>加载历史失败，请刷新页面重试。</li>';
            clearHistoryButton.disabled = true; // 加载失败也禁用
        }
    }

    // --- 新增：清空历史记录的函数 ---
    async function clearHistory() {
        // 添加一个确认弹窗，防止用户误触
        if (!confirm("你确定要清空所有抽卡记录吗？此操作不可撤销。")) {
            return; // 如果用户点击“取消”，则函数提前结束
        }
        
        try {
            const response = await fetch(`/api/history/${userId}`, {
                method: 'DELETE', // 使用 DELETE 请求方法
            });
            const result = await response.json();

            if (result.success) {
                console.log("历史记录已清空!");
                // 清空成功后，立即重新加载历史记录（此时会显示“没有记录”）
                loadHistory(); 
            } else {
                alert('清空失败，请稍后重试。');
            }
        } catch (error) {
            console.error("清空历史记录时发生错误:", error);
            alert('清空失败，请检查网络连接。');
        }
    }

    // --- 绑定事件 ---
    drawButton.addEventListener('click', drawCard);
    // 新增：为清空按钮绑定点击事件
    clearHistoryButton.addEventListener('click', clearHistory);

    // 页面加载时，立即加载一次历史记录
    loadHistory();
});