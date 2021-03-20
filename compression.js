const lzma = require("lzma");

const COMPRESSION_LEVEL = 1;

exports.compress = function(data) {
    return new Promise(function(resolve, reject) {
        lzma.compress(data, COMPRESSION_LEVEL, function(result, error) {
            if (error) {
                reject("Unable to compress data");

                return;
            }

            resolve(result);
        });
    });
};

exports.decompress = function(data) {
    return new Promise(function(resolve, reject) {
        lzma.decompress(data, COMPRESSION_LEVEL, function(result, error) {
            if (error) {
                reject("Unable to decompress data");

                return;
            }

            resolve(result);
        });
    });
};