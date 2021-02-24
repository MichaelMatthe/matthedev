var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "matthe.dev" });
});

router.get("/stillepost", function (req, res, next) {
    res.render("stillepost", { title: "matthe.dev" });
});

module.exports = router;
