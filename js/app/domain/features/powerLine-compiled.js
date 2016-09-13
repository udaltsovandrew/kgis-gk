/**
 * Created by udaltsov on 30.10.15.
 */
"use strict";

define(["./js/app/dataAccess/model-compiled.js", "./js/app/domain/generators-compiled.js"], function (model, generators) {

  var context = new model({ url: "", className: "", map: map });

  var proto = {
    base: {
      className: "PowerLine"
    },
    connections: [{
      className: "VoltageLevel"
    }, {
      className: "Switch"
    }],
    links: [{
      className: "Structure"
    }, {
      className: "Switch"
    }]
  };

  function create(line) {
    var feature = generators.PowerLine.default;
    feature.geometry = line;
    return db.PowerLine.add(feature).then(function (data) {
      var id = data[0][0].objectId;
      return db.PowerLine.getById(id);
    });
  }

  function createDefault(line) {
    var feature = generators.PowerLine.default;
    feature.geometry = line;
    return db.PowerLine.add(feature);
  }

  function read(id) {
    return db.PowerLine.getById(id);
  }

  function update(data) {}

  function del(id) {
    return db.PowerLine.delById(id);
  }

  return {
    proto: proto,
    create: create,
    read: read,
    update: update,
    del: del,
    createDefault: createDefault
  };
});

//# sourceMappingURL=powerLine-compiled.js.map