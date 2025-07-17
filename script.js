document.addEventListener('DOMContentLoaded', () => {

    const resultCard = document.getElementById('result-card');
    const drawButton = document.getElementById('draw-button');
    const historyList = document.getElementById('history-list'); 
    const clearHistoryButton = document.getElementById('clear-history-button');
    // 新增：获取所有分类按钮
    const categoryButtons = document.querySelectorAll('.category-button');

    // --- 用户识别 (无变化) ---
    let userId = localStorage.getItem('weekendFunUserId');
    if (!userId) {
        userId = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('weekendFunUserId', userId);
    }
    console.log("当前用户ID:", userId);

    // --- 核心改动：修改卡池的数据结构 ---
    // 从字符串数组变为对象数组，每个对象包含活动文本和分类
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

    // 新增：用于存储当前选中的分类，默认为'all'
    let currentCategory = 'all';

    // --- 核心改动：修改抽卡函数以支持分类 ---
    function drawCard() {
        // 1. 根据当前分类筛选卡池
        const filteredPool = currentCategory === 'all' 
            ? cardPool 
            : cardPool.filter(item => item.category === currentCategory);

        // 2. 检查筛选后的卡池是否为空
        if (filteredPool.length === 0) {
            resultCard.querySelector('p').textContent = '这个分类下没有活动哦！';
            return; // 提前结束函数
        }

        drawButton.disabled = true;
        resultCard.classList.add('flipping');
        resultCard.querySelector('p').textContent = '洗牌中...';

        setTimeout(() => {
            // 3. 从筛选后的卡池中随机抽取
            const randomIndex = Math.floor(Math.random() * filteredPool.length);
            const randomActivity = filteredPool[randomIndex];
            
            // 4. 显示和保存活动文本
            resultCard.querySelector('p').textContent = randomActivity.text;
            saveDrawRecord(randomActivity.text);

        }, 300);

        setTimeout(() => {
            resultCard.classList.remove('flipping');
            drawButton.disabled = false;
        }, 600);
    }

    // --- 新增：处理分类按钮点击的逻辑 ---
    function handleCategorySelect(event) {
        // 获取点击按钮的数据属性
        const selectedCategory = event.target.dataset.category;
        currentCategory = selectedCategory;

        // 更新按钮的激活状态
        categoryButtons.forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');

        console.log("当前选择的分类:", currentCategory);
    }

    // --- 以下函数保持不变 ---

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
                loadHistory();
            }
        } catch (error) {
            console.error("保存记录失败:", error);
        }
    }

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
        if (!confirm("你确定要清空所有抽卡记录吗？此操作不可撤销。")) {
            return;
        }
        
        try {
            const response = await fetch(`/api/history/${userId}`, {
                method: 'DELETE',
            });
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
    clearHistoryButton.addEventListener('click', clearHistory);
    // 新增：为每个分类按钮绑定点击事件
    categoryButtons.forEach(button => {
        button.addEventListener('click', handleCategorySelect);
    });

    // 页面加载时，立即加载一次历史记录
    loadHistory();
});