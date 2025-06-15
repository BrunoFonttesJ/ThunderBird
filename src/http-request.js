const { methodsThatAllowBody, HttpHeaders } = require("./configs");
class HttpRequest {
    constructor(method, path, httpVersion, headers) {
        this.method = method
        this.path = path
        this.httpVersion = httpVersion
        this.headers = headers
        this.body = undefined

        this.allowsBody = this.validateIfAllowsBody()
    }
    validateIfAllowsBody() {
        const contentLength = this.headers[HttpHeaders.CONTENT_LENGTH]
        return methodsThatAllowBody.has(this.method) && contentLength !== undefined && contentLength > 0
    }

    setBody(body) {
        if (this.body === undefined) {
            this.body = body
        }
    }
}

module.exports = { HttpRequest }