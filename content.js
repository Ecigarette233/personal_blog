// 独立内容文件的读取层。只解析明确支持的 Markdown，不执行 HTML 或脚本。
function parseDiaryMarkdown(source) {
  const lines = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length) blocks.push(paragraph.join("\n"));
    paragraph = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { flush(); continue; }
    const image = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)\s*$/);
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const list = line.match(/^(?:([-+*])|(\d+)\.)\s+(.+)$/);
    if (/^```/.test(line)) {
      flush();
      const code = [];
      while (++i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i]);
      blocks.push({ type: "code", text: code.join("\n") });
    } else if (image) {
      flush();
      // 仅允许站内路径及 HTTP(S) 图片；拒绝 data、javascript 等协议。
      if (!/^(?:https?:\/\/|\/?[^\s:]+$)/i.test(image[2]) || image[2].startsWith("//")) {
        blocks.push(line);
        continue;
      }
      const block = { type: "image", src: image[2], alt: image[1] };
      if (image[3]) block.caption = image[3];
      blocks.push(block);
    } else if (heading) {
      flush();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
    } else if (/^>\s?/.test(line)) {
      flush();
      const quote = [line.replace(/^>\s?/, "")];
      while (i + 1 < lines.length && /^>\s?/.test(lines[i + 1])) quote.push(lines[++i].replace(/^>\s?/, ""));
      blocks.push({ type: "quote", text: quote.join("\n") });
    } else if (list) {
      flush();
      const ordered = Boolean(list[2]);
      const items = [list[3]];
      const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-+*]\s+(.+)$/;
      let next;
      while (i + 1 < lines.length && (next = lines[i + 1].match(pattern))) {
        items.push(next[1]);
        i++;
      }
      blocks.push({ type: "list", ordered, start: ordered ? Number(list[2]) : 1, items });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

// 新增 Markdown 块只用 DOM 和 textContent；普通段落、照片继续复用原渲染器。
function createMarkdownBlock(block) {
  if (!block || typeof block !== "object") return null;
  if (block.type === "heading") {
    const heading = document.createElement(`h${Math.min(6, Math.max(2, block.level))}`);
    heading.textContent = block.text;
    return heading;
  }
  if (block.type === "quote") {
    const quote = document.createElement("blockquote");
    quote.textContent = block.text;
    return quote;
  }
  if (block.type === "code") {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = block.text;
    pre.append(code);
    pre.style.whiteSpace = "pre-wrap";
    return pre;
  }
  if (block.type === "list") {
    const list = document.createElement(block.ordered ? "ol" : "ul");
    if (block.ordered) list.start = block.start;
    block.items.forEach(text => {
      const item = document.createElement("li");
      item.textContent = text;
      list.append(item);
    });
    return list;
  }
  return null;
}

async function readContentFile(path) {
  const url = new URL(path, document.baseURI);
  if (url.origin !== location.origin || !url.pathname.startsWith("/content/")) {
    throw new Error("内容文件必须位于本站 content 目录");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { cache: "no-cache", signal: controller.signal });
    if (!response.ok) throw new Error(`读取失败：${response.status}`);
    const text = await response.text();
    // 部署配置可能把丢失的文件回退成 index.html，不能误当文章显示。
    if (/^\s*(?:<!doctype html|<html[\s>])/i.test(text)) throw new Error("内容路径返回了 HTML 页面");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadSiteContent() {
  // 所有正文在启动时并行加载一次，以保留原来的全文搜索及同步分页。
  // 单个文件出错只影响这一条记录，不阻断首页或其他好友。
  const postTasks = diaries.map(post => async () => {
    try {
      post.body = parseDiaryMarkdown(await readContentFile(post.file));
    } catch (error) {
      post.body = ["正文暂时无法加载，请刷新页面重试。"];
      console.warn(`日记文件无法读取：${post.file}`, error);
    }
  });
  const records = [];
  const friendTasks = friendDirectory.map((entry, index) => async () => {
    try {
      const friend = JSON.parse(await readContentFile(entry.file));
      if (!friend || friend.id !== entry.id || typeof friend.name !== "string") {
        throw new Error("好友 id 与目录不一致，或缺少 name");
      }
      records[index] = friend;
    } catch (error) {
      console.warn(`好友文件无法读取：${entry.file}`, error);
      records[index] = { id: entry.id, name: entry.id, avatar: "", description: "", bio: "资料暂时无法加载，请刷新页面重试。" };
    }
  });
  // 限制同时请求数量，避免本地预览服务器被大量小文件请求占满。
  const tasks = [...postTasks, ...friendTasks];
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) await tasks[next++]();
  };
  await Promise.all(Array.from({ length: Math.min(4, tasks.length) }, worker));
  friends.splice(0, friends.length, ...records);
}
