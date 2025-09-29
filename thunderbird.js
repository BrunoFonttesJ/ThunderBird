const { HttpRequest } = require('./src/http-parser/http-request')

const net = require('node:net')
const { TcpConnectionManager } = require('./tcp_connection_manager')

class ThunderBird {
    constructor(max_payload_size_in_bytes) {
        this.max_payload_size_in_bytes = max_payload_size_in_bytes
        this.getPaths = {

        }
    }

    create() {
        const connectionManager = new TcpConnectionManager()
        const server = net.createServer(socket => {
            const requestStreamReader = connectionManager.getRequestStreamReader(socket)
            socket.on('data', (chunkBytes) => {

                const maybeHttpRequest = requestStreamReader.decode(chunkBytes)
                if (maybeHttpRequest instanceof HttpRequest) {
                    const callback = this.getCallback(maybeHttpRequest.method, maybeHttpRequest.path)
                    if (callback) {
                        socket.write(callback());
                    } else {
                        socket.write(this.notFoundResponse())
                    }
                    socket.end();
                    return
                }
            });
            socket.on('end', () => {
                if (requestStreamReader.request.allowsBody() && !requestStreamReader.request.bodySizeIsEqualToContentLength()) {
                    console.log("body size is not the same as content length")
                }
                else {
                    console.log(requestStreamReader.request)
                }
                connectionManager.releaseSocket(socket)
                console.debug('client disconnected')
            })
            socket.on('error', (error) => {
                connectionManager.releaseSocket(socket)
                console.error('error: ', error)
            })
            socket.on('timeout', () => {
                console.debug('socket timeout')
                socket.end()
            })
        })

        server.on('error', (err) => {
            throw err;
        });

        return server
    }


    notFoundResponse() {
        const body = '<h1>Not Found</h1>'

        const response = 'HTTP/1.1 404 OK\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            `Content-Length: ${Buffer.byteLength(body)}\r\n` +
            'Connection: close\r\n' +
            '\r\n' +
            body
        return response
    }

    get(path, callback) {
        this.getPaths[path] = callback
    }

    getCallback(method, path) {
        if (method == "get") {
            return this.getPaths[path]
        }
    }
}

module.exports = { ThunderBird }