"""Local blog preview with clean URL support. Run: python server.py"""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent


class BlogHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        original = self.path
        path = unquote(urlsplit(self.path).path)
        target = Path(self.translate_path(path))
        # 页面路径回退给前端显示对应页面或 404；缺失图片、脚本仍返回真正的 HTTP 404。
        is_page = not Path(path).suffix or path.lower().startswith(("/post/", "/friend/"))
        if not target.exists() and is_page:
            self.path = "/index.html"
        try:
            return super().send_head()
        finally:
            self.path = original

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    with ThreadingHTTPServer(("127.0.0.1", args.port), BlogHandler) as server:
        print(f"Blog preview: http://127.0.0.1:{args.port}/Home", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
