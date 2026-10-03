// 用途：实现首页与日记页面切换、日记渲染、分类筛选、搜索和上一篇/下一篇导航。
// 依赖：diaries.js 和 friends.js 必须先加载；个人资料在 HTML 中修改。
// 本文件同时负责好友卡片渲染，以及日记筛选、搜索和文章导航。

// 页面元素与筛选状态。
const viewNames = ["home", "journey", "friends", "friend", "projects", "diary", "article"];
const navigationLinks = document.querySelectorAll("[data-nav]");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchInput = document.getElementById("search");
let selectedCategory = "全部";
// 可调整：列表每页篇数、正文每页字数上限（优先保持段落完整）。
const ARCHIVE_PAGE_SIZE = 6;
const ARTICLE_PAGE_SIZE = 800;
let archivePage = 1;
let archiveReturnLink = "/Diary";

function currentAddress() {
  return location.pathname + location.search + location.hash;
}

function replaceAddress(address) {
  if (currentAddress() !== address) history.replaceState(null, "", address);
}

function clampPage(value, total) {
  const page = Number(value);
  return Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), total);
}

function archiveLink(page = archivePage) {
  const params = new URLSearchParams();
  if (selectedCategory !== "全部") params.set("category", selectedCategory);
  if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
  if (page > 1) params.set("page", page);
  return `/Diary${params.size ? `?${params}` : ""}`;
}

// 页数很多时保留首尾与当前页附近的页码，避免导航无限变长。
function renderPagination(id, page, total, linkForPage) {
  const container = document.getElementById(id);
  container.hidden = total === 0;
  if (!total) { container.innerHTML = ""; return; }
  const link = (number, label, disabled = false) => disabled
    ? `<span class="page-link disabled" aria-disabled="true">${label}</span>`
    : `<a class="page-link" href="${escapeHtml(linkForPage(number))}" ${number === page ? 'aria-current="page"' : ""} aria-label="${label === String(number) ? `第 ${number} 页` : label}">${label}</a>`;
  const visible = Array.from({ length: total }, (_, i) => i + 1)
    .filter(number => total <= 7 || number === 1 || number === total || Math.abs(number - page) <= 1);
  const numbers = visible.map((number, i) =>
    (i && number - visible[i - 1] > 1 ? '<span class="page-ellipsis">…</span>' : "") + link(number, String(number))
  ).join("");
  container.innerHTML = `<span class="page-status" aria-live="polite">第 ${page} / ${total} 页</span>
    <div class="page-controls">${link(page - 1, "上一页", page === 1)}${numbers}${link(page + 1, "下一页", page === total)}</div>`;
}

// 长段落优先在标点处断开；使用 Unicode 字符切分，保留所有正文内容。
function paginateBody(body) {
  const pages = [];
  let paragraphs = [];
  let length = 0;
  const flush = () => {
    if (paragraphs.length) pages.push(paragraphs);
    paragraphs = [];
    length = 0;
  };
  body.forEach(paragraph => {
    let characters = Array.from(paragraph);
    if (length + characters.length > ARTICLE_PAGE_SIZE) flush();
    while (characters.length > ARTICLE_PAGE_SIZE) {
      let split = ARTICLE_PAGE_SIZE;
      for (let i = ARTICLE_PAGE_SIZE - 1; i >= ARTICLE_PAGE_SIZE / 2; i--) {
        if (/[。！？；.!?;\s]/u.test(characters[i])) { split = i + 1; break; }
      }
      paragraphs.push(characters.slice(0, split).join(""));
      flush();
      characters = characters.slice(split);
    }
    paragraphs.push(characters.join(""));
    length += characters.length;
  });
  flush();
  return pages.length ? pages : [[]];
}

