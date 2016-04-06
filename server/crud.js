"use strict"

const gcloud = require("gcloud");

function fromDatastore(obj) {
    obj.data.id = obj.key.id;
    return obj.data;
}

function toDatastore(obj, nonIndexed) {
    nonIndexed = nonIndexed || [];
    var results = [];
    Object.keys(obj).forEach(function(k) {
        if (obj[k] === undefined) { return; }
        results.push({
            name: k,
            value: obj[k],
            excludeFromIndexes: nonIndexed.indexOf(k) !== -1
        });
    });
    return results;
}

function update(id, data, ds, getKey) {
    const key = getKey(id);

    const entity = {
        key: key,
        data: toDatastore(data, ['description'])
    };

    return new Promise((resolve, reject) => {
        ds.save(
            entity,
            (err) => {
                if (err) {
                    reject(err)
                } else {
                    data.id = entity.key.id;
                    resolve(data);
                }
            }
        );
    });
}

function read(id, ds, getKey) {
    const key = getKey(id);
    return new Promise((resolve, reject) => {
        ds.get(key, (err, entity) => {
            if (err) {
                reject(err)
                return;
            }
            if (!entity) {
                reject({
                    code: 404,
                    message: 'Not found'
                });
                return;
            }
            resolve(fromDatastore(entity));
        });
    });
}

const createDs = (config) => (kind) => {
    const ds = gcloud.datastore.dataset(config);
    const getKey = (id) => id ? ds.key([kind, id]) : ds.key([kind]);

    return {
        create: (entity) => update(null, entity, ds, getKey),
        update: (entity) => update(entity.id, entity, ds, getKey),
        read: (id) => read(id, ds, getKey)
    }
}

module.exports = createDs;