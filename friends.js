// 用途：存放好友资料；好友列表与好友详情页共用这里的数据，自动生成卡片。
//
// ══ 好友详情页模板：所有好友共用同一套版式，只改数据，不用改代码 ═══════════
// 新增好友：复制下面任意一个完整对象，粘贴进 friends 数组，对象之间用逗号分隔。
//
// 【必填】
//   id            唯一标识，用于生成 /Friend/{id} 链接
//   name          姓名
//
// 【身份卡：头像 + 姓名 + 副标题】
//   avatar        没有 photo 时显示的紫色首字母头像文字，如 "Q"、"🐮"
//   description   副标题，一句话身份，如 "篮球队长"
//   identity      可选；填了就替代 description 作为副标题
//   photo         可选；填了照片路径后照片本身就是头像（120×140 圆角矩形），
//                 不再显示紫色首字母；留空或加载失败会自动回退到 avatar
//   photoPosition 可选；照片裁切位置，如 "center 35%"
//
// 【介绍卡：关系标签 + 正文】
//   tags          可选；关系标签数组，如 ["初中同学", "大学同学"]。
//                 凡是"和某人是什么关系"的说明都写进这里，不要再写进 bio
//   bio           可选；正文，字符串或字符串数组，每一项显示为一段
//   content       可选；结构化正文，支持 text / image / gallery / quote 四种块，
//                 存在有效块时优先于 bio
//
// 【想给某位好友加顶部背景照】照抄 Henlin 的 cover，版式与位置会自动和 Henlin 一致：
//   cover: {
//     src: "images/friends/xxx.jpg",
//     position: "center 10%",           // 桌面裁切位置
//     mobilePosition: "center center",  // 手机裁切位置
//     cardLeft: 32,                     // 身份卡距背景图左边多少像素（默认 32，不贴边）
//     cardBottom: -28                   // 身份卡底部偏移，负值 = 下悬出背景图
//   }
//   背景照铺在顶部，身份卡悬浮压在它左下方，介绍卡在下方与身份卡左对齐。
//   cardLeft 调大 = 身份卡往右移；调太大会盖住照片里的人，注意别越过人物的左边缘。
//
// 【想给某位好友旁边加人物立绘（库里、哈登这类）】照抄牛子这两行：
//   characterImage: "images/friends/xxx.png",   // 已抠图的透明 PNG/WebP
//   characterOptions: { scale: 1.3, right: 0, bottom: 0, footOffset: 3.8, mobileScale: 1 }
//   scale       桌面缩放；right 距右侧百分比；bottom 底部像素偏移；
//   footOffset  原图脚下透明留白百分比（向下补偿）；mobileScale 手机端缩放。
//   版式会自动把右侧让给立绘，信息卡收在左侧。
//
// photo / cover / characterImage / tags 可以任意组合，位置都已按同一套模板预留好。
//
// 【其他】
//   url           可选；好友的个人主页，填了才显示入口
//   showOnHome    true 表示首页展示，最多按数组顺序取前 3 位
// ════════════════════════════════════════════════════════════════════════

