// 用途：维护个人项目数据。新增项目时复制一个对象即可，空的 github 或 demo 不会渲染链接。
// 项目按数组顺序展示；建议把当前最值得展示、仍在维护的项目放在前面。
const projects = [
  {
    id: "personal-digital-garden",
    name: "个人博客",
    description: "自行搭建并持续维护的个人数字花园，用来记录技术学习、项目实践与少量生活片段。",
    status: "持续维护",
    techStack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Git",
      "GitHub",
      "Linux",
      "Nginx",
      "DNS",
      "HTTPS",
      "SSH"
    ],
    highlights: [
      "自定义 History API 路由与前进、后退支持",
      "日记分类、搜索与分页阅读",
      "可维护的成长时间轴与内容数据文件",
      "Nginx SPA fallback、Git 部署与 HTTPS 配置"
    ],
    github: "https://github.com/Ecigarette233/personal_blog",
    demo: "/Home",
    date: "2026.10"
  }
];
