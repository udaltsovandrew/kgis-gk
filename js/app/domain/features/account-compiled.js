/**
 * Created by udaltsov on 30.10.15.
 */
"use strict";

define(["./js/app/dataAccess/model-compiled.js", "./js/app/domain/generators-compiled.js"], function (model, generators) {

    var context = new model({ url: "", className: "", map: map });

    var proto = {
        base: {
            className: "Account"
        },
        chields: []
    };

    function create(point) {
        var feature = generators.Account.default;
        feature.geometry = point;
        return db.Account.add(feature).then(function (data) {
            var id = data[0][0].objectId;
            return db.Account.getById(id);
        });
    }

    function read(id) {
        return db.Account.getById(id);
    }

    function update(data) {}

    function del(id) {
        return db.Account.delById(id);
    }

    function all(id) {
        return db.Account.get({ where: "1=1" });
    }

    return {
        proto: proto,
        create: create,
        read: read,
        update: update,
        del: del,
        all: all
    };
});

//# sourceMappingURL=account-compiled.js.map