
const END_OF_HEADERS_LINE = '\r\n\r\n'

const HttpMethods = Object.freeze({
    GET: "get",
    POST: "post",
    PUT: "put",
    DELETE: "delete",
    PATCH: "patch",
});

const methodsThatAllowBody = new Set(HttpMethods.POST, HttpMethods.PUT, HttpMethods.PATCH)

const HttpHeaders = Object.freeze({
    CONTENT_LENGTH: "content-length",
    HOST: "host"
})

module.exports = {
    END_OF_HEADERS_LINE,
    HttpMethods,
    methodsThatAllowBody,
    HttpHeaders
}