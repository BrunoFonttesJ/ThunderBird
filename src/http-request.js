const { HttpHeaders } = require("./http-headers");


const HTTP_METHODS = Object.freeze({
    get: "get",
    post: "post",
    put: "put",
    delete: "delete",
    patch: "patch",
});


const METHODS_THAT_ALLOW_BODY = new Set([HTTP_METHODS.post, HTTP_METHODS.put, HTTP_METHODS.patch])

const HTTP_VERSIONS = new Set(['http/1.1'])


const PATH_QUERY_PATTERN = new RegExp(
    '^' +
    '(\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*)?' +  // optional path and query
    '$'
);

class HttpRequest {
    constructor(method, path, httpVersion, headers) {
        this.method = method
        this.path = path
        this.httpVersion = httpVersion

        this.headers = headers

        this.body = ''
    }

    static create(data) {
        const [requestLine, ...headersLines] = data.split('\r\n');
        if (!requestLine) return

        const { method, path, httpVersion } = HttpRequest.parseRequestLine(requestLine)

        const headers = HttpHeaders.create(headersLines, method)
        return new HttpRequest(method, path, httpVersion, headers)
    }

    static parseRequestLine(requestLine) {
        let [method, path, httpVersion] = requestLine.toLowerCase().split(' ');
        method = method.trim()
        path = path.trim()
        httpVersion = httpVersion.trim()

        if (!HTTP_VERSIONS.has(httpVersion)) {
            throw new Error(`invalid http version ${httpVersion}`)
        }
        if (!HTTP_METHODS.hasOwnProperty(method)) {
            throw new Error(`unknown method ${method}`)
        }
        if (!PATH_QUERY_PATTERN.test(path)) {
            throw Error(`invalid path ${path}`)
        };

        return {
            method, path, httpVersion
        }
    }


    shouldHaveBody() {
        return METHODS_THAT_ALLOW_BODY.has(this.method)
    }

    bodySizeIsEqualToContentLength() {
        return this.headers.bodySizeIsEqualToContentLength(this.body.length)
    }
    pushToBody(chunk) {
        if (!this.shouldHaveBody()) {
            throw new Error("should not have body")
        }
        if (this.headers.exceedMaxBodySizeLimit(chunk.length, this.body.length)) {
            throw new Error("content length exceeded")
        }
        this.body += chunk
        if (this.bodySizeIsEqualToContentLength()) {
            return 1
        }
    }
}

module.exports = { HttpRequest }