// 日记内容作为文本展示，避免内容中的 HTML 被执行。
function escapeHtml(value) {
  const entities = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  };
  return String(value).replace(/[&<>"']/g, character => entities[character]);
}

function postLink(post) {
  return `/Post/${encodeURIComponent(post.id)}`;
}

function friendLink(friend) {
  return `/Friend/${encodeURIComponent(friend.id)}`;
}

function renderPostCard(post) {
  return `
    <a class="latest" href="${postLink(post)}">
      <div class="post-meta">
        <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
        <span class="tag">${escapeHtml(post.category)}</span>
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
    </a>
  `;
}

// 首页展示最新三篇日记；侧边栏的重大事件在 HTML 中单独维护。
function renderRecentPosts() {
  const recentPosts = diaries.slice(0, 3);
  document.getElementById("recent-posts").innerHTML = recentPosts
    .map(renderPostCard).join("");
}

// 好友卡片进入站内简介页，外部个人主页（若有）会在简介页中展示。
function renderFriendCard(friend) {
  return `
      <a class="friend-card" href="${friendLink(friend)}" aria-label="查看 ${escapeHtml(friend.name)} 的个人简介">
        <span class="friend-avatar" aria-hidden="true">${escapeHtml(friend.avatar)}</span>
        <div class="friend-info">
          <h3>${escapeHtml(friend.name)}</h3>
          <p>${escapeHtml(friend.description)}</p>
        </div>
        <span class="friend-status">查看简介 <span aria-hidden="true">↗</span></span>
      </a>
    `;
}

function renderFriends() {
  const homeFriends = friends.filter(friend => friend.showOnHome === true).slice(0, 3);
  document.getElementById("friends-list").innerHTML = homeFriends.map(renderFriendCard).join("");
  document.getElementById("friends").hidden = homeFriends.length === 0;
  document.getElementById("all-friends-list").innerHTML = friends.map(renderFriendCard).join("");
  document.getElementById("friends-count").textContent = friends.length;
  document.getElementById("friends-empty").hidden = friends.length !== 0;
}

function renderSkills() {
  document.getElementById("skills-groups").innerHTML = skillGroups.map(group => `
    <section class="skills-section" aria-labelledby="${escapeHtml(group.id)}-title">
      <h3 id="${escapeHtml(group.id)}-title">${escapeHtml(group.title)}</h3>
      <div class="skills">
        ${group.items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </section>
  `).join("");
}

function renderFriendProfile(friend) {
  document.getElementById("friend-profile-avatar").textContent = friend.avatar;
  document.getElementById("friend-profile-name").textContent = friend.name;
  document.getElementById("friend-profile-description").textContent = friend.description;
  document.getElementById("friend-profile-bio").textContent = friend.bio;

  const homepage = document.getElementById("friend-homepage");
  const hasHomepage = typeof friend.url === "string" && friend.url.trim() !== "";
  homepage.hidden = !hasHomepage;
  if (hasHomepage) homepage.href = friend.url.trim();
}

// 分类与搜索同时生效，搜索范围包括标题、摘要和正文。
function renderArchive() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const matches = diaries.filter(post => {
    const matchesCategory = selectedCategory === "全部"
      || post.category === selectedCategory;
    const text = [post.title, post.excerpt, ...post.body]
      .join(" ").toLocaleLowerCase();
    return matchesCategory && text.includes(query);
  });

  const totalPages = Math.ceil(matches.length / ARCHIVE_PAGE_SIZE);
  archivePage = clampPage(archivePage, Math.max(1, totalPages));
  const start = (archivePage - 1) * ARCHIVE_PAGE_SIZE;
  document.getElementById("archive-posts").innerHTML = matches.slice(start, start + ARCHIVE_PAGE_SIZE)
    .map(renderPostCard).join("");
  const categoryLabel = selectedCategory === "全部" ? "" : ` · ${selectedCategory}`;
  document.getElementById("result-count").textContent =
    `共 ${matches.length} 篇日记${categoryLabel}${matches.length ? ` · 显示 ${start + 1}–${Math.min(start + ARCHIVE_PAGE_SIZE, matches.length)} 篇` : ""} · 每页 ${ARCHIVE_PAGE_SIZE} 篇`;
  document.getElementById("empty").hidden = matches.length !== 0;
  renderPagination("archive-pagination", archivePage, totalPages, archiveLink);
  archiveReturnLink = archiveLink();
  replaceAddress(archiveReturnLink);
}

function renderArticle(index, requestedPage) {
  const post = diaries[index];
  const pages = paginateBody(post.body);
  const page = clampPage(requestedPage, pages.length);
  const pageLink = number => `${postLink(post)}${number > 1 ? `?page=${number}` : ""}`;
  replaceAddress(pageLink(page));
  document.getElementById("article-back").href = archiveReturnLink;
  document.getElementById("article-title").textContent = post.title;
  document.getElementById("article-meta").innerHTML = `
    <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
    <span class="tag">${escapeHtml(post.category)}</span>
    <span>黄敏津</span>
  `;
  document.getElementById("article-body").innerHTML = pages[page - 1]
    .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("");
  renderPagination("article-pagination", page, pages.length, pageLink);

  const previousLink = index > 0
    ? `<a href="${postLink(diaries[index - 1])}">← 上一篇</a>`
    : "<span></span>";
  const nextLink = index < diaries.length - 1
    ? `<a href="${postLink(diaries[index + 1])}">下一篇 →</a>`
    : "<span></span>";
  document.getElementById("article-nav").innerHTML = previousLink + nextLink;
}

