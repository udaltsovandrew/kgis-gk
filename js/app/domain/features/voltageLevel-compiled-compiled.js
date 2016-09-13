/**
 * Created by udaltsov on 30.10.15.
 */
"use strict";

define(["./js/app/dataAccess/model-compiled.js", "./js/app/domain/generators-compiled.js"], function (model, generators) {

  var context = new model({ url: "", className: "", map: map });

  var proto = {
    base: {
      className: "VoltageLevel"
    },
    parent: {
      className: "Substation"
    }
  };

  function create(parentId) {
    var substation = {};
    var voltageLevelId = null;
    return db.Substation.getById(parentId).then(function (data) {
      substation = context.first(data);
      var feature = generators.VoltageLevel.default;
      feature.geometry = substation.geometry;
      return db.VoltageLevel.add(feature);
    }).then(function (data) {
      voltageLevelId = context.getAdds(data)[0].objectId;
      var container = context.containerTemplate(parentId, voltageLevelId, "Substation", "VoltageLevel", substation.geometry);
      return db.EquipmentContainer.add(container);
    }).then(function () {
      return db.VoltageLevel.getById(voltageLevelId);
    });
  }

  function read(id) {
    return db.VoltageLevel.getById(id);
  }

  function update(data) {}

  function updateGeometry(data) {}

  function del(id) {
    return db.EquipmentContainer.get({ where: context.containerWhere("Substation", "VoltageLevel", null, id) }).then(function (data) {
      return db.EquipmentContainer.delById(context.key(context.first(data)));
    }).then(function () {
      return db.VoltageLevel.delById(id);
    });
  }

  return {
    proto: proto,
    create: create,
    read: read,
    update: update,
    del: del
  };
});

//# sourceMappingURL=voltageLevel-compiled.js.map

//# sourceMappingURL=voltageLevel-compiled-compiled.js.map