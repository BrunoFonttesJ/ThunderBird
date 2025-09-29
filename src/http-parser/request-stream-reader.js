const { HttpRequest } = require('./http-request')

const END_OF_HEADERS_LINE = '\r\n\r\n'

class RequestStreamReader {
    constructor() {
        this.request = undefined
        this.buffer = ''
    }

    decode(chunkBytes) {
        const chunk = chunkBytes.toString()
        if (this.request) {
            return this.request.pushToBody(bodyChunk)
        }

        const [requestChunk, bodyChunk] = chunk.split(END_OF_HEADERS_LINE);

        this.buffer += requestChunk

        const foundEndOfHeaders = requestChunk.length != chunk.length
        if (foundEndOfHeaders) {
            return this.decodeEndOfHeaderChunk(bodyChunk)
        }
    }

    decodeEndOfHeaderChunk(bodyChunk) {
        this.request = HttpRequest.create(this.buffer)

        if (bodyChunk) {
            return this.request.pushToBody(bodyChunk)
        }
        return this.request
    }
}

module.exports = { RequestStreamReader }