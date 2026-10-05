// 用途：存放日记内容；首页、全部日记和文章详情读取这里的数据。
// 新增日记：复制下面任意一个完整对象，粘贴到 diaries 数组中，对象之间用逗号分隔。
// id 必须唯一，建议使用英文、数字和连字符；date 使用 YYYY-MM-DD，只知道月份时可写 YYYY-MM。
// category 使用「技术」「随笔」或「生活」；body 中每个字符串对应一个正文段落。
// 页面自动按 date 从新到旧排列；同日期保留数组顺序，首页显示最近 3 篇。
const diaries = [
  // 新增记录：正文暂留待补，后续直接替换 body 中的段落即可。
  {
    id: "changing-major-diary",
    title: "转专业日记",
    date: "2026-05-13",
    category: "随笔",
    excerpt: "记录转专业这件事。正文待补充。",
    body: ["正文待补充。"]
  },
  {
    id: "march-30-birthday-party",
    title: "3月30日生日会",
    date: "2026-03-30",
    category: "生活",
    excerpt: "记录今年 3 月 30 日的生日会。正文待补充。",
    body: ["正文待补充。"]
  },
  {
    id: "new-monitor-joy",
    title: "购买新显示器带来的欣喜",
    date: "2026-07",
    category: "生活",
    excerpt: "记录买到新显示器的欣喜。正文待补充。",
    body: ["正文待补充。"]
  },
  {
    id: "renting-a-home-diary",
    title: "租房日记",
    date: "2026-08-30",
    category: "生活",
    excerpt: "记录这次租房。正文待补充。",
    body: ["正文待补充。"]
  },
  // 技术类示例：复制整个对象后修改各项内容。
  {
    id: "build-a-personal-blog",
    title: "使用 HTML、CSS 和 JavaScript 构建个人博客",
    date: "2026-10-02",
    category: "技术",
    excerpt: "记录个人博客的文件结构、数据组织方式和页面交互实现。",
    body: [
      "这个博客将不同职责拆分到独立文件。index.html 负责页面结构，styles.css 负责视觉样式，diaries.js、friends.js、projects.js、journey.js 和 skills.js 分别保存日记、好友、项目、成长轨迹和技能内容，blog.js 负责渲染、筛选、搜索和页面切换。拆分之后，修改内容时更容易定位问题。",
      "日记使用 JavaScript 对象保存。每篇日记包含 id、title、date、category、excerpt 和 body 六个字段。页面读取这些对象后，会按日期从新到旧生成首页列表、归档和文章前后篇导航，新增日记不需要调整数组顺序。侧边栏的重大事件入口在 index.html 中单独维护。",
      "页面现在使用 History API 路由，首页、项目、日记、成长轨迹和好友对应 /Home、/Projects、/Diary、/Journey 和 /Friends。文章地址是 /Post/build-a-personal-blog，好友详情使用 /Friend/好友ID。站内切换时更新地址，浏览器的前进和后退也能使用。",
      "本地预览需要运行 python server.py，不能直接双击 HTML。线上由 Nginx 的 try_files $uri $uri/ /index.html; 把页面路径回退到 index.html，这样直接打开详情地址或刷新页面时也能正常加载。"
    ]
  },
  // 随笔类示例：复制整个对象后修改各项内容。
  {
    id: "sophomore-study-plan",
    title: "大二阶段的学习安排",
    date: "2026-08-31",
    category: "随笔",
    excerpt: "整理本学期的学习重点、时间分配和阶段目标。",
    body: [
      "本学期的主要目标：增强计算机能力和继续提高英语能力",
      "英语学习的终极目标为六级刷高分，在明年第二天的雅思考试获取不错的分数。计算机的目标为打牢408基础，提高编程能力，以及能独立复刻出中大型项目",
      "评估进度时不只看学习时长，更要注重能否独立解释概念。"
    ]
  },
  // 生活类示例：复制整个对象后修改各项内容。
  {
    id: "weekly-study-and-exercise-log",
    title: "一周的学习与运动记录",
    date: "2026-09-28",
    category: "生活",
    excerpt: "记录一周内的课程、编程练习、运动和时间调整。",
    body: [
      "本周完成了C++项目职工管理系统。主要关注类和对象以及继承的使用。",
      "运动完成了三次校园跑。。",
      "下周继续完成C++STL的练习，同时预留一个晚上整理博客内容。当前需要改进的是任务安排过于集中，之后会把较大的任务拆分到多个工作日完成。"
    ]
  }
];
