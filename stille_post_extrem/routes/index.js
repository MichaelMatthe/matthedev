var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "matthe.dev" });
});

router.get("/orbiting", function (req, res, next) {
    res.render("orbiting", { title: "matthe.dev" });
});

router.get("*", function (req, res, next) {
    res.render("404", { title: "matthe.dev" });
});

module.exports = router;
