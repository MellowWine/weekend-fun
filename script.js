document.addEventListener('DOMContentLoaded', () => {

    const resultCard = document.getElementById('result-card');
    const drawButton = document.getElementById('draw-button');
    const historyList = document.getElementById('history-list'); 
    const clearHistoryButton = document.getElementById('clear-history-button');
    const categoryButtons = document.querySelectorAll('.category-button');
    // 新增：获取“不喜欢”按钮
    const redrawButton = document.getElementById('redraw-button');

    let userId = localStorage.getItem('weekendFunUserId');
    if (!userId) {
        userId = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('weekendFunUserId', userId);
    }

    const cardPool = [
        { text: "去一个没去过的公园，享受阳光和草地。", category: "outdoor" },
        { text: "找一家评分高的独立咖啡馆，安静地读一本书。", category: "indoor" },
        { text: "一起去逛宜家，为未来的小家寻找灵感。", category: "indoor" },
        { text: "在家举办“电影马拉松”，看完一整个系列。", category: "indoor" },
        { text: "挑战一起做一道复杂的菜，比如惠灵顿牛排。", category: "challenge" },
        { text: "去打一次保龄球或羽毛球，尽情出汗。", category: "indoor" },
        { text: "逛逛城市里的花鸟市场，给寝室添点绿意。", category: "outdoor" },
        { text: "来一次“断舍离”，整理房间和衣柜。", category: "challenge" },
        { text: "去超市进行一次“主题采购”，比如“只买蓝色包装的东西”。", category: "challenge" },
        { text: "坐上任意一趟公交车，到终点站看看有什么惊喜。", category: "outdoor" },
        { text: "找个DIY工作室，做一次陶艺或银饰。", category: "challenge" },
        { text: "去科技馆或博物馆，给大脑充充电。", category: "indoor" },
        { text: "晚上去江边或山顶，看城市的夜景。", category: "outdoor" },
        { text: "学习一个新技能，比如用一小时学会基础尤克里里。", category: "challenge" },
        { text: "玩一次密室逃脱或剧本杀。", category: "challenge" }
    ];

    let currentCategory = 'all';
    // 新增：用于暂存上一次抽到的、但还未“确认”的结果
    let lastDrawnActivity = null;

    /**
     * 核心逻辑：处理用户开始一次全新的抽卡
     */
    function drawCard() {
        // 关键：如果存在上一次抽到但未重抽的结果，说明用户“接受”了它，此时才保存
        if (lastDrawnActivity) {
            saveDrawRecord(lastDrawnActivity.text);
            lastDrawnActivity = null; // 清空暂存
        }
        
        // 重置UI状态
        redrawButton.classList.add('hidden');
        drawButton.disabled = true;
        resultCard.classList.add('flipping');
        resultCard.querySelector('p').textContent = '洗牌中...';

        setTimeout(() => {
            const filteredPool = currentCategory === 'all' 
                ? cardPool 
                : cardPool.filter(item => item.category === currentCategory);

            if (filteredPool.length === 0) {
                resultCard.querySelector('p').textContent = '这个分类下没有活动哦！';
                drawButton.disabled = false;
                resultCard.classList.remove('flipping');
                return;
            }

            const randomIndex = Math.floor(Math.random() * filteredPool.length);
            const randomActivity = filteredPool[randomIndex];
            
            resultCard.querySelector('p').textContent = randomActivity.text;
            
            // 暂存结果，但不立即保存到历史记录
            lastDrawnActivity = randomActivity;

            // 显示“不喜欢”按钮，并重新启用主按钮
            redrawButton.classList.remove('hidden');
            drawButton.disabled = false;
            resultCard.classList.remove('flipping');
        }, 600);
    }
    
    /**
     * 核心逻辑：处理用户点击“不喜欢，换一个”
     */
    function redrawCard() {
        if (!lastDrawnActivity) return; // 安全检查

        // 禁用所有按钮，防止连续点击
        drawButton.disabled = true;
        redrawButton.classList.add('hidden'); // 隐藏不喜欢按钮，因为重抽机会只有一次
        resultCard.classList.add('flipping');
        resultCard.querySelector('p').textContent = '换牌中...';

        setTimeout(() => {
            // 关键：创建一个排除了上一次结果的新卡池
            const poolWithoutLast = cardPool.filter(item => item.text !== lastDrawnActivity.text);
            
            const filteredPool = currentCategory === 'all'
                ? poolWithoutLast
                : poolWithoutLast.filter(item => item.category === currentCategory);

            let newActivity;
            if (filteredPool.length > 0) {
                const randomIndex = Math.floor(Math.random() * filteredPool.length);
                newActivity = filteredPool[randomIndex];
            } else {
                // 如果过滤后没得选了，就提示用户
                newActivity = { text: "运气爆棚！这个分类下没有其他活动可选啦！", category: 'special' };
            }
            
            resultCard.querySelector('p').textContent = newActivity.text;

            // 关键：重抽的结果被视为最终结果，立即保存
            saveDrawRecord(newActivity.text);

            // 重置状态
            lastDrawnActivity = null;
            drawButton.disabled = false; // 重新启用主按钮
            resultCard.classList.remove('flipping');
        }, 600);
    }

    /**
     * 核心逻辑：当用户切换分类时，视为接受了上一个结果
     */
    function handleCategorySelect(event) {
        // 如果存在未处理的结果，先保存它
        if (lastDrawnActivity) {
            saveDrawRecord(lastDrawnActivity.text);
            lastDrawnActivity = null;
            redrawButton.classList.add('hidden');
        }

        const selectedCategory = event.target.dataset.category;
        currentCategory = selectedCategory;

        categoryButtons.forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    async function saveDrawRecord(activity) {
        if (!activity) return; // 避免保存空记录
        try {
            const response = await fetch('/api/draw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, activity }),
            });
            const result = await response.json();
            if (result.success) {
                console.log("记录保存成功!");
                loadHistory();
            }
        } catch (error) {
            console.error("保存记录失败:", error);
        }
    }

    async function loadHistory() {
        // (此函数无变化)
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
                clearHistoryButton.disabled = false;
            } else {
                historyList.innerHTML = '<li>还没有抽卡记录哦~</li>';
                clearHistoryButton.disabled = true;
            }
        } catch (error) {
            console.error("加载历史失败:", error);
            historyList.innerHTML = '<li>加载历史失败，请刷新页面重试。</li>';
            clearHistoryButton.disabled = true;
        }
    }

    async function clearHistory() {
        // (此函数无变化)
        if (!confirm("你确定要清空所有抽卡记录吗？此操作不可撤销。")) {
            return;
        }
        try {
            const response = await fetch(`/api/history/${userId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                console.log("历史记录已清空!");
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
    redrawButton.addEventListener('click', redrawCard); // 新增
    clearHistoryButton.addEventListener('click', clearHistory);
    categoryButtons.forEach(button => {
        button.addEventListener('click', handleCategorySelect);
    });

    loadHistory();
});