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

function friendMediaSource(value) {
  if (typeof value !== "string") return "";
  const source = value.trim();
  return /^(?:javascript|data):/i.test(source) ? "" : source;
}

function createFriendImage(source, alt, options = {}) {
  const safeSource = friendMediaSource(source);
  if (!safeSource) return null;
  const image = document.createElement("img");
  image.alt = typeof alt === "string" ? alt : "";
  image.decoding = "async";
  if (options.lazy !== false) image.loading = "lazy";
  if (Number.isFinite(options.width)) image.width = options.width;
  if (Number.isFinite(options.height)) image.height = options.height;
  if (typeof options.position === "string" && options.position.trim()) {
    image.style.objectPosition = options.position.trim();
  }
  image.src = safeSource;
  return image;
}

function createFriendContentBlock(block) {
  if (!block || typeof block !== "object") return null;
  const type = typeof block.type === "string" ? block.type.toLowerCase() : "";
  if (type === "text" && typeof block.text === "string" && block.text.trim()) {
    const paragraph = document.createElement("p");
    paragraph.className = "friend-content-text";
    paragraph.textContent = block.text.trim();
    return paragraph;
  }
  if (type === "quote" && typeof block.text === "string" && block.text.trim()) {
    const quote = document.createElement("blockquote");
    quote.className = "friend-content-quote";
    const paragraph = document.createElement("p");
    paragraph.textContent = block.text.trim();
    quote.append(paragraph);
    return quote;
  }
  if (type === "image") {
    const figure = document.createElement("figure");
    figure.className = "friend-content-image";
    const image = createFriendImage(block.src, block.alt, {
      width: Number(block.width),
      height: Number(block.height),
      position: block.position
    });
    if (!image) return null;
    image.onerror = () => figure.remove();
    figure.append(image);
    if (typeof block.caption === "string" && block.caption.trim()) {
      const caption = document.createElement("figcaption");
      caption.textContent = block.caption.trim();
      figure.append(caption);
    }
    return figure;
  }
  if (type === "gallery" && Array.isArray(block.images)) {
    const gallery = document.createElement("div");
    gallery.className = "friend-content-gallery";
    gallery.setAttribute("role", "group");
    gallery.setAttribute("aria-label", "好友照片集");
    block.images.forEach(item => {
      if (!item || typeof item !== "object") return;
      const figure = document.createElement("figure");
      const image = createFriendImage(item.src, item.alt, {
        width: Number(item.width),
        height: Number(item.height),
        position: item.position
      });
      if (!image) return;
      image.onerror = () => {
        figure.remove();
        if (!gallery.children.length) gallery.remove();
      };
      figure.append(image);
      if (typeof item.caption === "string" && item.caption.trim()) {
        const caption = document.createElement("figcaption");
        caption.textContent = item.caption.trim();
        figure.append(caption);
      }
      gallery.append(figure);
    });
    return gallery.children.length ? gallery : null;
  }
  return null;
}

function renderFriendContent(friend, container) {
  const contentBlocks = Array.isArray(friend.content)
    ? friend.content.map(createFriendContentBlock).filter(Boolean)
    : [];
  if (contentBlocks.length) {
    container.replaceChildren(...contentBlocks);
    return;
  }
  // 旧数据继续支持单个字符串或字符串数组。
  const bioParagraphs = Array.isArray(friend.bio) ? friend.bio : [friend.bio];
  container.replaceChildren(...bioParagraphs
    .filter(paragraph => typeof paragraph === "string" && paragraph.trim())
    .map(paragraph => {
      const element = document.createElement("p");
      element.textContent = paragraph.trim();
      return element;
    }));
}

// 同一个人物图组件用于所有好友，位置参数只接受有限数值，切换页面时重置。
function renderFriendCharacter(friend, profile) {
  const container = document.getElementById("friend-character");
  const image = document.getElementById("friend-character-image");
  profile.classList.remove("has-character");
  container.hidden = true;
  image.onload = null;
  image.onerror = null;
  image.removeAttribute("src");
  const options = friend.characterOptions || {};
  const settings = [
    ["scale", 1, .5, 1.6, ""],
    ["right", 0, 0, 12, "%"],
    ["bottom", 0, -40, 80, "px"],
    ["footOffset", 0, 0, 15, "%"],
    ["mobileScale", 1, .6, 1.2, ""]
  ];
  settings.forEach(([key, fallback, min, max, unit]) => {
    const value = Number.isFinite(options[key]) ? Math.min(max, Math.max(min, options[key])) : fallback;
    profile.style.setProperty(`--character-${key}`, `${value}${unit}`);
  });
  const source = friendMediaSource(friend.characterImage);
  if (!source) return;
  image.onload = () => {
    if (profile.dataset.friendId !== friend.id) return;
    container.hidden = false;
    profile.classList.add("has-character");
  };
  image.onerror = () => {
    if (profile.dataset.friendId !== friend.id) return;
    container.hidden = true;
    profile.classList.remove("has-character");
    image.removeAttribute("src");
  };
  image.src = source;
}

