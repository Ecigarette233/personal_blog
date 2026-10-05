// 用途：渲染博客各页面，维护路由、日记筛选、搜索、分页和文章前后篇导航。
// 依赖：diaries.js、friends.js、projects.js、journey.js 和 skills.js 必须先加载。
// 本文件负责内容渲染、History API 路由、日记筛选与分页。

// 页面元素与筛选状态。
const viewNames = ["home", "journey", "friends", "friend", "projects", "diary", "article", "not-found"];
const navigationLinks = document.querySelectorAll("[data-nav]");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchInput = document.getElementById("search");
let selectedCategory = "全部";
// 可调整：列表每页篇数、正文每页字数上限（优先保持段落完整）。
const ARCHIVE_PAGE_SIZE = 6;
const ARTICLE_PAGE_SIZE = 800;
let archivePage = 1;
let archiveReturnLink = "/Diary";

// 统一日记顺序并补齐可选内容；不修改原数据，同日保留数组顺序。
// 缺少有效 id 的记录无法生成详情链接，因此跳过；缺少日期的记录排在最后。
function getSortedDiaries() {
  return (Array.isArray(diaries) ? diaries : [])
    .filter(post => post && typeof post.id === "string" && post.id.trim())
    .map(post => ({
      ...post,
      date: typeof post.date === "string" && /^\d{4}-\d{2}(?:-\d{2})?$/.test(post.date) ? post.date : "",
      title: typeof post.title === "string" && post.title.trim() ? post.title : "未命名日记",
      category: typeof post.category === "string" && post.category.trim() ? post.category : "未分类",
      excerpt: typeof post.excerpt === "string" ? post.excerpt : "",
      body: (Array.isArray(post.body) ? post.body : [post.body])
        .filter(paragraph => typeof paragraph === "string")
    }))
    .sort((first, second) => second.date.localeCompare(first.date));
}

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
  return String(value ?? "").replace(/[&<>"']/g, character => entities[character]);
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
        ${post.date ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>` : '<span>日期待补充</span>'}
        <span class="tag">${escapeHtml(post.category)}</span>
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
    </a>
  `;
}

// 首页展示最新三篇日记；侧边栏的重大事件在 HTML 中单独维护。
function renderRecentPosts() {
  const recentPosts = getSortedDiaries().slice(0, 3);
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

function projectAction(url, label, external = false) {
  if (typeof url !== "string" || !url.trim()) return "";
  const attributes = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a href="${escapeHtml(url.trim())}"${attributes}>${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
}

// 项目卡由 projects.js 驱动：没有填写的 GitHub / Demo 链接会自动隐藏，避免死链接。
function renderProjectCard(project, compact = false) {
  const highlights = compact ? project.highlights.slice(0, 2) : project.highlights;
  const techStack = compact ? project.techStack.slice(0, 6) : project.techStack;
  return `
    <article class="project-card${compact ? " project-card-compact" : ""}">
      <header class="project-card-head">
        <div>
          <p class="project-date">${escapeHtml(project.date)}</p>
          <h2>${escapeHtml(project.name)}</h2>
        </div>
        <span class="project-status">${escapeHtml(project.status)}</span>
      </header>
      <p class="project-description">${escapeHtml(project.description)}</p>
      <div class="project-tech" aria-label="${escapeHtml(project.name)} 使用技术">
        ${techStack.map(item => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
      <ul class="project-highlights">
        ${highlights.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="project-actions">
        ${projectAction(project.github, "GitHub", true)}
        ${projectAction(project.demo, "查看站点")}
      </div>
    </article>
  `;
}

function renderProjects() {
  const projectList = Array.isArray(projects) ? projects : [];
  document.getElementById("projects-list").innerHTML = projectList
    .map(project => renderProjectCard(project)).join("");
  document.getElementById("home-projects-list").innerHTML = projectList
    .slice(0, 1)
    .map(project => renderProjectCard(project, true)).join("");
  document.getElementById("projects-empty").hidden = projectList.length !== 0;
}

function renderFriendProfile(friend) {
  document.getElementById("friend-profile-avatar").textContent = friend.avatar;
  document.getElementById("friend-profile-name").textContent = friend.name;
  document.getElementById("friend-profile-description").textContent = friend.description;

  // bio 兼容原来的单个字符串，也支持用数组写成多个自然段。
  const bioContainer = document.getElementById("friend-profile-bio");
  const bioParagraphs = Array.isArray(friend.bio) ? friend.bio : [friend.bio];
  bioContainer.replaceChildren(...bioParagraphs
    .filter(paragraph => typeof paragraph === "string" && paragraph.trim())
    .map(paragraph => {
      const element = document.createElement("p");
      element.textContent = paragraph.trim();
      return element;
    }));

  // 每次切换好友都重建照片，避免上一位好友的照片或加载回调残留。
  const photoContainer = document.getElementById("friend-profile-photo");
  const profileHeader = photoContainer.closest(".friend-profile-header");
  photoContainer.replaceChildren();
  photoContainer.hidden = true;
  profileHeader.classList.remove("has-photo");
  if (typeof friend.photo === "string" && friend.photo.trim()) {
    const photo = document.createElement("img");
    photo.alt = `${friend.name}的照片`;
    photo.width = 176;
    photo.height = 176;
    photo.decoding = "async";
    photo.style.objectPosition = friend.photoPosition || "center";
    photo.onload = () => {
      if (photo.parentElement !== photoContainer) return;
      photoContainer.hidden = false;
      profileHeader.classList.add("has-photo");
    };
    photo.onerror = () => {
      if (photo.parentElement !== photoContainer) return;
      photoContainer.hidden = true;
      profileHeader.classList.remove("has-photo");
      photo.remove();
    };
    photoContainer.append(photo);
    photo.src = friend.photo.trim();
  }

  const homepage = document.getElementById("friend-homepage");
  const hasHomepage = typeof friend.url === "string" && friend.url.trim() !== "";
  homepage.hidden = !hasHomepage;
  if (hasHomepage) homepage.href = friend.url.trim();
}

// 分类与搜索同时生效，搜索范围包括标题、摘要和正文。
function renderArchive() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const matches = getSortedDiaries().filter(post => {
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

function renderArticle(post, requestedPage) {
  const orderedPosts = getSortedDiaries();
  const index = orderedPosts.findIndex(item => item.id === post.id);
  const pages = paginateBody(post.body);
  const page = clampPage(requestedPage, pages.length);
  const pageLink = number => `${postLink(post)}${number > 1 ? `?page=${number}` : ""}`;
  replaceAddress(pageLink(page));
  document.getElementById("article-back").href = archiveReturnLink;
  document.getElementById("article-title").textContent = post.title;
  document.getElementById("article-meta").innerHTML = `
    ${post.date ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>` : '<span>日期待补充</span>'}
    <span class="tag">${escapeHtml(post.category)}</span>
    <span>黄敏津</span>
  `;
  document.getElementById("article-body").innerHTML = pages[page - 1]
    .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("");
  renderPagination("article-pagination", page, pages.length, pageLink);

  const previousLink = index > 0
    ? `<a href="${postLink(orderedPosts[index - 1])}">← 上一篇</a>`
    : "<span></span>";
  const nextLink = index < orderedPosts.length - 1
    ? `<a href="${postLink(orderedPosts[index + 1])}">下一篇 →</a>`
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
    : view === "home" ? "home" : null;

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

// HTML 提供正式域名的初始值；路由变化后同步当前地址。仅更新浏览器中的元信息。
function updateCanonicalUrl() {
  const currentUrl = `${location.origin}${location.pathname}${location.search}`;
  const canonical = document.querySelector('link[rel="canonical"]');
  const openGraphUrl = document.querySelector('meta[property="og:url"]');
  if (canonical) canonical.href = currentUrl;
  if (openGraphUrl) openGraphUrl.content = currentUrl;
}

// 使用 History API；server.py 为直接访问、刷新及新标签页提供路由回退。
// 兼容旧的 #home、#diary、#friends、#post/... 等链接。
function route() {
  const rawHash = location.hash.slice(1);
  const legacy = /^(?:(?:home|diary|journey|friends|projects)(?:\?|$)|(?:post|friend)\/)/i.test(rawHash)
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
  let view = "not-found";
  let post;
  let friendIndex = -1;

  if (!segments.length && ["", "index.html", "home"].includes(hash)) {
    view = "home";
  } else if (hash === "diary" && !segments.length) {
    view = "diary";
    const category = params.get("category") || "全部";
    selectedCategory = Array.from(filterButtons).some(button => button.dataset.filter === category) ? category : "全部";
    searchInput.value = params.get("q") || "";
    archivePage = params.get("page") || 1;
    updateFilters();
  } else if (hash === "friends" && !segments.length) {
    view = "friends";
  } else if (hash === "journey" && !segments.length) {
    view = "journey";
  } else if (hash === "projects" && !segments.length) {
    view = "projects";
  } else if (hash === "friend" && segments.length === 1) {
    friendIndex = friends.findIndex(friend => encodeURIComponent(friend.id) === id);
    view = friendIndex >= 0 ? "friend" : "not-found";
  } else if (hash === "post" && segments.length === 1) {
    post = getSortedDiaries().find(item => encodeURIComponent(item.id) === id);
    view = post ? "article" : "not-found";
  }

  viewNames.forEach(name => {
    document.getElementById(`${name}-view`).hidden = name !== view;
  });
  updateNavigation(view);

  if (view === "diary") renderArchive();
  if (view === "article") renderArticle(post, params.get("page") || 1);
  if (view === "friend") renderFriendProfile(friends[friendIndex]);
  if (view === "home") replaceAddress(anchor ? `/Home#${anchor}` : "/Home");
  if (view === "journey") replaceAddress("/Journey");
  if (view === "friends") replaceAddress("/Friends");
  if (view === "projects") replaceAddress("/Projects");
  if (view === "friend") replaceAddress(friendLink(friends[friendIndex]));

  const title = view === "article" ? post.title
    : view === "friend" ? `好友简介 · ${friends[friendIndex].name}`
    : view === "friends" ? "我的好友"
    : view === "journey" ? "成长轨迹"
    : view === "projects" ? "个人项目"
    : view === "diary" ? "全部日记"
    : view === "not-found" ? "404 · 页面没有找到" : "首页";
  document.title = title;
  updateCanonicalUrl();

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
  renderProjects();
  renderJourney(document.getElementById("timeline"), escapeHtml);
  renderJourneyPreview(document.getElementById("journey-preview"), escapeHtml);
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

