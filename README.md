# 个人博客

在此目录运行 `python server.py`，打开 http://127.0.0.1:8765/Home。
可以用 `python server.py --port 8766` 指定其他端口。

页面使用 `/Home`、`/Projects`、`/Diary`、`/Journey`、`/Friends`、`/Post/日记ID` 和 `/Friend/好友ID`。
旧的 `#home`、`#diary` 等链接会自动转成新地址。
请通过服务器浏览，不要直接双击 HTML；普通 `python -m http.server` 和未配置 SPA fallback 的 Live Server 不支持新地址的刷新。
未知页面、不存在的文章或好友会显示站内 404，并保留原地址。`server.py` 会将不存在的页面路径交给前端；缺失的 `.js`、`.css`、图片等静态资源仍返回 HTTP 404。
站内 404 是前端视图，SPA 回退得到的 HTML 状态码仍为 200。

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

好友详情共用一份组件，资料按姓名、身份、关系标签、简介显示；空字段自动隐藏。`identity` 可单独设置身份，不填写时兼容原来的 `description`；`tags: ["小学同学", "大学同学"]` 配置关系标签。原有 `content` 图文块优先于 `bio`，`photo` 和 `cover` 仍可使用。

透明人物图配置示例（牛子）：

```js
characterImage: "images/friends/niuzi-harden-character.png",
characterOptions: {
  scale: 1.3,       // 桌面人物放大约 30%
  right: 0,        // 距右侧的百分比
  bottom: 0,       // 距底部的像素数
  footOffset: 3.8, // 向下补偿 PNG 脚下透明留白，按图片高度百分比填写
  mobileScale: 1  // 手机端人物大小
}
```

桌面端人物与文字分区，脚底对齐资料区域底部；900px 及以下人物排在资料下方。图片加载失败会隐藏人物并恢复普通资料宽度。缩放和位置只影响当前好友，无需修改 HTML 或 CSS。
日记的 `id` 必须唯一，`date` 使用 `YYYY-MM-DD`；只知道月份时可写 `YYYY-MM`，无需补造具体日期。数组位置不决定显示时间顺序：首页、归档和上一篇 / 下一篇都按日期从新到旧排列，同日期保留原数组顺序。
缺少 `id` 的条目不显示；缺日期的条目排在末尾，其余缺失文本使用简单默认值，不影响其他文章。`body` 推荐使用段落数组。
日记列表每页篇数和正文分页字数在 `blog.js` 顶部调整；新增、删除或修改日记 ID 后，需要同步更新 `sitemap.xml` 中的 `/Post/{id}`。

## 图片优化

首页使用已有的 `images/profile-avatar.webp`，原始 PNG 保留作为素材，不会在页面中加载。好友图片当前大小适中，无需反复压缩。
安装 Pillow 后，用同一个工具处理头像或好友照片：

```powershell
py -m pip install pillow
py tools/optimize_images.py images/profile-avatar.png
py tools/optimize_images.py images/friends/example.jpg
```

将示例路径替换成真实存在的图片。如果 `py` 提示找不到 Python，可将上述 `py` 换成 `python`。
工具保持比例，最长边最多 1000px，质量 85，不放大小图；在同目录生成同名 `.webp` 并显示文件大小、缩减比例和输出路径，原图不会被修改。
目标文件已存在时会拒绝覆盖；确实要重新生成时添加 `--overwrite`。不接受 WebP 自身作为输入，避免覆盖原图。
`python compress_avatar.py` 保留为头像工具的兼容入口，同样要求 `--overwrite` 才能替换已有 WebP。

## SEO

正式域名为 `https://huangminjin.com`。HTML 中 canonical 和 `og:url` 的初始值为正式首页地址，路由切换后由 `updateCanonicalUrl()` 更新浏览器中的完整地址。
这是纯静态 SPA，不执行 JavaScript 的社交媒体爬虫仍只会读到初始 HTML，不能保证每篇文章拥有独立的分享预览。
`robots.txt` 声明了 sitemap 地址；`sitemap.xml` 手动维护首页、栏目和全部日记，不包含好友详情。
