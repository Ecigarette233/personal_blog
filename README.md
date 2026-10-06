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

日记目录在 `diaries.js`，每篇正文在 `content/posts/*.md`；好友目录在 `friends.js`，每位好友完整资料在 `content/friends/*.json`。项目内容在 `projects.js`；侧边栏重大事件在 `events.js` 中引用日记或项目的 `id`。
成长轨迹内容和可复用卡片组件在 `journey.js`，新增对象后会自动按时间从新到旧排列。
首页会自动展示最近三篇日记、最新三个成长节点和首个项目；完整内容仍由各自页面展示。
技能与学习内容在 `skills.js`，分为“正在使用”“正在学习”和“专业基础”，可新增分组或修改各组标签。
好友的 `showOnHome: true` 表示首页展示，最多按数组顺序选取 3 位。
好友照片在对应 `content/friends/好友ID.json` 的 `photo` 字段填写，例如 `"photo": "images/friends/liu-jianxing.webp"`（先将实际照片放入该路径）。照片位置继续由现有详情组件控制；不填写或加载失败时回退到 `avatar`。可选字段 `"photoPosition": "center 30%"` 调整人物裁切位置。
好友简介的 `bio` 可以保留单个字符串；需要多段时写成数组，例如 `bio: ["第一段。", "第二段。"]`，页面会自动生成独立段落。

好友详情共用一份组件，资料按姓名、身份、关系标签、简介显示；空字段自动隐藏。`identity` 可单独设置身份，不填写时兼容原来的 `description`；`tags: ["小学同学", "大学同学"]` 配置关系标签。原有 `content` 图文块优先于 `bio`，`photo` 和 `cover` 仍可使用。

透明人物图配置示例（牛子）：

```json
{
  "characterImage": "images/friends/niuzi-harden-character.png",
  "characterOptions": {
    "scale": 1.3,
    "right": 0,
    "bottom": 0,
    "footOffset": 3.8,
    "mobileScale": 1
  }
}
```

将这两个字段合并到该好友已有 JSON 中。`scale` 是桌面缩放；`right` 是距右侧百分比；`bottom` 是底部像素偏移；`footOffset` 按图片高度百分比补偿脚下透明留白；`mobileScale` 控制手机缩放。
封面可参考 `content/friends/CSH233.json`：`cover.src` 指定图片，`position` 和 `mobilePosition` 控制桌面/手机裁切；`cardLeft` 控制身份卡左侧像素间距，`cardBottom` 为底部偏移（负值表示向下悬浮）。

桌面端人物与文字分区，脚底对齐资料区域底部；900px 及以下人物排在资料下方。图片加载失败会隐藏人物并恢复普通资料宽度。缩放和位置只影响当前好友，无需修改 HTML 或 CSS。
日记的 `id` 必须唯一，`date` 使用 `YYYY-MM-DD`；只知道月份时可写 `YYYY-MM`，无需补造具体日期。数组位置不决定显示时间顺序：首页、归档和上一篇 / 下一篇都按日期从新到旧排列，同日期保留原数组顺序。
缺少 `id` 的条目不显示；缺日期的条目排在末尾，其余缺失文本使用简单默认值。正文由 `file` 指定的 Markdown 文件加载，不再手动填写 `body`。
日记列表每页篇数和正文分页字数在 `blog.js` 顶部调整；新增、删除或修改日记 ID 后，需要同步更新 `sitemap.xml` 中的 `/Post/{id}`。

## 添加或修改日记

1. 在 `content/posts/` 新建一个 `.md` 文件。空行分段，直接写正文，不必重复写文章标题。
2. 在 `diaries.js` 添加目录记录，例如：

```js
{
  id: "my-new-diary",
  title: "新日记",
  date: "2026-10-06",
  category: "生活",
  excerpt: "一句话摘要。",
  file: "content/posts/my-new-diary.md"
}
```

正文图片单独占一行，与前后段落各隔一个空行：

```markdown
第一段正文。

![照片说明](/images/diaries/example.webp)

第二段正文。
```

需要图注时使用 `![照片说明](/images/diaries/example.webp "可选图注")`。
当前轻量 Markdown 支持：空行分段、`#` 至 `######` 标题、`>` 引用、单层无序/有序列表、三个反引号围住的代码块，以及独占一行的图片。图片 URL 中的空格请用 `%20`。不执行原始 HTML；暂不解析表格、嵌套列表、行内粗体/链接等扩展语法，这些文本按原样显示。
图片路径以 `/images/` 开头，避免 `/Post/...` 深层路由改变相对路径。原有文字、段落顺序和图片比例保持不变，长文仍按 `ARTICLE_PAGE_SIZE` 分页。

## 添加或修改好友

1. 复制一份 `content/friends/` 下的 JSON 文件，修改姓名、头像、标签、简介及媒体配置。
2. 在 `friends.js` 的 `friendDirectory` 中加入 `{ id: "好友ID", file: "content/friends/好友ID.json" }`。
3. 目录和 JSON 内的 `id` 必须一致；目录顺序决定列表顺序，`showOnHome` 仍决定首页展示。

JSON 的字段名与字符串使用双引号，不支持注释或最后一项后的逗号。`bio` 仍支持字符串或数组，`content` 仍支持 text/image/gallery/quote；有效 `content` 优先于 `bio`。所有已有 photo、cover、characterImage 和 characterOptions 字段原样保留。
修改已有记录只需编辑对应文件，无需再改 HTML 或 `blog.js`。

`content.js` 在启动时并行读取目录中的文件，然后交给原有渲染器，保持全文搜索、分类、分页、前后篇和 History API 行为。文件读取失败会显示可刷新重试的提示，不阻断其他记录。JSON/Markdown 使用缓存校验，部署时需要把 `content/` 目录一并上传。浏览器不能扫描服务器目录，因此新增文件后仍须手动登记目录。

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
