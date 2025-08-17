
const HTTP_HEADERS = Object.freeze({
    CONTENT_LENGTH: "content-length",
    HOST: "host"
})


const MAX_CONTENT_LENGTH = 10000

class HttpHeaders {
    constructor(headers) {
        this.headers = headers
    }
    static create(headersLines, method) {
        const headers = {};
        for (const line of headersLines) {
            const [key, value] = line.split(": ");
            headers[key.toLowerCase()] = value;
        }

        HttpHeaders.validateHost(headers);


        if (!['post', 'put'].includes(method)) {
            return new HttpHeaders(headers);
        }

        headers[HTTP_HEADERS.CONTENT_LENGTH] = HttpHeaders.parseContentLength(headers);

        return new HttpHeaders(headers);
    }

    static parseContentLength(headers) {
        if (headers[HTTP_HEADERS.CONTENT_LENGTH] === undefined) {
            return
        }
        const contentLength = parseInt(headers[HTTP_HEADERS.CONTENT_LENGTH]);

        if (isNaN(headers[HTTP_HEADERS.CONTENT_LENGTH])) {
            throw new Error('content-length must be numeric');
        }

        return contentLength
    }

    static validateHost(headers) {
        if (headers[HTTP_HEADERS.HOST] === undefined) {
            throw new Error(`Host is required`);
        }
        if (!HttpHeaders.isBaseUrl(headers[HTTP_HEADERS.HOST])) {
            throw new Error(`Invalid Host ${headers[HTTP_HEADERS.HOST]}`);
        }
    }


    static isBaseUrl(str) {
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

    exceedMaxBodySizeLimit(chunkLength, bodyLength) {
        const contentLength = this.headers[HTTP_HEADERS.CONTENT_LENGTH] ?? MAX_CONTENT_LENGTH
        const totalBodySize = chunkLength + bodyLength
        return totalBodySize > contentLength
    }

    bodySizeIsEqualToContentLength(bodyLength) {
        const contentLength = this.headers[HTTP_HEADERS.CONTENT_LENGTH] ?? MAX_CONTENT_LENGTH
        return contentLength == bodyLength
    }
}


module.exports = { HttpHeaders, HTTP_HEADERS }