const { RequestStreamReader } = require('./src/http-parser/request-stream-reader')
const net = require('node:net')


class ThunderBird {
    constructor(max_payload_size_in_bytes) {
        this.max_payload_size_in_bytes = max_payload_size_in_bytes
    }

    create() {
        const server = net.createServer(socket => {
            const requestStreamReader = new RequestStreamReader()
            socket.on('data', (chunkBytes) => {
                if (requestStreamReader.decode(chunkBytes) == 1) {
                    socket.write(this.mock_response());
                    socket.end();
                    return
                }
            });
            socket.on('end', () => {
                if (requestStreamReader.request.shouldHaveBody() && !requestStreamReader.request.bodySizeIsEqualToContentLength()) {
                    console.log("body size is not the same as content length")
                }
                else {
                    console.log(requestStreamReader.request)
                }

                console.debug('client disconnected')
            })
            socket.on('error', (error) => {
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


    mock_response() {
        const body = '<h1>Hello from raw HTTP server</h1>'

        const response = 'HTTP/1.1 200 OK\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            `Content-Length: ${Buffer.byteLength(body)}\r\n` +
            'Connection: close\r\n' +
            '\r\n' +
            body
        return response
    }

}

module.exports = { ThunderBird }