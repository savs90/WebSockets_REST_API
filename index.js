const wsRouter = require("./services/web_socket_router.service");
const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: 7071 });

var router = new wsRouter();
var wsApi = require('./endpoints/versions.js');
router.use("/api", wsApi);

ws.on('connection', (socket) => {
    // Init recources if needed
    // ...
    socket.on('message', async (request) => {
        await router.execute(request, socket);
    });
    socket.on('close', (msg) => {
        // Clear recources if needed
    });
});