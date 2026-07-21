"""
Servidor local de desarrollo para scrollfilm.
Sirve los archivos estáticos y reenvía /api/sonar al backend real de producción
(la Netlify Function ya desplegada) para poder probar SONAR de verdad en local.
Uso: python dev-proxy.py [puerto]
"""
import sys
import json
import urllib.request
from http.server import HTTPServer, SimpleHTTPRequestHandler

UPSTREAM = "https://zonot.netlify.app/api/sonar"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8902

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_POST(self):
        if self.path != "/api/sonar":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("content-length", 0))
        body = self.rfile.read(length)
        try:
            req = urllib.request.Request(
                UPSTREAM, data=body,
                headers={"content-type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                status = resp.status
        except urllib.error.HTTPError as e:
            data = e.read()
            status = e.code
        except Exception as e:
            data = json.dumps({"ok": False, "error": str(e)}).encode()
            status = 502
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("access-control-allow-origin", "*")
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print("[proxy]", fmt % args)

if __name__ == "__main__":
    print(f"Sirviendo en http://localhost:{PORT}  (proxy /api/sonar -> {UPSTREAM})")
    HTTPServer(("", PORT), Handler).serve_forever()
