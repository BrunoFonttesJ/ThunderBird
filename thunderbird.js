const { HttpRequest } = require('./src/http-parser/http-request')
const { RequestStreamReader } = require('./src/http-parser/request-stream-reader')
const net = require('node:net')

class ThunderBird {
    constructor(max_payload_size_in_bytes) {
        this.max_payload_size_in_bytes = max_payload_size_in_bytes
        this.getPaths = {

        }
    }

    create() {
        let maxConcurrentSocketId = 1
        const requestStreamReaders = {}

        const freeSocketIds = [maxConcurrentSocketId]

        const server = net.createServer(socket => {
            if (!socket._id) {
                let freeSocketId = freeSocketIds.pop()
                if (!freeSocketId) {
                    maxConcurrentSocketId += 1
                    freeSocketId = maxConcurrentSocketId
                }
                socket._id = freeSocketId
            }

            if (!requestStreamReaders[socket._id]) {
                requestStreamReaders[socket._id] = new RequestStreamReader()
            }
            socket.on('data', (chunkBytes) => {
                const requestStreamReader = requestStreamReaders[socket._id]
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
                const requestStreamReader = requestStreamReaders[socket._id]
                if (requestStreamReader.request.allowsBody() && !requestStreamReader.request.bodySizeIsEqualToContentLength()) {
                    console.log("body size is not the same as content length")
                }
                else {
                    console.log(requestStreamReader.request)
                }
                delete requestStreamReaders[socket._id]
                freeSocketIds.push(socket._id)

                console.debug('client disconnected')
            })
            socket.on('error', (error) => {
                delete requestStreamReaders[socket._id]
                freeSocketIds.push(socket._id)
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