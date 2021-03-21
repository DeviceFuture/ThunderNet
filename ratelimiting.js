var config = require("./config");
var db = require("./db");

const RATE_LIMIT_QUOTA_INTERVAL = config.data.rateLimitQuotaInterval || 10 * 60 * 1000; // 10 minute intervals
const RATE_LIMIT_QUOTA_MAX_DATA = config.data.rateLimitQuotaMaxData || 32 * 1024 * 1024; // 32 MiB max
const RATE_LIMIT_WAIT_TIME = config.data.rateLimitWaitTime || 20 * 60 * 1000; // 20 minute intervals

/*
    Rationale behind default quota intervals and max data allowance:

    With a 32 MiB data limit, we expect that in a 10 minute interval, the user
    will have loaded 3.2 MiB per minute. Considering that the average size of a
    web page is around 2 MiB, this allows for 1.6 web pages to be visited in a
    span of a minute, or 1 web page for every 37.5 seconds.

    However, this is the worst-case scenario. ThunderNet ensures that web pages
    are cached which dramatically reduces the quota used.

    The wait time for when the rate limit is exceeded is a fair punishment for
    those who abuse ThunderNet. For normal users, so long as they have multiple
    endpoint profiles installed, they can contact other nodes instead through a
    fallback mechanism.
*/

function getTimeInterval() {
    return new Date().getTime() - (new Date().getTime() % RATE_LIMIT_QUOTA_INTERVAL);
}

exports.cleanQuota = function() {
    return new Promise(function(resolve, reject) {
        db.collections.rateLimitQuotas.remove({interval: {$lt: getTimeInterval()}}, {multi: true}, function(error) {
            if (error) {
                console.warn("Could not clean quota index:", error);
            }

            resolve();
        });
    });
};

exports.addToQuota = function(ip, dataUsed) {
    return new Promise(function(resolve, reject) {
        db.collections.rateLimitQuotas.findOne({ip}, function(error, doc) {
            if (error) {
                console.warn(`Could not add to quota for IP address ${ip}:`, error);
            }

            db.collections.rateLimitQuotas.update({ip}, {
                $set: {
                    interval: getTimeInterval(),
                    dataUsed: (doc != null && doc.interval == getTimeInterval() ? doc.dataUsed : 0) + dataUsed // Increment if in same time interval, otherwise set
                }
            }, {upsert: true, merge: true}, function(error) {
                if (error) {
                    console.warn(`Could not add to quota for IP address ${ip}:`, error);
                }

                exports.cleanQuota().then(resolve);
            });
        });
    });
};

exports.checkQuota = function(ip) {
    return new Promise(function(resolve, reject) { // Resolved when within quota limits, rejected if otherwise
        db.collections.rateLimitQuotas.findOne({ip}, function(error, doc) {
            if (error) {
                console.error(`Could not find quota information for IP ${ip}:`, error);

                reject(error);

                return;
            }

            if (doc == null) {
                resolve();

                return;
            }

            if (doc.restrictedUntil != null && doc.restrictedUntil > new Date().getTime()) {
                reject("Quota limit restrictions in place; wait for restrictions to relax");

                return;
            }

            if (doc.dataUsed > RATE_LIMIT_QUOTA_MAX_DATA && doc.interval == getTimeInterval()) {
                db.collections.rateLimitQuotas.update({ip}, {$set: {restrictedUntil: new Date().getTime() + RATE_LIMIT_WAIT_TIME}}, {merge: true}, function(error) {
                    if (error) {
                        console.warn(`Could not apply rate limit restriction to IP address ${ip}:`, error);
                    }

                    reject("Quota limit now exceeded; wait for restrictions to relax");
                });

                return;
            }

            resolve();
        });
    });
};