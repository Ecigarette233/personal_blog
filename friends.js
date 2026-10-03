// 用途：存放好友资料；首页与侧边栏“好友”入口的列表共用这里的数据，自动生成卡片。
// 新增好友：复制一个完整对象并修改内容，对象之间用逗号分隔。
// id 用于生成站内简介链接；avatar 是头像文字；url 可选，用于展示好友的个人主页。
// showOnHome: true 表示首页展示；false 或不填写表示只放在完整好友列表中。
// 首页最多显示 3 位；若选择超过 3 位，按此数组顺序显示前 3 位。调整对象顺序即可调整展示顺序。

const friends = [
  {
    id: "liu-jianxing",
    showOnHome: true,
    name: "刘健行",
    avatar: "LJX",
    description: "萎哥、QQ",
    bio: "高中同学 高中睡友",
    url: " "
  },
  {
    id: "ha-deng",
    showOnHome: true,
    name: "邓安廷",
    avatar: "DAT",
    description: "邓哥、哈邓",
    bio: "哈登一生无冠，邓哥四年三冠",
    url: " "
  },
  {
    id: "chen-zijian",
    showOnHome: true,
    name: "陈梓健",
    avatar: "CZJ",
    description: "天使之翼",
    bio: "最近在健身，听说已经练出天使之翼",
    url: " "
  },
  {
    id: "dong-zhe",
    showOnHome: false,
    name: "董喆",
    avatar: "DZ",
    description: "东京开墓尸",
    bio: "陈梓健必玩榜top1",
    url: " "
  }
];
