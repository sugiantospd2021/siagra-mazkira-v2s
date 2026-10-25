import http.server
import socketserver
import os

# Pindah ke folder script berada
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Kalau akses root URL, tampilkan cover.html
        if self.path == '/' or self.path == '':
            self.path = '/cover.html'
        return super().do_GET()

PORT = 8000

# Supaya bisa restart tanpa error "address already in use"
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print("=" * 50)
    print(f"✅ Server SIAGRA jalan di: http://localhost:{PORT}")
    print(f"📄 Halaman default: cover.html")
    print("=" * 50)
    print("Tekan Ctrl+C untuk stop server.")
    print()
    httpd.serve_forever()