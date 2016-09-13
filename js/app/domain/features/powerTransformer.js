/**
 * Created by udaltsov on 30.10.15.
 */
"use strict";

define([
    "./js/app/dataAccess/model-compiled.js",
    "./js/app/domain/generators-compiled.js"
  ],
  function (model,
            generators) {

    var context = new model({url: "", className: "", map: map});

    var proto = {
      base: {
        className: "PowerTransformer"
      },
      parent: {
        className: "Substation"
      },
    };

    function create(parentId) {
      var substation = {};
      var powerTransformerId = null;
      return db.Substation.getById(parentId)
        .then(function (data) {
          substation = context.first(data);
          var feature = generators.PowerTransformer.default;
          feature.geometry = substation.geometry;
          return db.PowerTransformer.add(feature);
        })
        .then(function (data) {
          powerTransformerId = context.getAdds(data)[0].objectId;
          var container = context.containerTemplate(parentId, powerTransformerId, "Substation", "PowerTransformer", substation.geometry);
          return db.EquipmentContainer.add(container);
        })
        .then(function () {
          return db.PowerTransformer.getById(powerTransformerId)
        })
    }

    function read(id) {
      return db.PowerTransformer.getById(id);
    }

    function update(data) {

    }

    function del(id) {
      return db.EquipmentContainer
        .get({where: context.containerWhere("Substation", "PowerTransformer", null, id)})
        .then(function (data) {
          return db.EquipmentContainer.delById(context.key(context.first(data)))
        })
        .then(function () {
          return db.PowerTransformer.delById(id)
        })
    }

    return {
      proto: proto,
      create: create,
      read: read,
      update: update,
      del: del
    }
  });