// 用途：存放好友资料；首页的“我的好友”模块会读取这里的数据并自动生成卡片。
// 新增好友：复制一个完整对象并修改内容，对象之间用逗号分隔。
// id 用于生成站内简介链接；avatar 是头像文字；url 可选，用于展示好友的个人主页。

const friends = [
  {
    id: "liu-jianxing",
    name: "刘健行",
    avatar: "LJX",
    description: "萎哥、QQ",
    bio: "高中睡友",
    url: " "
  },
  {
    id: "ha-deng",
    name: "哈邓",
    avatar: "DAT",
    description: "邓哥",
    bio: "哈登一生无冠，邓哥四年三冠",
    url: " "
  },
  {
    id: "chen-zijian",
    name: "陈梓健",
    avatar: "CZJ",
    description: "天使之翼",
    bio: "最近在健身，听说已经练出天使之翼",
    url: " "
  }
];
