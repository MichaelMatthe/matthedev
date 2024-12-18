var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "matthe.dev" });
});

router.get("/simplex", function (req, res, next) {
    res.render("simplexsketcher", { title: "matthe.dev" });
});

router.get("/game_of_life", function (req, res, next) {
    res.render("game_of_life", { title: "matthe.dev" });
});

module.exports = router;
