const path = require("path");
const os = require("os");
const Datastore = require("nedb");

const ENDPOINT_PROFILES_COLLECTION_PATH = path.join(os.homedir(), ".config", "thundernet", "db", "ep.db");

exports.collections = {};

exports.collections.endpointProfiles = new Datastore({
    "filename": ENDPOINT_PROFILES_COLLECTION_PATH
});

exports.collections.endpointProfiles.persistence.setAutocompactionInterval(60 * 60 * 1000); // Every hour
exports.collections.endpointProfiles.loadDatabase();