// 复用一份详情模板；空字段不占位，旧 description、bio 与 content 数据继续兼容。
function renderFriendProfile(friend) {
  const profile = document.querySelector(".friend-profile");
  const profileHeader = document.querySelector(".friend-profile-header");
  const coverContainer = document.getElementById("friend-profile-cover");
  const avatarElement = document.getElementById("friend-profile-avatar");
  profile.dataset.friendId = friend.id;
  profile.classList.remove("has-cover");
  avatarElement.classList.remove("has-image");
  profileHeader.classList.remove("has-photo-avatar");
  coverContainer.replaceChildren();
  coverContainer.hidden = true;
  coverContainer.style.removeProperty("--cover-position");
  coverContainer.style.removeProperty("--cover-position-mobile");
  profile.style.removeProperty("--cover-card-left");
  profile.style.removeProperty("--cover-card-bottom");

  const fields = [
    ["friend-profile-avatar", friend.avatar],
    ["friend-profile-name", friend.name],
    ["friend-profile-description", friend.identity ?? friend.description]
  ];
  fields.forEach(([id, value]) => {
    const element = document.getElementById(id);
    element.textContent = typeof value === "string" ? value.trim() : "";
    element.hidden = !element.textContent;
  });
  profileHeader.classList.toggle("has-avatar", !avatarElement.hidden);
  const tags = document.getElementById("friend-profile-tags");
  tags.replaceChildren(...(Array.isArray(friend.tags) ? friend.tags : [])
    .filter(tag => typeof tag === "string" && tag.trim())
    .map(tag => {
      const item = document.createElement("li");
      item.textContent = tag.trim();
      return item;
    }));
  tags.hidden = !tags.children.length;
  const bio = document.getElementById("friend-profile-bio");
  renderFriendContent(friend, bio);
  // 关系标签和正文都在介绍卡里；两者都为空才隐藏整张卡，避免留下空玻璃卡。
  bio.hidden = !bio.children.length;
  document.getElementById("friend-profile-about").hidden = !bio.children.length && !tags.children.length;
  renderFriendCharacter(friend, profile);

  // 有具体照片时照片本身就是头像，删去紫色首字母头像；没有照片才回退到首字母。
  const renderFriendAvatar = () => {
    if (profile.dataset.friendId !== friend.id || profile.classList.contains("has-cover")) return;
    const photo = createFriendImage(friend.photo, `${friend.name}的头像`, {
      lazy: false,
      width: 176,
      height: 176,
      position: friend.photoPosition || "center"
    });
    if (!photo) return;
    const initial = avatarElement.textContent;
    photo.className = "friend-profile-avatar-image";
    photo.onerror = () => {
      if (photo.parentElement !== avatarElement) return;
      avatarElement.classList.remove("has-image");
      avatarElement.textContent = initial;
      avatarElement.hidden = !avatarElement.textContent;
      profileHeader.classList.remove("has-photo-avatar");
      profileHeader.classList.toggle("has-avatar", !avatarElement.hidden);
    };
    avatarElement.replaceChildren(photo);
    avatarElement.classList.add("has-image");
    avatarElement.hidden = false;
    profileHeader.classList.add("has-avatar", "has-photo-avatar");
  };

  const cover = friend.cover && typeof friend.cover === "object" ? friend.cover : null;
  const coverImage = cover && createFriendImage(cover.src, `${friend.name}的封面照片`, {
    lazy: false,
    width: 1200,
    height: 600
  });
  if (coverImage) {
    coverContainer.style.setProperty("--cover-position", cover.position || "center");
    coverContainer.style.setProperty("--cover-position-mobile", cover.mobilePosition || cover.position || "center");
    // 身份卡在背景图上的位置：cardLeft 为距背景图左边的像素（默认 32，不再贴边），
    // cardBottom 为底部偏移，负值等于下悬出背景图。两者都可按好友单独调。
    const clamp = (value, fallback, min, max) =>
      Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
    profile.style.setProperty("--cover-card-left", `${clamp(cover.cardLeft, 32, 0, 160)}px`);
    profile.style.setProperty("--cover-card-bottom", `${clamp(cover.cardBottom, -28, -60, 60)}px`);
    coverImage.onload = () => {
      if (profile.dataset.friendId !== friend.id || coverImage.parentElement !== coverContainer) return;
      coverContainer.hidden = false;
      profile.classList.add("has-cover");
    };
    coverImage.onerror = () => {
      if (coverImage.parentElement !== coverContainer) return;
      coverImage.remove();
      coverContainer.hidden = true;
      profile.classList.remove("has-cover");
      renderFriendAvatar();
    };
    coverContainer.append(coverImage);
  } else {
    renderFriendAvatar();
  }

  const homepage = document.getElementById("friend-homepage");
  const hasHomepage = typeof friend.url === "string" && friend.url.trim() !== "";
  homepage.hidden = !hasHomepage;
  if (hasHomepage) homepage.href = friend.url.trim();
  else homepage.removeAttribute("href");
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

