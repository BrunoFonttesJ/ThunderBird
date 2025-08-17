const { ThunderBird } = require('./thunderbird')

const PORT = 3000

const thunderbird = new ThunderBird(max_payload_size_in_bytes = 1024)

const app = thunderbird.create()

app.listen(PORT, () => {
    console.info(`server bound at port ${PORT}`);
});

function mock_response() {
    const body = '<h1>Hello from raw HTTP server</h1>'

    const response = 'HTTP/1.1 200 OK\r\n' +
        'Content-Type: text/html; charset=UTF-8\r\n' +
        `Content-Length: ${Buffer.byteLength(body)}\r\n` +
        'Connection: close\r\n' +
        '\r\n' +
        body
    return response
}

thunderbird.get('/', mock_response)


