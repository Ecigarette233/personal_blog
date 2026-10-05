// 用途：存放好友资料；首页与侧边栏“好友”入口的列表共用这里的数据，自动生成卡片。
// 新增好友：复制一个完整对象并修改内容，对象之间用逗号分隔。
// id 用于生成站内简介链接；avatar 是头像文字；url 可选，用于展示好友的个人主页。
// photo 可填写站点图片路径（如 images/friends/liu-jianxing.webp），在详情页名称右侧展示。
// 留空或图片加载失败时自动隐藏照片区域；photoPosition 可选（如 "center 30%"）以调整裁切位置。
// bio 可写成普通字符串；需要多段简介时，改为字符串数组，每一项会显示为独立段落。
// cover 可选，用于详情页横向封面；position 与 mobilePosition 分别控制桌面、手机构图。
// content 可选，支持 text、image、gallery、quote 四种块；存在有效块时优先于 bio 渲染。
// showOnHome: true 表示首页展示；false 或不填写表示只放在完整好友列表中。
// 首页最多显示 3 位；若选择超过 3 位，按此数组顺序显示前 3 位。调整对象顺序即可调整展示顺序。

const friends = [
  {
    id: "hlschoolgaozhongsheng",
    showOnHome: true,
    name: "萎哥",
    avatar: "Q",
    photo: "images/friends/ljx.jpg",
    description: "萎逼、QQ",
    bio: [
      "高中同学、高中睡友。",
      "黎明杀机最佳军团代言人",
      "三角洲从不玩突击位之人",
      "大山中学zfh最享福之人",
      "排球的伙伴，篮球的浓眉"
    ],
    content: [
      { type: "text", text: "高中同学、高中睡友。" },
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
    bio: [
      "最近在健身，听说已经练出天使之翼",
      "动辄舔狗"
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
    bio: "Harrisang必玩榜top1",
    url: " "
  },
  {
    id: "Diandaoweizhi",
    showOnHome: true,
    name: "牢八",
    avatar: "8",
    photo: "images/friends/fhm.jpg",
    photoPosition: "center 35%",
    description: "牢八、网安最后的深情",
    bio: "初中同学、大学同学",
    url: " "
  },
  {
    id: "CSH233",
    showOnHome: false,
    name: "Nigger",
    avatar: "N",
    photo: "images/friends/csh.jpg",
    cover: {
      src: "images/friends/csh.jpg",
      position: "center 10%",
      mobilePosition: "center center"
    },
    description: "大内哥",
    bio: "初中同学、香港人",
    url: " "
  },
  {
    id: "NIUZI",
    showOnHome: false,
    name: "牛子",
    avatar: "🐮",
    photo: "",
    description: "篮球队长",
    bio: "小学同学、初中同学、大学同学",
    url: " "
  }
];
