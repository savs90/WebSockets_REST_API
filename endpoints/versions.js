var wsRouter = require('../services/web_socket_router.service');
var router = new wsRouter();

router.use("/v1", require("./v1/index.js"));
router.use("/v2", require("./v2/index.js"));

module.exports = router;