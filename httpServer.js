const { parseHttpRequest } = require('./parsers/httpRequestParser')
const net = require('node:net')

const PORT = 3000

const END_OF_HEADERS_LINE = '\r\n\r\n'

const server = net.createServer(socket => {
    let buffer = ''
    let isParsingBody = false
    let contentLength = 0
    socket.on('data', (chunk) => {
        strChunk = chunk.toString();
        if (!chunk.includes(END_OF_HEADERS_LINE)) {
            buffer += strChunk;
            if (isParsingBody) {

            }
        }

        [headerChunk, ...rest] = strChunk.split(END_OF_HEADERS_LINE)

        chunk += headerChunk

        const {
            method, path, httpVersion, headers
        } = parseHttpRequest(chunk)


        if (headers.includes('content-length')) {
            buffer = rest
            const contentLength = headers['content-length']
        }

        const body = '<h1>Hello from raw HTTP server</h1>';

        const response =
            'HTTP/1.1 200 OK\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            `Content-Length: ${Buffer.byteLength(body)}\r\n` +
            'Connection: close\r\n' +
            '\r\n' +
            body;

        socket.write(response);
        socket.end(); // close the socket *after* writing


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
server.listen(PORT, () => {
    console.info(`server bound at port ${PORT}`);
});