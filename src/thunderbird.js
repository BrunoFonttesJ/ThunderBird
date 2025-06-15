const { RequestBodyStreamReader } = require('./request-body-stream-reader')

const { RequestStreamReader } = require('./request-stream-reader')
const net = require('node:net')


class ThunderBird {
    constructor(max_payload_size_in_bytes) {
        this.max_payload_size_in_bytes = max_payload_size_in_bytes
    }

    create() {
        const server = net.createServer(socket => {
            const requestStreamReader = new RequestStreamReader()
            let requestBodyStreamReader = undefined
            socket.on('data', (chunkBytes) => {
                requestStreamReader.decode(chunkBytes)
                if (requestStreamReader.request === undefined) {
                    return
                }
                if (requestStreamReader.request.allowsBody) {
                    requestBodyStreamReader = new RequestBodyStreamReader(chunkBytes)
                } else {
                    socket.write(this.mock_response());
                    socket.end();
                    return
                }

                if (!requestBodyStreamReader.shouldKeepDecoding) {
                    requestStreamReader.request.setBody(requestBodyStreamReader.buffer)
                    socket.write(this.mock_response());
                    socket.end()
                    return
                }
                requestBodyStreamReader.decode(chunkBytes)
            });

            socket.on('end', () => {
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