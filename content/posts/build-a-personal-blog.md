这个博客将不同职责拆分到独立文件。index.html 负责页面结构，styles.css 负责视觉样式，diaries.js、friends.js、projects.js、journey.js 和 skills.js 分别保存日记、好友、项目、成长轨迹和技能内容，blog.js 负责渲染、筛选、搜索和页面切换。拆分之后，修改内容时更容易定位问题。

日记使用 JavaScript 对象保存。每篇日记包含 id、title、date、category、excerpt 和 body 六个字段。页面读取这些对象后，会按日期从新到旧生成首页列表、归档和文章前后篇导航，新增日记不需要调整数组顺序。侧边栏的重大事件入口在 index.html 中单独维护。

页面现在使用 History API 路由，首页、项目、日记、成长轨迹和好友对应 /Home、/Projects、/Diary、/Journey 和 /Friends。文章地址是 /Post/build-a-personal-blog，好友详情使用 /Friend/好友ID。站内切换时更新地址，浏览器的前进和后退也能使用。

本地预览需要运行 python server.py，不能直接双击 HTML。线上由 Nginx 的 try_files $uri $uri/ /index.html; 把页面路径回退到 index.html，这样直接打开详情地址或刷新页面时也能正常加载。
