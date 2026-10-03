"""Local blog preview with clean URL support. Run: python server.py"""

import argparse
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
ROUTE = re.compile(r"/(?:Home|Diary|Friends|Post/[^/]+|Friend/[^/]+)/?", re.IGNORECASE)


class BlogHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        original = self.path
        if ROUTE.fullmatch(urlsplit(self.path).path):
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
