from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os


class HTMLHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__) or ".")
    host = "127.0.0.1"
    port = 8000

    server = ThreadingHTTPServer(
        (host, port),
        lambda *args, **kwargs: HTMLHandler(*args, directory=os.getcwd(), **kwargs),
    )

    print(f"Serving .html files at http://{host}:{port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        server.server_close()
