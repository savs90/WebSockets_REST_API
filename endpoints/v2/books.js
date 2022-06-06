var wsRouter = require('../../services/web_socket_router.service');
var router = new wsRouter();

router.get("/", async function(req,res) {
    res.send(req);
});

router.get("/endpoint/:param", async function(req,res) {
    res.send(req);
});

router.get("/:isbn", async function(req,res) {
    res.send(req);
});

router.get('/:author/:publisher', async function (req,res) {
    res.send(req);
})

router.get('/:author/:publisher/:year/:stock', async function (req,res) {
    res.send(req);
})

router.post("/", async function(req,res) {
    res.send(req);
});

router.put("/:isbn", async function(req,res) {
    res.send(req);
});

router.delete("/:isbn", async function(req,res) {
    res.send(req);
});

module.exports = router;