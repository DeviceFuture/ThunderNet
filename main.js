#!/usr/bin/env node

var config = require("./config");
var state = require("./state");

config.init();
state.init();

var server = require("./server");

server.start(config.data.port);