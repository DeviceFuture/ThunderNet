const subtle = require("crypto").webcrypto.subtle;

exports.generateKey = function() {
    return subtle.generateKey({
        name: "AES-CTR",
        length: 256
    }, true, ["encrypt", "decrypt"]).then(function(key) {
        return subtle.exportKey("jwk", key);
    });
};