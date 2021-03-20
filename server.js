// Implementation follows spec: https://github.com/DeviceFuture/spec/blob/main/0001-0999/0002-thundernet-api.md

const package = require("./package.json");
const os = require("os");
const express = require("express");

var config = require("./config");
var status = require("./status");
var ep = require("./ep");

const app = express();

const DEFAULT_PORT = 44444;
const API_LEVEL = 0;

function statusBlocked(res) {
    if (status.status != "active") {
        res.status(503).json({"error": "statusNotActive"});

        return true;
    }

    return false;
}

app.get("/", function(req, res) {
    res.redirect(config.data.defaultRedirect || "https://devicefuture.org");
});

app.get("/about", function(req, res) {
    res.json({
        "version": package.version,
        "apiLevel": API_LEVEL,
        "status": status.status,
        "info": !!config.data.about ? String(config.data.about).substring(0, 256) : undefined // Info string is limited to 256 chars to ensure performance
    });
});

app.get("/register", function(req, res) {
    ep.createNew().then(function(epObject) {
        res.json(epObject);
    });
});

exports.start = function(port = DEFAULT_PORT) {
    status.load();

    app.listen(port, function() {
        console.log(`Node server started: ${os.hostname()}:${port}`);
    });
};