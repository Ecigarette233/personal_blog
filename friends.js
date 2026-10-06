// 好友目录：按此顺序显示；完整资料在每位好友独立的 JSON 文件中维护。
// 新增时创建 JSON 文件并添加对应的 id 和 file；两个文件中的 id 必须一致。
const friendDirectory = [
  {
    "id": "hlschoolgaozhongsheng",
    "file": "content/friends/hlschoolgaozhongsheng.json"
  },
  {
    "id": "JamesHarden",
    "file": "content/friends/JamesHarden.json"
  },
  {
    "id": "angel-chen",
    "file": "content/friends/angel-chen.json"
  },
  {
    "id": "Luguand77",
    "file": "content/friends/Luguand77.json"
  },
  {
    "id": "Diandaoweizhi",
    "file": "content/friends/Diandaoweizhi.json"
  },
  {
    "id": "CSH233",
    "file": "content/friends/CSH233.json"
  },
  {
    "id": "NIUZI",
    "file": "content/friends/NIUZI.json"
  },
  {
    "id": "yanger",
    "file": "content/friends/yanger.json"
  },
  {
    "id": "enbide",
    "file": "content/friends/enbide.json"
  },
  {
    "id": "giao",
    "file": "content/friends/giao.json"
  },
  {
    "id": "dcx",
    "file": "content/friends/dcx.json"
  }
];

// 由 content.js 填充，现有好友渲染组件继续读取同一个数组。
const friends = [];
