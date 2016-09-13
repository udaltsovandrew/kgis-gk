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
        className: "Substation"
      },
      chields: [
        {
          className: "VoltageLevel"
        },
        {
          className: "PowerTransformer"
        },
        {
          className: "ErpAddress"
        }
      ]
    };

    function create(point) {
      var feature = generators.Substation.default;
      feature.geometry = point;
      return db.Substation
        .add(feature)
        .then(function (data) {
          var id = data[0][0].objectId;
          return db.Substation.getById(id);
        })
    }

    function createDefaultEquipment(id){
      var feature = null;
      var parentId = id;
      var voltageLevel10 = null;
      var voltageLevel04 = null;
      var container10 = null;
      var container04 = null;
      return read(id)
        .then(function(data){
           feature = context.first(data);
           voltageLevel10 = generators.VoltageLevel.U10;
           voltageLevel10.geometry = feature.geometry;
          return db.VoltageLevel.add(voltageLevel10);
        })
        .then(function(data){
          return db.VoltageLevel.getById(data[0][0].objectId);
        })
        .then(function(data){
          voltageLevel10 = context.first(data);
          voltageLevel04 = generators.VoltageLevel.U04;
          voltageLevel04.geometry = feature.geometry;
          return db.VoltageLevel.add(voltageLevel04);
        })
        .then(function(data){
          return db.VoltageLevel.getById(data[0][0].objectId);
        })
        .then(function(data){
          voltageLevel04 = context.first(data);
          container10 = context.containerTemplate(parentId, voltageLevel10.attributes["OBJECTID"],"Substation", "VoltageLevel", feature.geometry);
          return db.EquipmentContainer.add(container10);
        })
        .then(function(){
          container04 = context.containerTemplate(parentId, voltageLevel04.attributes["OBJECTID"],"Substation", "VoltageLevel", feature.geometry);
          return db.EquipmentContainer.add(container04);
        })
        .then(function(){
          return db.Substation.getById(parentId);
        })
    }

    function read(id) {
      return db.Substation.getById(id);
    }

    function update(data) {
    }

    function del(id) {
      return db.Substation.delById(id);
    }

    function deleteChields(id) {
      var parentMRID = id;
      var voltageLevelIds = [];
      var powerTransformerIds = [];
      var equipmentContainerIds = [];
      db.EquipmentContainer
        .get({where: "parentClassName='Substation' AND parentMRID = " + parentMRID})
        .then(function (data) {
          equipmentContainerIds = featuresPropertyToArray(context.all(data), "OBJECTID");
          voltageLevelIds = context.allByFilter(data, "chieldClassName", "VoltageLevel");
          powerTransformerIds = context.allByFilter(data, "chieldClassName", "PowerTransformer");
          voltageLevelIds = featuresPropertyToArray(voltageLevelIds, "chieldMRID");
          powerTransformerIds = featuresPropertyToArray(powerTransformerIds, "chieldMRID");
          return db.VoltageLevel.delByArray(voltageLevelIds);
        })
        .then(function () {
          return db.PowerTransformer.delByArray(powerTransformerIds);
        })
        .then(function () {
          return db.EquipmentContainer.delByArray(equipmentContainerIds);
        })
    }

    return {
      proto: proto,
      create: create,
      createDefaultEquipment: createDefaultEquipment,
      read: read,
      update: update,
      del: del,
      deleteChields: deleteChields
    }
  });
