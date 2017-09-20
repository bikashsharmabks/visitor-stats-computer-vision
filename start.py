import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.process
import tornado.template
import video
import gen
import os
import sys


cam = None
html_page_path = dir_path = os.path.dirname(os.path.realpath(__file__)) + '/www/'


class HtmlPageHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self, file_name='index.html'):
        # Check if page exists
        index_page = os.path.join(html_page_path, file_name)
        if os.path.exists(index_page):
            # Render it
            self.render('www/' + file_name)
        else:
            # Page not found, generate template
            err_tmpl = tornado.template.Template("<html> Err 404, Page {{ name }} not found</html>")
            err_html = err_tmpl.generate(name=file_name)
            # Send response
            self.finish(err_html)


class SetParamsHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def post(self):
        # print self.request.body
        # get args from POST request
        width = int(self.get_argument('width'))
        height = int(self.get_argument('height'))
        # try to change resolution
        try:
            cam.set_resolution(width, height)
            self.write({'resp': 'ok'})
        except:
            self.write({'resp': 'bad'})
            self.flush()
            self.finish()


class SocketHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print("WebSocket opened")
        cam.set_ws(self)

    def on_close(self):
        print("WebSocket closed")
            
class StreamHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        """
        functionality: generates GET response with mjpeg stream
        input: None
        :return: yields mjpeg stream with http header
        """
        # Set http header fields
        self.set_header('Cache-Control',
                         'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0')
        self.set_header('Connection', 'close')
        self.set_header('Content-Type', 'multipart/x-mixed-replace;boundary=--boundarydonotcross')

        while True:
            # Generating images for mjpeg stream and wraps them into http resp
            if self.get_argument('fd') == "true":
                img = cam.get_frame(True)
            else:
                img = cam.get_frame(False)
            self.write("--boundarydonotcross\n")
            self.write("Content-type: image/jpeg\r\n")
            self.write("Content-length: %s\r\n\r\n" % len(img))
            self.write(str(img))
            yield tornado.gen.Task(self.flush)


def make_app():
    # add handlers
    return tornado.web.Application([
        (r'/', HtmlPageHandler),
        (r'/ws', SocketHandler),
        (r'/video_feed', StreamHandler),
        (r'/setparams', SetParamsHandler),
        (r'/(?P<file_name>[^\/]+htm[l]?)+', HtmlPageHandler),
        (r'/(?:image)/(.*)', tornado.web.StaticFileHandler, {'path': './www/image'}),
        (r'/(?:css)/(.*)', tornado.web.StaticFileHandler, {'path': './www/css'}),
        (r'/(?:js)/(.*)', tornado.web.StaticFileHandler, {'path': './www/js'})
        ],
    )


if __name__ == "__main__":
    arg = sys.argv
    camId = 0
    if (len(sys.argv) > 1):
        camId = sys.argv[1]
        pass

    # creates camera
    cam = video.UsbCamera(camId)
    # bind server on 8080 port
    sockets = tornado.netutil.bind_sockets(8080)
    server = tornado.httpserver.HTTPServer(make_app())
    server.add_sockets(sockets)
    tornado.ioloop.IOLoop.current().start()
