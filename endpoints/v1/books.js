var wsRouter = require('../../services/web_socket_router.service');
var router = new wsRouter();

router.get("/", async function(req, res) {
    res.send(req);
});

module.exports = router;