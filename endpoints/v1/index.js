var wsRouter = require('../../services/web_socket_router.service');
var router = new wsRouter();

router.use("/books", require("./books.js"));

module.exports = router;