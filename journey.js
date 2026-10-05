// 用途：维护“成长轨迹”页面的数据。新增节点时复制一个对象即可。
// date 用 YYYY-MM-DD 或 YYYY-MM 表示；页面会自动按时间从新到旧排列。
const journeyEvents = [
  {
    date: "2026-09",
    title: "开始系统学习 C++",
    description: "继续提升编程能力，进入面向对象、STL 与项目实践阶段。",
    type: "学习"
  },
  {
    date: "2026-06",
    title: "英语六级 548 分",
    description: "通过大学英语六级，英语学习到此为止……了吗？",
    type: "成绩"
  },
  {
    date: "2026-05-13",
    title: "成功转入计算机",
    description: "这真的是我想要的生活吗？",
    type: "选择"
  },
  {
    date: "2026-04",
    title: "自学数据结构",
    description: "从线性表开始，初识 408 。",
    type: "学习"
  },
  {
    date: "2025-12",
    title: "英语四级 516 分",
    description: "裸考大学英语四级，取得 516 分。",
    type: "成绩"
  },
  {
    date: "2025-10",
    title: "下定决心转专业",
    description: "这不是我想要的生活。",
    type: "选择"
  },
  {
    date: "2025-09-05",
    title: "进入大学",
    description: "好无聊的大学生活。",
    type: "阶段"
  },
  {
    date: "2025-09-03",
    title: "拿到驾驶证",
    description: "驾照最速的传说。",
    type: "生活"
  },
  {
    date: "2025-07",
    title: "开始学习 C 语言",
    description: "学计算机一定要有一个强大的心理状态。————翁恺",
    type: "学习"
  },
  {
    date: "2025-07",
    title: "被化工专业录取",
    description: "也许我曾经真的很喜欢化学。",
    type: "学习"
  },
  {
    date: "2025-06",
    title: "高考结束",
    description: "永别了，画廊学校。",
    type: "起点"
  }
];

function formatJourneyDate(date) {
  const [year, month, day] = date.split("-");
  return `${year}.${month}${day ? `.${day}` : ""}`;
}

// 仅计算视觉颜色；相邻线段共享接点，蓝 / 紫 / 粉与 CSS 主题色一致。
function journeyLineColor(progress) {
  const blue = [65, 113, 224];
  const violet = [129, 92, 231];
  const pink = [232, 91, 159];
  const [start, end, amount] = progress <= 0.55
    ? [blue, violet, progress / 0.55]
    : [violet, pink, (progress - 0.55) / 0.45];
  return `rgb(${start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount)).join(", ")})`;
}

// 可复用的单个时间轴卡片。总数用于分配渐变，不依赖卡片的固定高度。
function renderJourneyCard(event, index, escape, total = 1) {
  const startColor = journeyLineColor(index / total);
  const endColor = journeyLineColor((index + 1) / total);
  return `
    <article class="timeline-item ${index % 2 === 0 ? "timeline-left" : "timeline-right"}" style="--line-start: ${startColor}; --line-end: ${endColor}">
      <time class="timeline-date" datetime="${escape(event.date)}">${escape(formatJourneyDate(event.date))}</time>
      <span class="timeline-dot" aria-hidden="true"></span>
      <div class="timeline-card">
        <div class="timeline-meta"><span>${escape(event.type)}</span></div>
        <h2>${escape(event.title)}</h2>
        <p>${escape(event.description)}</p>
      </div>
    </article>
  `;
}

// 完整时间轴组件：自动按时间从新到旧排序，再复用卡片组件。
function renderJourney(container, escape) {
  const orderedEvents = [...journeyEvents].sort((a, b) => b.date.localeCompare(a.date));
  container.innerHTML = orderedEvents.map((event, index) => renderJourneyCard(event, index, escape, orderedEvents.length)).join("");
}

// 首页只展示最近的几个节点，完整记录仍由成长轨迹页面负责。
function renderJourneyPreview(container, escape, limit = 3) {
  const orderedEvents = [...journeyEvents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
  container.innerHTML = orderedEvents.map(event => `
    <a class="journey-preview-item" href="/Journey">
      <time datetime="${escape(event.date)}">${escape(formatJourneyDate(event.date))}</time>
      <div>
        <h3>${escape(event.title)}</h3>
        <p>${escape(event.description)}</p>
      </div>
      <span aria-hidden="true">↗</span>
    </a>
  `).join("");
}
