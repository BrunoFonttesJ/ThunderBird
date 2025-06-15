const { END_OF_HEADERS_LINE } = require('./configs')
class RequestBodyStreamReader {
    constructor(endOfHeadersChunk) {
        this.buffer = ''
        this.contentLength = undefined
        this.shouldKeepDecoding = true
        this.decodeEndOfHeadersChunk(endOfHeadersChunk)
    }

    decodeEndOfHeadersChunk(chunk) {
        const [_, ...bodyChunk] = chunk.split(END_OF_HEADERS_LINE, 1);
        this.push(bodyChunk);
    }

    decode(chunk, contentLength) {
        if (chunk.length + this.requestBuffer.bodyBuffer.length >= contentLength) {
            this.shouldKeepDecoding = false
        }
        this.requestBuffer.pushToBody(chunk)
    }

    push(chunk) {
        this.buffer += chunk
        this.buffer.slice(0, this.contentLength);
    }
}

module.exports = { RequestBodyStreamReader }