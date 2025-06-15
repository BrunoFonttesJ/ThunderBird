

const { HttpHeaders } = require("./configs");

function parseHeaders(headersLines, method) {
    const headers = {};
    for (const line of headersLines) {
        const [key, value] = line.split(": ");
        headers[key.toLowerCase()] = value;
    }

    validateHost(headers);

    if (!['post', 'put'].includes(method)) {
        return headers
    }
    if (!headers.includes(HttpHeaders.CONTENT_LENGTH)) {
        throw new Error('post and put methods require content-length header')
    }
    headers[HttpHeaders.CONTENT_LENGTH] = parseInt(headers[HttpHeaders.CONTENT_LENGTH])

    if (isNaN(headers[HttpHeaders.CONTENT_LENGTH])) {
        throw new Error('content-length must be numeric')
    }

    return headers;
}

function validateHost(headers) {
    if (headers[HttpHeaders.HOST] === undefined) {
        throw new Error(`Host is required`);
    }
    if (!isBaseUrl(headers[HttpHeaders.HOST])) {
        throw new Error(`Invalid Host ${headers[HttpHeaders.HOST]}`);
    }
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


module.exports = { parseHeaders }