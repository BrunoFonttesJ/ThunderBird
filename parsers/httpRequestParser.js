const HTTP_METHODS = new Set(
    ["get", "post", "put", "delete"]
)
const HTTP_VERSIONS = new Set(['HTTP/1.1'])

function parseHttpRequest(data) {
    const [requestLine, ...headersAndBody] = data.split('\r\n');
    if (!requestLine) return

    const { method, path, httpVersion } = parseRequestLine(requestLine)

    const headers = parseHeaders(headersAndBody);

    return {
        method, path, httpVersion, headers
    }
}

function parseRequestLine(requestLine) {
    const [method, path, httpVersion] = requestLine.split(' ');

    validateHttpVersion(httpVersion)
    validateHttpMethod(method)
    validatePathQuery(path)
    return {
        method, path, httpVersion
    }
}

function validateHost(headers) {
    if (headers["Host"] === undefined) {
        throw new Error(`Host is required`);
    }
    if (!isBaseUrl(headers["Host"])) {
        throw new Error(`Invalid Host ${headers["Host"]}`);
    }
}

function validateHttpMethod(str) {
    if (!HTTP_METHODS.has(str.trim().toLowerCase())) {
        throw new Error(`unknown method ${str}`)

    }
}

function validateHttpVersion(str) {
    if (!HTTP_VERSIONS.has(str)) {
        throw new Error(`invalid http version. Supported versions are:${HTTP_VERSIONS}`)
    }
}

function validatePathQuery(str) {
    const pattern = new RegExp(
        '^' +
        '(\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*)?' +  // optional path and query
        '$'
    );
    if (!pattern.test(str)) {
        throw Error(`invalid path ${str}`)
    };
}

function isBaseUrl(str) {
    const domainPattern = '|([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}'
    const ipv4Pattern = '|\\d{1,3}(\\.\\d{1,3}){3}'
    const portPattern = '(:\\d+)'
    const localhostPattern = 'localhost'
    const protocolPattern = '(https?:\\/\\/)'

    const pattern = new RegExp(
        '^' +
        `${protocolPattern}?` +
        `(${localhostPattern}${domainPattern}${ipv4Pattern})` +
        `${portPattern}?` +
        '$'
    );
    return pattern.test(str);
}
function parseHeaders(headers, method) {
    const headers = {};
    for (const line of headers) {
        const [key, value] = line.split(": ");
        headers[key.toLowerCase()] = value;
    }

    validateHost(headers);

    if (!['post', 'put'].includes(method)) {
        return
    }
    if (!headers.includes('content-length')) {
        throw new Error('post and put methods require content-length header')
    }
    headers['content-length'] = parseInt(headers['content-length'])
    
    if (isNaN(headers['content-length'])) {
        throw new Error('content-length must be numeric')
    }

    return headers;
}

module.exports = { parseHttpRequest }