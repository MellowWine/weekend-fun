// 等待HTML文档完全加载和解析后执行
document.addEventListener('DOMContentLoaded', () => {

    // 1. 获取需要操作的HTML元素
    const resultCard = document.getElementById('result-card');
    const drawButton = document.getElementById('draw-button');

    // 2. 创建一个丰富多样的卡池 (内容库)
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

    // 3. 定义抽卡函数
    function drawCard() {
        // a. 在抽卡期间禁用按钮，防止用户疯狂点击
        drawButton.disabled = true;
        
        // b. 给卡片添加动画类，开始翻转
        resultCard.classList.add('flipping');
        // 先显示一个中间状态
        resultCard.querySelector('p').textContent = '洗牌中...';

        // c. 设置一个定时器，在动画播放到一半时更新内容
        setTimeout(() => {
            // 从卡池中随机抽取一个活动
            const randomIndex = Math.floor(Math.random() * cardPool.length);
            const randomActivity = cardPool[randomIndex];
            
            // 将抽到的结果更新到卡片的文本中
            resultCard.querySelector('p').textContent = randomActivity;

        }, 300); // 动画总时长是600ms，在300ms时更换内容，视觉效果最流畅

        // d. 设置另一个定时器，在动画完全结束后，移除动画类并重新启用按钮
        setTimeout(() => {
            resultCard.classList.remove('flipping');
            drawButton.disabled = false;
        }, 600);
    }

    // 4. 为抽卡按钮绑定点击事件，点击时调用抽卡函数
    drawButton.addEventListener('click', drawCard);

});