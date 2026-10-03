# 个人博客

在此目录运行 `python server.py`，打开 http://127.0.0.1:8765/Home。
可以用 `python server.py --port 8766` 指定其他端口。

页面使用 `/Home`、`/Diary`、`/Journey`、`/Friends`、`/Post/日记ID` 和 `/Friend/好友ID`。
旧的 `#home`、`#diary` 等链接会自动转成新地址。
请通过服务器浏览，不要直接双击 HTML；普通 `python -m http.server` 不支持新地址的刷新。

部署时将本目录作为站点根目录，静态文件照常提供，上述页面路径回退到
`index.html`（保留查询参数）。例如 Nginx 可在站点的 `location /` 中设置
`try_files $uri $uri/ /index.html;`。仅支持静态文件、没有路由回退的托管服务需要另配重写规则。

日记内容在 `diaries.js`，好友资料在 `friends.js`。
成长轨迹内容和可复用卡片组件在 `journey.js`，新增对象后会自动按时间从新到旧排列。
技术栈和专业课内容在 `skills.js`，可新增分组或修改各组标签。
好友的 `showOnHome: true` 表示首页展示，最多按数组顺序选取 3 位。
日记列表每页篇数和正文分页字数在 `blog.js` 顶部调整。

QQ 轮廓图标来自 Remix Icon 4.6.0 的 `qq-line.svg`：
https://github.com/Remix-Design/RemixIcon/tree/v4.6.0
保留的 Apache 2.0 许可证见 `images/RemixIcon-LICENSE.txt`。
图标只通过 CSS 设置紫色，形状未修改。
