"""保留原头像压缩入口；通用图片工具位于 tools/optimize_images.py。"""

import sys
from pathlib import Path

from tools.optimize_images import main


if __name__ == "__main__":
    avatar = Path(__file__).resolve().parent / "images" / "profile-avatar.png"
    main([str(avatar), *sys.argv[1:]])
