const { HttpRequest } = require("../http-request");

const { parseRequestLine } = require("./request-line-parser");


function parseHttpRequest(data) {
    const [requestLine, ...headersAndBody] = data.split('\r\n');
    if (!requestLine) return

    const { method, path, httpVersion } = parseRequestLine(requestLine)

    const headers = parseHeaders(headersAndBody);

    return new HttpRequest(
        method, path, httpVersion, headers,
    )
}

module.exports = { parseHttpRequest }