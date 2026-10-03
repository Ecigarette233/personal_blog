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
    description: "完成大学英语六级考试，为后续英语学习建立新的起点。",
    type: "成绩"
  },
  {
    date: "2026-05",
    title: "转入计算机科学与技术专业",
    description: "确定未来方向，开始围绕计算机基础、开发与 AI 规划学习。",
    type: "选择"
  },
  {
    date: "2026-04",
    title: "自学数据结构",
    description: "从线性表、栈、队列和树开始，建立算法与 408 学习基础。",
    type: "学习"
  },
  {
    date: "2025-09-05",
    title: "拿到驾驶证",
    description: "完成驾驶学习与考试，解锁一项新的生活技能。",
    type: "生活"
  },
  {
    date: "2025-09",
    title: "进入大学",
    description: "开启大学生活，开始探索专业方向与长期目标。",
    type: "阶段"
  },
  {
    date: "2025-07",
    title: "开始学习 C 语言",
    description: "第一次系统接触编程，为后续计算机学习打下基础。",
    type: "学习"
  },
  {
    date: "2025-06",
    title: "高考结束",
    description: "告别高中阶段，也从这里开始记录新的成长轨迹。",
    type: "起点"
  }
];

function formatJourneyDate(date) {
  const [year, month, day] = date.split("-");
  return `${year}.${month}${day ? `.${day}` : ""}`;
}

// 可复用的单个时间轴卡片。event 字段与上方数组中的对象一致。
function renderJourneyCard(event, index, escape) {
  return `
    <article class="timeline-item ${index % 2 === 0 ? "timeline-left" : "timeline-right"}">
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
  container.innerHTML = orderedEvents.map((event, index) => renderJourneyCard(event, index, escape)).join("");
}
