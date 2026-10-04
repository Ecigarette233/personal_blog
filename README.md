# 个人博客

在此目录运行 `python server.py`，打开 http://127.0.0.1:8765/Home。
可以用 `python server.py --port 8766` 指定其他端口。

页面使用 `/Home`、`/Projects`、`/Diary`、`/Journey`、`/Friends`、`/Post/日记ID` 和 `/Friend/好友ID`。
旧的 `#home`、`#diary` 等链接会自动转成新地址。
请通过服务器浏览，不要直接双击 HTML；普通 `python -m http.server` 不支持新地址的刷新。

部署时将本目录作为站点根目录，静态文件照常提供，上述页面路径回退到
`index.html`（保留查询参数）。例如 Nginx 可在站点的 `location /` 中设置
`try_files $uri $uri/ /index.html;`。仅支持静态文件、没有路由回退的托管服务需要另配重写规则。

日记内容在 `diaries.js`，好友资料在 `friends.js`，项目内容在 `projects.js`。
成长轨迹内容和可复用卡片组件在 `journey.js`，新增对象后会自动按时间从新到旧排列。
首页会自动展示最近三篇日记、最新三个成长节点和首个项目；完整内容仍由各自页面展示。
技能与学习内容在 `skills.js`，分为“正在使用”“正在学习”和“专业基础”，可新增分组或修改各组标签。
好友的 `showOnHome: true` 表示首页展示，最多按数组顺序选取 3 位。
好友照片在 `friends.js` 对应人物的 `photo` 字段填写，例如 `photo: "images/friends/liu-jianxing.webp"`（先将实际照片放入该路径）。照片显示在详情页名称右侧；不填写或加载失败时自动隐藏，不会显示破图。可选字段 `photoPosition: "center 30%"` 调整人物裁切位置，原有 `avatar` 字母头像继续保留。
好友简介的 `bio` 可以保留单个字符串；需要多段时写成数组，例如 `bio: ["第一段。", "第二段。"]`，页面会自动生成独立段落。
日记列表每页篇数和正文分页字数在 `blog.js` 顶部调整。

`robots.txt` 已允许搜索引擎抓取。Canonical 与 Open Graph URL 会根据当前部署域名自动更新；如需提交 `sitemap.xml`，请在确定正式域名后使用绝对 URL 生成，避免把开发地址或占位域名提交到搜索引擎。
