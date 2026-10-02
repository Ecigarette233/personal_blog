// 用途：存放好友资料；首页的“我的好友”模块会读取这里的数据并自动生成卡片。
// 新增好友：复制一个完整对象并修改内容，对象之间用逗号分隔。
// avatar 填写头像中的文字；url 留空时显示“主页待补充”，填写完整网址后卡片可点击。

const friends = [
  {
    name: "刘健行",
    avatar: "LJX",
    description: "高中睡友",
    url: " "
  },
  {
    name: "哈邓",
    avatar: "DAT",
    description: "画廊大庆典",
    url: " "
  },
  {
    name: "陈梓健",
    avatar: "CZJ",
    description: "天使之翼降临人间",
    url: " "
  }
];
