const { RequestStreamReader } = require('./src/http-parser/request-stream-reader')
class TcpConnectionManager {
    constructor() {
        this.requestStreamReaders = {}
        this.freeSocketIds = []
        for(let i=0; i<10;i++){
            this.freeSocketIds.push(i)
        }
        this.lastSocketId = this.freeSocketIds[this.freeSocketIds.length-1]
    }

    getRequestStreamReader(socket) {
        const socketId = socket.id || this.setSocketIdAndReturn(socket)
        return this.getOrCreateRequestStreamReader(socketId)
    }


    setSocketIdAndReturn(socket) {
        let freeSocketId = this.freeSocketIds.pop()
        if (!freeSocketId) {
            this.lastSocketId += 1
            freeSocketId = this.lastSocketId
        }
        socket._id = freeSocketId
        return freeSocketId
    }

    getOrCreateRequestStreamReader(socketId) {
        if (!this.requestStreamReaders[socketId]) {
            this.requestStreamReaders[socketId] = new RequestStreamReader()
        }
        return this.requestStreamReaders[socketId]
    }

    deleteStreamReader(socketId) {
        if (socketId) {
            delete this.requestStreamReaders[socketId]
        }
    }
    releaseSocket(socket) {
        if (socket._id) {
            this.deleteStreamReader(socket._id)
            this.freeSocketIds.push(socket._id)
        }
    }
}

module.exports = { TcpConnectionManager }