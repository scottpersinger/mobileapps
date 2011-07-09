import signal, os
import SimpleHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler
import SocketServer

PORT = 8000

class MyHandler(SimpleHTTPRequestHandler):
  def __init__(self, request, client_address, server):
    SimpleHTTPRequestHandler.__init__(self, request, client_address, server)
    
  def do_GET(s):
    print "Request for path " + s.path
    SimpleHTTPRequestHandler.do_GET(s)
    
    
Handler = MyHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

def handler(signum, frame):
  print "Interrupt"
  httpd.shutdown()
  exit()
  
signal.signal(signal.SIGINT, handler)

print "serving at port", PORT
httpd.serve_forever()
