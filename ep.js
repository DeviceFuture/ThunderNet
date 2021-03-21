/*
    This code is responsible for managing endpoint profiles

    For more information, see: https://github.com/DeviceFuture/spec/blob/main/0001-0999/0002-thundernet-api.md
*/

var config = require("./config");
var encryption = require("./encryption");
var db = require("./db");
var tools = require("./tools");

exports.generateEpid = function() {
    return tools.generateKey(16);
};

exports.createNew = function() {
    return encryption.generateKey().then(function(jwk) {
        var epObject = {
            id: exports.generateEpid(),
            jwk: jwk,
            hosts: config.data.hosts || []
        };

        db.collections.endpointProfiles.insert({
            _id: epObject.id,
            jwk: epObject.jwk
        });

        return epObject;
    });
};

exports.getJwkFromEpid = function(epid) {
    return new Promise(function(resolve, reject) {
        db.collections.endpointProfiles.findOne({_id: epid}, function(error, doc) {
            if (error) {
                reject(error);

                return;
            }

            if (doc == null) {
                reject(`Cannot get JWK from EPID ${epid}: EPID doesn't exist`);

                return;
            }

            resolve(doc.jwk);
        });
    });
};

exports.encryptUsingEpid = function(data, epid) {
    return exports.getJwkFromEpid(epid).then(function(jwk) {
        return encryption.encrypt(data, jwk);
    });
};