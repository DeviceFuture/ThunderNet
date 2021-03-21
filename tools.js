exports.generateKey = function(length = 16, digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_") {
    var id = "";

    for (var i = 0; i < length; i++) {
        id += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return id;
};