// 用途：实现首页与日记页面切换、日记渲染、分类筛选、搜索和上一篇/下一篇导航。
// 依赖：diaries.js 和 friends.js 必须先加载；个人资料在 HTML 中修改。
// 本文件同时负责好友卡片渲染，以及日记筛选、搜索和文章导航。

// 页面元素与筛选状态。
const viewNames = ["home", "friend", "diary", "article"];
const navigationLinks = document.querySelectorAll("[data-nav]");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchInput = document.getElementById("search");
let selectedCategory = "全部";

// 日记内容作为文本展示，避免内容中的 HTML 被执行。
function escapeHtml(value) {
  const entities = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  };
  return String(value).replace(/[&<>"']/g, character => entities[character]);
}

function postLink(post) {
  return `#post/${encodeURIComponent(post.id)}`;
}

function friendLink(friend) {
  return `#friend/${encodeURIComponent(friend.id)}`;
}

function renderPostCard(post) {
  return `
    <a class="latest" href="${postLink(post)}">
      <div class="post-meta">
        <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
        <span class="tag">${escapeHtml(post.category)}</span>
      </div>
      <h3>${escapeHtml(post.title)} <span aria-hidden="true">↗</span></h3>
      <p>${escapeHtml(post.excerpt)}</p>
    </a>
  `;
}

// 首页与侧边栏共用同一份日记数据。
function renderRecentPosts() {
  const recentPosts = diaries.slice(0, 3);
  document.getElementById("side-posts").innerHTML = recentPosts.map(post => `
    <a class="side-post" href="${postLink(post)}">
      <time datetime="${escapeHtml(post.date)}">
        ${escapeHtml(post.date.replaceAll("-", "."))} / ${escapeHtml(post.category)}
      </time>
      <p>${escapeHtml(post.title)} ↗</p>
    </a>
  `).join("");

  document.getElementById("recent-posts").innerHTML = recentPosts
    .map(renderPostCard).join("");
}

// 好友卡片进入站内简介页，外部个人主页（若有）会在简介页中展示。
function renderFriends() {
  document.getElementById("friends-list").innerHTML = friends.map(friend => `
      <a class="friend-card" href="${friendLink(friend)}" aria-label="查看 ${escapeHtml(friend.name)} 的个人简介">
        <span class="friend-avatar" aria-hidden="true">${escapeHtml(friend.avatar)}</span>
        <div class="friend-info">
          <h3>${escapeHtml(friend.name)}</h3>
          <p>${escapeHtml(friend.description)}</p>
        </div>
        <span class="friend-status">查看简介 <span aria-hidden="true">↗</span></span>
      </a>
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

  document.getElementById("archive-posts").innerHTML = matches
    .map(renderPostCard).join("");
  const categoryLabel = selectedCategory === "全部" ? "" : ` · ${selectedCategory}`;
  document.getElementById("result-count").textContent =
    `共 ${matches.length} 篇日记${categoryLabel}`;
  document.getElementById("empty").hidden = matches.length !== 0;
}

function renderArticle(index) {
  const post = diaries[index];
  document.getElementById("article-title").textContent = post.title;
  document.getElementById("article-meta").innerHTML = `
    <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
    <span class="tag">${escapeHtml(post.category)}</span>
    <span>黄敏津</span>
  `;
  document.getElementById("article-body").innerHTML = post.body
    .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("");

  const previousLink = index > 0
    ? `<a href="${postLink(diaries[index - 1])}">← 上一篇</a>`
    : "<span></span>";
  const nextLink = index < diaries.length - 1
    ? `<a href="${postLink(diaries[index + 1])}">下一篇 →</a>`
    : "<span></span>";
  document.getElementById("article-nav").innerHTML = previousLink + nextLink;
}

function updateNavigation(view, hash) {
  const isDiaryView = view === "diary" || view === "article";
  const activeNavigation = isDiaryView
    ? "diary"
    : (view === "home" && hash === "about" ? "about" : "home");

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

// 使用 URL hash 切换页面，直接打开 HTML 时也支持前进、后退和文章链接。
function route() {
  const hash = location.hash.slice(1);
  let view = "home";
  let postIndex = -1;
  let friendIndex = -1;

  if (hash === "diary") {
    view = "diary";
  } else if (hash.startsWith("friend/")) {
    friendIndex = friends.findIndex(friend => friendLink(friend).slice(1) === hash);
    view = friendIndex >= 0 ? "friend" : "home";
  } else if (hash.startsWith("post/")) {
    postIndex = diaries.findIndex(post => postLink(post).slice(1) === hash);
    view = postIndex >= 0 ? "article" : "diary";
  }

  viewNames.forEach(name => {
    document.getElementById(`${name}-view`).hidden = name !== view;
  });
  updateNavigation(view, hash);

  if (view === "diary") renderArchive();
  if (view === "article") renderArticle(postIndex);
  if (view === "friend") renderFriendProfile(friends[friendIndex]);

  const title = view === "article" ? diaries[postIndex].title
    : view === "friend" ? `${friends[friendIndex].name} · 好友简介`
    : view === "diary" ? "全部日记" : "个人博客";
  document.title = `${title} · 黄敏津`;

  if (hash === "about") {
    document.getElementById("about").scrollIntoView();
  } else if (hash === "friends") {
    document.getElementById("friends").scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

function initialize() {
  renderRecentPosts();
  renderFriends();
  document.getElementById("year").textContent = new Date().getFullYear();

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.filter;
      filterButtons.forEach(filter => {
        const active = filter === button;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
      renderArchive();
    });
  });

  searchInput.addEventListener("input", renderArchive);
  window.addEventListener("hashchange", route);
  route();
}

initialize();

