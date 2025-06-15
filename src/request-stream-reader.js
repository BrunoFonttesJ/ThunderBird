const {
    END_OF_HEADERS_LINE,
    HttpHeaders,
} = require('./configs')
const { parseHttpRequest } = require('./request-parser/request-parser')
class RequestStreamReader {
    constructor() {
        this.request = undefined
        this.buffer = ''
        this.bodyBuffer = ''
        this.contentLength = undefined
        this.stopDecodingBody = undefined
    }

    decode(chunkBytes) {
        const chunk = chunkBytes.toString()
        if (this.shouldDecodeBody()) {
            this.decodeBody(chunk, this.contentLength)
            return
        }
        if (this.shouldDecodeRequestLineAndHeaders(chunk)) {
            this.push(chunk);
            return
        }
        this.decodeEndOfHeadersChunk(chunk);
        this.request = parseHttpRequest(this.buffer)
        this.setContentLength(this.request.headers[HttpHeaders.CONTENT_LENGTH])
    }

    shouldDecodeRequestLineAndHeaders(chunk) {
        return this.request === null && !chunk.includes(END_OF_HEADERS_LINE)
    }
    shouldDecodeBody() {
        return this.request !== null && this.request.allowsBody && !this.stopDecodingBody
    }

    decodeEndOfHeadersChunk(chunk) {
        const [requestChunk, ...bodyChunk] = chunk.split(END_OF_HEADERS_LINE, 1);
        this.push(requestChunk);
        this.pushToBody(bodyChunk)
    }

    decodeBody(chunk, contentLength) {
        if (chunk.length + this.requestBuffer.bodyBuffer.length >= contentLength) {
            this.setStopDecodingBody(false)
        }
        this.requestBuffer.pushToBody(chunk)
    }

    push(chunk) {
        this.buffer += chunk
    }

    pushToBody(chunk) {
        this.bodyBuffer += chunk
    }

    setContentLength(contentLength) {
        if (this.contentLength === null) {
            this.contentLength = contentLength
        }
    }

    getContentLength() {
        return this.contentLength ?? 0
    }

    setStopDecodingBody(stopDecodingBody) {
        if (this.stopDecodingBody === null) {
            this.stopDecodingBody = stopDecodingBody
        }
    }
}

module.exports = { RequestStreamReader }