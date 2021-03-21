const path = require("path");
const os = require("os");
const Datastore = require("nedb");

var config = require("./config");

const DB_ROOT_PATH = config.data.dbRoot || path.join(os.homedir(), ".config", "thundernet", "db");
const ENDPOINT_PROFILES_COLLECTION_PATH = path.join(DB_ROOT_PATH, "ep.db");
const RESOURCE_CACHE_COLLECTION_PATH = path.join(DB_ROOT_PATH, "cache.db");
const RATE_LIMIT_QUOTAS_COLLECTION_PATH = path.join(DB_ROOT_PATH, "ratelimit.db");

exports.collections = {};

exports.collections.endpointProfiles = new Datastore({
    "filename": ENDPOINT_PROFILES_COLLECTION_PATH
});

exports.collections.resourceCache = new Datastore({
    "filename": RESOURCE_CACHE_COLLECTION_PATH
});

exports.collections.rateLimitQuotas = new Datastore({
    "filename": RATE_LIMIT_QUOTAS_COLLECTION_PATH
});

exports.collections.endpointProfiles.persistence.setAutocompactionInterval(60 * 60 * 1000); // Every hour
exports.collections.endpointProfiles.loadDatabase();

exports.collections.resourceCache.persistence.setAutocompactionInterval(10 * 60 * 1000); // Every 10 minutes
exports.collections.resourceCache.loadDatabase();

exports.collections.rateLimitQuotas.persistence.setAutocompactionInterval(10 * 60 * 1000); // Every 10 minutes
exports.collections.rateLimitQuotas.loadDatabase();