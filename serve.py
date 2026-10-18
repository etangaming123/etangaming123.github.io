#!/usr/bin/env python3
"""Temporary local static server for ts.net (Tailscale) hosting.

Usage: python3 serve.py [port]   (default 8080)
Then e.g.: tailscale serve --bg 8080   or   tailscale funnel 8080
"""
import functools
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # no caching while iterating
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


handler = functools.partial(Handler, directory=ROOT)

if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("0.0.0.0", PORT), handler) as httpd:
        print(f"Serving {ROOT} on http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nbye")
