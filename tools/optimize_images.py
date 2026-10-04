"""将博客图片按比例缩小为 WebP，保留原图。用法见 README。"""

import argparse
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps


def format_size(size):
    return f"{size / 1024 / 1024:.2f} MB" if size >= 1024 * 1024 else f"{size / 1024:.1f} KB"


def optimize_image(source, overwrite=False):
    source = Path(source).resolve()
    output = source.with_suffix(".webp")
    if source == output:
        raise ValueError("输入已经是 WebP，请使用原始 PNG/JPG，避免覆盖原图。")
    if output.exists() and not overwrite:
        raise FileExistsError(f"目标已存在：{output}；如需覆盖，请添加 --overwrite。")

    original_size = source.stat().st_size
    with Image.open(source) as original:
        # 根据拍摄方向旋转后再缩小；小图不会被放大。
        image = ImageOps.exif_transpose(original)
        image.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
        image = image.convert("RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB")
        buffer = BytesIO()
        image.save(buffer, "WEBP", quality=85, method=6)

    # 默认独占创建，避免检查后文件恰好出现时被意外覆盖。
    with output.open("wb" if overwrite else "xb") as target:
        target.write(buffer.getvalue())
    new_size = output.stat().st_size
    print(f"Input: {format_size(original_size)}")
    print(f"Output: {format_size(new_size)}")
    print(f"Reduced: {(1 - new_size / original_size) * 100:.1f}%")
    print(f"Saved: {output}")
    return output


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path, help="原始 PNG/JPG 等图片路径")
    parser.add_argument("--overwrite", action="store_true", help="允许覆盖同名 WebP（原图始终保留）")
    args = parser.parse_args(argv)
    try:
        optimize_image(args.image, args.overwrite)
    except (OSError, ValueError) as error:
        parser.exit(1, f"Error: {error}\n")


if __name__ == "__main__":
    main()