function updateNavigation(view) {
  const isDiaryView = view === "diary" || view === "article";
  const activeNavigation = isDiaryView
    ? "diary"
    : view === "journey" ? "journey"
    : (view === "friends" || view === "friend") ? "friends"
    : view === "projects" ? "projects"
    : "home";

  navigationLinks.forEach(link => {
    const active = link.dataset.nav === activeNavigation;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// 使用 History API；server.py 为直接访问、刷新及新标签页提供路由回退。
// 兼容旧的 #home、#diary、#friends、#post/... 等链接。
function route() {
  const rawHash = location.hash.slice(1);
  const legacy = /^(?:home|diary|journey|friends|projects|post(?:\/|$)|friend(?:\/|$))/i.test(rawHash)
    ? rawHash
    : "";
  const anchor = legacy ? "" : rawHash.toLowerCase();
  const [path, query = ""] = legacy
    ? legacy.split("?")
    : (location.pathname.replace(/^\/+|\/+$/g, "") + location.search).split("?");
  const [section, ...segments] = path.split("/");
  const hash = section.toLowerCase();
  const id = segments.join("/");
  const params = new URLSearchParams(query);
  let view = "home";
  let postIndex = -1;
  let friendIndex = -1;

  if (hash === "diary") {
    view = "diary";
    const category = params.get("category") || "全部";
    selectedCategory = Array.from(filterButtons).some(button => button.dataset.filter === category) ? category : "全部";
    searchInput.value = params.get("q") || "";
    archivePage = params.get("page") || 1;
    updateFilters();
  } else if (hash === "friends") {
    view = "friends";
  } else if (hash === "journey") {
    view = "journey";
  } else if (hash === "projects") {
    view = "projects";
  } else if (hash === "friend") {
    friendIndex = friends.findIndex(friend => encodeURIComponent(friend.id) === id);
    view = friendIndex >= 0 ? "friend" : "friends";
  } else if (hash === "post") {
    postIndex = diaries.findIndex(post => encodeURIComponent(post.id) === id);
    view = postIndex >= 0 ? "article" : "diary";
  }

  viewNames.forEach(name => {
    document.getElementById(`${name}-view`).hidden = name !== view;
  });
  updateNavigation(view);

  if (view === "diary") renderArchive();
  if (view === "article") renderArticle(postIndex, params.get("page") || 1);
  if (view === "friend") renderFriendProfile(friends[friendIndex]);
  if (view === "home") replaceAddress(anchor ? `/Home#${anchor}` : "/Home");
  if (view === "journey") replaceAddress("/Journey");
  if (view === "friends") replaceAddress("/Friends");
  if (view === "projects") replaceAddress("/Projects");
  if (view === "friend") replaceAddress(friendLink(friends[friendIndex]));

  const title = view === "article" ? diaries[postIndex].title
    : view === "friend" ? `${friends[friendIndex].name} · 好友简介`
    : view === "friends" ? "我的好友"
    : view === "journey" ? "成长轨迹"
    : view === "projects" ? "个人项目"
    : view === "diary" ? "全部日记" : "个人博客";
  document.title = `${title} · 黄敏津`;

  if (view === "home" && ["about", "contact"].includes(anchor)) {
    document.getElementById(anchor).scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

function updateFilters() {
  filterButtons.forEach(filter => {
    const active = filter.dataset.filter === selectedCategory;
    filter.classList.toggle("active", active);
    filter.setAttribute("aria-pressed", String(active));
  });
}

function initialize() {
  renderRecentPosts();
  renderFriends();
  renderSkills();
  renderJourney(document.getElementById("timeline"), escapeHtml);
  document.getElementById("year").textContent = new Date().getFullYear();

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.filter;
      archivePage = 1;
      updateFilters();
      renderArchive();
    });
  });

  searchInput.addEventListener("input", () => {
    archivePage = 1;
    renderArchive();
  });
  // 普通站内点击无需重新加载；保留 Ctrl/Command 点击、新标签页及邮件链接的默认行为。
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey
      || event.shiftKey || event.altKey || link.hasAttribute("download")
      || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/^\/(Home|Diary|Journey|Friends|Projects|Post\/[^/]+|Friend\/[^/]+)\/?$/i.test(url.pathname)) return;
    event.preventDefault();
    const address = url.pathname + url.search + url.hash;
    if (currentAddress() !== address) history.pushState(null, "", address);
    route();
  });
  window.addEventListener("popstate", route);
  window.addEventListener("hashchange", route);
  route();
}

initialize();

