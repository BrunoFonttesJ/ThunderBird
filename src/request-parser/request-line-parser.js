const HTTP_METHODS = new Set(
    ["get", "post", "put", "delete"]
)
const HTTP_VERSIONS = new Set(['HTTP/1.1'])

function parseRequestLine(requestLine) {
    const [method, path, httpVersion] = requestLine.split(' ');

    validateHttpVersion(httpVersion)
    validateHttpMethod(method)
    validatePathQuery(path)
    return {
        method, path, httpVersion
    }
}

function validateHttpVersion(str) {
    if (!HTTP_VERSIONS.has(str)) {
        throw new Error(`invalid http version. Supported versions are:${HTTP_VERSIONS}`)
    }
}

function validateHttpMethod(str) {
    if (!HTTP_METHODS.has(str.trim().toLowerCase())) {
        throw new Error(`unknown method ${str}`)
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

module.exports = { parseRequestLine }