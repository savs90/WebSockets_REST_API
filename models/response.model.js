class Response {
    uri;
    method;
    socket;

    constructor(method, uri, socket) {
        this.method = method;
        this.uri = uri;
        this.socket = socket;
    }

    async send(response, status = 200) {
        await this.socket.send(JSON.stringify({
            "method": this.method,
            "uri": this.uri,
            "response": response,
            "status": status, 
            "timestamp": Date.now(),
        }));
    } 
}

module.exports = Response;