const friends = [
  {
    id: "hlschoolgaozhongsheng",
    showOnHome: true,
    name: "萎哥",
    avatar: "Q",
    photo: "images/friends/ljx.jpg",
    description: "QQ、萎",
    tags: ["高中同学", "高中睡友"],
    bio: [
      "黎明杀机最佳军团代言人",
      "三角洲从不玩突击位之人",
      "大山中学zfh最享福之人",
      "排球的伙伴，篮球的浓眉"
    ],
    content: [
      { type: "text", text: "黎明杀机最佳军团代言人" },
      { type: "text", text: "三角洲从不玩突击位之人" },
      { type: "text", text: "大山中学zfh最享福之人" },
      { type: "text", text: "排球的伙伴，篮球的浓眉" }
    ],
    url: " "
  },
  {
    id: "JamesHarden",
    showOnHome: false,
    name: "哈邓",
    avatar: "H",
    photo: "",
    description: "邓哥、哈邓",
    tags: [ "高中同学"],
    bio: [
      "错哥，我们登了",
      "hytDADDY",
    ],
    url: " "
  },
  {
    id: "angel-chen",
    showOnHome: true,
    name: "Harrisang",
    avatar: "HRS",
    photo: "images/friends/czj.jpg",
    description: "天使之翼",
    tags: [ "高中同学"],
    bio: [
      "天使之翼降临，凡人恐惧我吧",
      "鬼背、鬼脑",
      "动辄舔狗、三班最爱动辄之人",
      "成都必吃榜top1",
      "北境之王(不打球版)",
      "欧内之手",
      "最爱东北搓澡之人",
      "ChatCZJ、百万token消耗一包压缩饼干",
    ],
    url: " "
  },
  {
    id: "Luguand77",
    showOnHome: false,
    name: "动辄",
    avatar: "DZ",
    photo: "",
    description: "东京开墓尸",
    tags: [ "高中同学"],
    bio: [
      "Harrisang必玩榜top1",
      "最尊重老詹之人",
      "卢卡东契奇Mini版",
      "自述打球像卢卡东77",
    ],
    url: " "
  },
  {
    id: "Diandaoweizhi",
    showOnHome: true,
    name: "牢八",
    avatar: "8",
    photo: "images/friends/fhm.jpg",
    photoPosition: "center 35%",
    description: "牢八",
    tags: ["初中同学", "大学同学"],
    bio: [
      "网络空间安全专业",
      "深圳压抑榜top1",
      "老詹粉丝",
      "曾经的湖蜜"

    ],
    url: " "
  },
  {
    id: "CSH233",
    showOnHome: false,
    name: "Henlin",
    avatar: "H",
    photo: "images/friends/csh.jpg",
    cover: {
      src: "images/friends/csh.jpg",
      position: "center 10%",
      mobilePosition: "center center",
      cardLeft: 32,
      cardBottom: -28
    },
    description: "大内哥",
    tags: ["初中同学"],
    bio: [
      "香港人、非洲黑人",
      "CS2历史第一指挥兼狙击手",
      "最佳CS2上分搭档",
      "雅思口语7.5",
      "纯血外国人",
      "香港全额奖学金",
      "上过电视",
    ],
    url: " "
  },
  {
    id: "NIUZI",
    showOnHome: false,
    name: "牛子",
    avatar: "🐮",
    photo: "",
    description: "篮球队长",
    tags: ["小学同学", "初中同学", "大学同学"],
    characterImage: "images/friends/niuzi-harden-character.png",
    characterOptions: { scale: 1.3, right: 0, bottom: 0, footOffset: 3.8, mobileScale: 1 },
    bio: [
      "Favourite player : James Harden",
      "院队小前锋",
      "2018年常规赛MVP",
      "得分王、助攻王、最佳第六人",
      "打爆虎扑奖",
      "五年抗勇奖",
      "NBA孔子奖",
      "费城大庆典",
      "错哥，我们登了"
    ],
    url: " "
  },
  {
    id: "yanger",
    showOnHome: false,
    name: "yanger",
    avatar: "yan",
    photo: "",
    description: "",
    tags: ["高中同学"],
    characterImage: "",
    bio: [
      "",
    ],
    url: " "
  },
  {
    id: "enbide",
    showOnHome: false,
    name: "chenxin",
    avatar: "chen",
    photo: "",
    description: "大帝",
    tags: ["高中同学"],
    characterImage: "",
    bio: [
      "石头人",
    ],
    url: " "
  },
  {
    id: "giao",
    showOnHome: false,
    name: "Agiao",
    avatar: "giao",
    photo: "",
    description: "",
    tags: ["初中同学"],
    characterImage: "",
    bio: [
      "",
    ],
    url: " "
  },
  {
    id: "dcx",
    showOnHome: false,
    name: "dcx",
    avatar: "💩",
    photo: "",
    description: "",
    tags: ["初中同学"],
    characterImage: "",
    bio: [
      "go转洲转瓦",
    ],
    url: " "
  },
];

  // {
  //   id: "",
  //   showOnHome: false,
  //   name: "",
  //   avatar: "",
  //   photo: "",
  //   description: "",
  //   tags: [""],
  //   characterImage: "",
  //   bio: [
  //     "",
  //   ],
  //   url: " "
  // }