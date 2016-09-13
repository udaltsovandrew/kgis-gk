/**
 * Created by udaltsov on 09.11.15.
 */
"use strict";

define([
  "./js/app/dataAccess/model-compiled.js"
], function (model) {

  var context = new model({url: null, className: null, map: map});

  //todo рефакторинг в самое ближайшее время
  function updateTechnicalConnectionInfo() {
    var substationSet = null;
    var equipmentContainerSet = null;
    var voltageLevelSet = null;
    var measurementControlSet = null;
    var substationMeasurementControlSet = null;
    var powerTransformerSet = null;
    var powerTransformerMeasurementControlSet = null;
    var Substations = null;

    db.Substation
      .get({where: "assetType = 'центр питания'"})
      .then(function (data) {
        substationSet = context.all(data);
        var result = [];
        for (var i = 0; i < substationSet.length; i++) {
          var _substation = {
            attributes: {
              Id: substationSet[i].attributes["OBJECTID"],
              Name: substationSet[i].attributes["aliasName"] + " '" + substationSet[i].attributes["localName"] + "'",
            },
            geometry: substationSet[i].geometry
          };
          result.push(_substation)
        }
        Substations = result;

        var substationIds = featuresToArray(data, "OBJECTID");
        db.EquipmentContainer
          .get({where: "parentClassName='Substation' AND chieldClassName='VoltageLevel' AND (parentMRID in (" + substationIds + "))"})
          .then(function (data) {
            equipmentContainerSet = context.all(data);
            var voltageLevelIds = featuresToArray(data, "chieldMRID");
            return db.VoltageLevel.get({where: "OBJECTID in (" + voltageLevelIds + ")"})
          })
          .then(function (data) {
            voltageLevelSet = context.all(data);
            for (var i = 0; i < Substations.length; i++) {
              var substationId = Substations[i].attributes["Id"];
              Substations[i].voltageLevels = [];
              for (var j = 0; j < equipmentContainerSet.length; j++) {
                if (equipmentContainerSet[j].attributes["parentMRID"] == substationId) {
                  var voltageLevelId = equipmentContainerSet[j].attributes["chieldMRID"];
                  for (var k = 0; k < voltageLevelSet.length; k++) {
                    if (voltageLevelId == voltageLevelSet[k].attributes["OBJECTID"]) {
                      Substations[i].voltageLevels.push(voltageLevelSet[k]);
                    }
                  }
                }
              }
            }
            console.log(Substations);
            return db.MeasurementContainer.get({where: "chieldClassName = 'SubstationMeasurementControl' AND parentMRID in (" + substationIds + ")"})
          })
          .then(function (data) {
            measurementControlSet = context.all(data);
            var substationMeasurementControlIds = featuresToArray(data, "chieldMRID");
            return db.SubstationMeasurementControl.get({where: "OBJECTID in (" + substationMeasurementControlIds + ")"})
          })
          .then(function (data) {
            substationMeasurementControlSet = context.all(data);

            for (var i = 0; i < Substations.length; i++) {
              var substationId = Substations[i].attributes["Id"];
              Substations[i].substationMeasurementControls = [];
              for (var j = 0; j < measurementControlSet.length; j++) {
                if (measurementControlSet[j].attributes["parentMRID"] == substationId) {
                  var substationMeasurementControlId = measurementControlSet[j].attributes["chieldMRID"];
                  for (var k = 0; k < substationMeasurementControlSet.length; k++) {
                    if (substationMeasurementControlId == substationMeasurementControlSet[k].attributes["OBJECTID"]) {
                      Substations[i].substationMeasurementControls.push(substationMeasurementControlSet[k]);
                    }
                  }
                }
              }
            }
            return db.EquipmentContainer.get({where: "parentClassName='Substation' AND chieldClassName='PowerTransformer' AND parentMRID in (" + substationIds + ")"})
          })
          .then(function (data) {
            var powerTransformerIds = featuresToArray(data, "chieldMRID");
            equipmentContainerSet = context.all(data);
            return db.PowerTransformer.get({where: "OBJECTID in (" + powerTransformerIds + ")"})
          })
          .then(function (data) { //add powerTransformers
            powerTransformerSet = context.all(data);
            var powerTransformerIds = featuresToArray(data, "OBJECTID");

            for (var i = 0; i < Substations.length; i++) {
              var substationId = Substations[i].attributes["Id"];
              Substations[i].powerTransformers = [];
              for (var j = 0; j < equipmentContainerSet.length; j++) {
                if (equipmentContainerSet[j].attributes["parentMRID"] == substationId) {
                  var powerTransformerId = equipmentContainerSet[j].attributes["chieldMRID"];
                  for (var k = 0; k < powerTransformerSet.length; k++) {
                    if (powerTransformerId == powerTransformerSet[k].attributes["OBJECTID"]) {
                      Substations[i].powerTransformers.push(powerTransformerSet[k]);
                    }
                  }
                }
              }
            }

            console.log(Substations);
            return db.MeasurementContainer
              .get({
                where: "parentClassName='PowerTransformer' " +
                "AND " +
                "chieldClassName='PowerTransformerMeasurementControl' " +
                "AND " +
                "parentMRID in (" + powerTransformerIds + ")"
              })
          })
          .then(function (data) {
            measurementControlSet = context.all(data);
            var powerTransformerMeasurementIds = featuresToArray(data, "chieldMRID");
            return db.PowerTransformerMeasurementControl
              .get({where: "OBJECTID in (" + powerTransformerMeasurementIds + ")"})
          })
          .then(function (data) {
            powerTransformerMeasurementControlSet = context.all(data);
            for (var i = 0; i < Substations.length; i++) {
              Substations[i].powerTrasformerMeasurements = [];
              var powerTransformers = Substations[i].powerTransformers;
              for (var j = 0; j < powerTransformers.length; j++) {
                var powerTransformerId = powerTransformers[j].attributes["OBJECTID"];
                for (var k = 0; k < measurementControlSet.length; k++) {
                  var innerPowerTransformerId = measurementControlSet[k].attributes["parentMRID"];
                  var measurementId = measurementControlSet[k].attributes["chieldMRID"];
                  if (powerTransformerId == innerPowerTransformerId) {
                    for (var z = 0; z < powerTransformerMeasurementControlSet.length; z++) {
                      if (measurementId == powerTransformerMeasurementControlSet[z].attributes["OBJECTID"]) {
                        Substations[i].powerTrasformerMeasurements.push(powerTransformerMeasurementControlSet[z]);
                      }
                    }
                  }
                }
              }
            }
            console.log(Substations);

            transformSubstationToFeatures(Substations);

            function transformSubstationToFeatures(substationList) {
              var features = [];
              for (var i = 0; i < substationList.length; i++) {
                var substation = substationList[i];
                substation.attributes["Class"] = _getSubstationClass(substationList[i].voltageLevels);
                substation.attributes["Voltage"] = _getSubstationMaxVoltage(substationList[i].voltageLevels);
                substation.attributes["Renovation"] = _getSubstationRenovation(substationList[i].substationMeasurementControls);
                substation.attributes["Power"] = _getSubstationPower(substationList[i].substationMeasurementControls);
                substation.attributes["Status"] = _getSubstationStatus(substationList[i].powerTransformers, substationList[i].powerTrasformerMeasurements);
                features.push(substation);
              }

              db.SubstationEnergyCenter
                .addArray(features)
                .then(function (data) {
                  console.log(data);
                })
            }


          })
      })

  }

  //todo рефакторинг в самое ближайшее время
  function getSubstationEnergyCenterReport(substId) {
    var substationSet = null;
    var equipmentContainerSet = null;
    var voltageLevelSet = null;
    var measurementControlSet = null;
    var substationMeasurementControlSet = null;
    var powerTransformerSet = null;
    var powerTransformerMeasurementControlSet = null;
    var Substations = null;

    return db.Substation
      .get({where: "assetType = 'центр питания' AND OBJECTID=" + substId})
      .then(function (data) {

        substationSet = context.all(data);

        var result = [];
        for (var i = 0; i < substationSet.length; i++) {
          var _substation = {
            attributes: {
              Id: substationSet[i].attributes["OBJECTID"],
              Name: substationSet[i].attributes["aliasName"] + " '" + substationSet[i].attributes["localName"] + "'",
            },
            geometry: substationSet[i].geometry
          };
          result.push(_substation)
        }
        Substations = result;

        var substationIds = featuresToArray(data, "OBJECTID");
        db.EquipmentContainer
          .get({where: "parentClassName='Substation' AND chieldClassName='VoltageLevel' AND (parentMRID in (" + substationIds + "))"})
          .then(function (data) {
            equipmentContainerSet = context.all(data);
            var voltageLevelIds = featuresToArray(data, "chieldMRID");
            return db.VoltageLevel.get({where: "OBJECTID in (" + voltageLevelIds + ")"})
          })
          .then(function (data) {
            voltageLevelSet = context.all(data);
            for (var i = 0; i < Substations.length; i++) {
              var substationId = Substations[i].attributes["Id"];
              Substations[i].voltageLevels = [];
              for (var j = 0; j < equipmentContainerSet.length; j++) {
                if (equipmentContainerSet[j].attributes["parentMRID"] == substationId) {
                  var voltageLevelId = equipmentContainerSet[j].attributes["chieldMRID"];
                  for (var k = 0; k < voltageLevelSet.length; k++) {
                    if (voltageLevelId == voltageLevelSet[k].attributes["OBJECTID"]) {
                      Substations[i].voltageLevels.push(voltageLevelSet[k]);
                    }
                  }
                }
              }
            }
            console.log(Substations);
            return db.MeasurementContainer.get({where: "chieldClassName = 'SubstationMeasurementControl' AND parentMRID in (" + substationIds + ")"})
          })
          .then(function (data) {
            measurementControlSet = context.all(data);
            var substationMeasurementControlIds = featuresToArray(data, "chieldMRID");
            return db.SubstationMeasurementControl.get({where: "OBJECTID in (" + substationMeasurementControlIds + ")"})
          })
          .then(function (data) {
            substationMeasurementControlSet = context.all(data);

            for (var i = 0; i < Substations.length; i++) {
              var substationId = Substations[i].attributes["Id"];
              Substations[i].substationMeasurementControls = [];
              for (var j = 0; j < measurementControlSet.length; j++) {
                if (measurementControlSet[j].attributes["parentMRID"] == substationId) {
                  var substationMeasurementControlId = measurementControlSet[j].attributes["chieldMRID"];
                  for (var k = 0; k < substationMeasurementControlSet.length; k++) {
                    if (substationMeasurementControlId == substationMeasurementControlSet[k].attributes["OBJECTID"]) {
                      Substations[i].substationMeasurementControls.push(substationMeasurementControlSet[k]);
                    }
                  }
                }
              }
            }
            return db.EquipmentContainer.get({where: "parentClassName='Substation' AND chieldClassName='PowerTransformer' AND parentMRID in (" + substationIds + ")"})
          })
          .then(function (data) {
            var powerTransformerIds = featuresToArray(data, "chieldMRID");
            equipmentContainerSet = context.all(data);
            return db.PowerTransformer.get({where: "OBJECTID in (" + powerTransformerIds + ")"})
          })
          .then(function (data) { //add powerTransformers
            powerTransformerSet = context.all(data);
            var powerTransformerIds = featuresToArray(data, "OBJECTID");

            for (var i = 0; i < Substations.length; i++) {
              var substationId = Substations[i].attributes["Id"];
              Substations[i].powerTransformers = [];
              for (var j = 0; j < equipmentContainerSet.length; j++) {
                if (equipmentContainerSet[j].attributes["parentMRID"] == substationId) {
                  var powerTransformerId = equipmentContainerSet[j].attributes["chieldMRID"];
                  for (var k = 0; k < powerTransformerSet.length; k++) {
                    if (powerTransformerId == powerTransformerSet[k].attributes["OBJECTID"]) {
                      Substations[i].powerTransformers.push(powerTransformerSet[k]);
                    }
                  }
                }
              }
            }

            return db.MeasurementContainer
              .get({
                where: "parentClassName='PowerTransformer' " +
                "AND " +
                "chieldClassName='PowerTransformerMeasurementControl' " +
                "AND " +
                "parentMRID in (" + powerTransformerIds + ")"
              })
          })
          .then(function (data) {
            measurementControlSet = context.all(data);
            var powerTransformerMeasurementIds = featuresToArray(data, "chieldMRID");
            return db.PowerTransformerMeasurementControl
              .get({where: "OBJECTID in (" + powerTransformerMeasurementIds + ")"})
          })
          .then(function (data) {
            powerTransformerMeasurementControlSet = context.all(data);

            for (var i = 0; i < Substations.length; i++) {
              Substations[i].powerTrasformerMeasurements = [];
              var powerTransformers = Substations[i].powerTransformers;
              for (var j = 0; j < powerTransformers.length; j++) {
                var powerTransformerId = powerTransformers[j].attributes["OBJECTID"];
                for (var k = 0; k < measurementControlSet.length; k++) {
                  var innerPowerTransformerId = measurementControlSet[k].attributes["parentMRID"];
                  var measurementId = measurementControlSet[k].attributes["chieldMRID"];
                  if (powerTransformerId == innerPowerTransformerId) {
                    for (var z = 0; z < powerTransformerMeasurementControlSet.length; z++) {
                      if (measurementId == powerTransformerMeasurementControlSet[z].attributes["OBJECTID"]) {
                        powerTransformerMeasurementControlSet[z].attributes["aliasName"] = powerTransformers[j].attributes["aliasName"];
                        Substations[i].powerTrasformerMeasurements.push(powerTransformerMeasurementControlSet[z]);
                      }
                    }
                  }
                }
              }
            }

            generateReport(Substations);
          })
      })
  }

  function generateReport(substationList) {
    var features = [];
    for (var i = 0; i < substationList.length; i++) {
      var substation = substationList[i];
      substation.attributes["Class"] = _getSubstationClass(substationList[i].voltageLevels);
      substation.attributes["Voltage"] = _getSubstationMaxVoltage(substationList[i].voltageLevels);
      substation.attributes["Renovation"] = _getSubstationRenovation(substationList[i].substationMeasurementControls);
      substation.attributes["Power"] = _getSubstationPower(substationList[i].substationMeasurementControls);
      substation.attributes["Status"] = _getSubstationStatus(substationList[i].powerTransformers, substationList[i].powerTrasformerMeasurements);
      features.push(substation);
    }

    var item = features[0];
    $("#substationName")[0].innerHTML = item.attributes["Name"];
    $("#substationClass")[0].innerHTML = item.attributes["Class"];
    for (var i = 0; i < item.powerTransformers.length; i++) {
      $("#powerTransformer-list")[0].innerHTML += "<div>" + item.powerTransformers[i].attributes["aliasName"] + " : " + item.powerTransformers[i].attributes["powerRating"]
    }

    for (var i = 0; i < item.powerTransformers.length; i++) {
      $("#powerTransformerReconstruction-list")[0].innerHTML += "<div>" + item.powerTransformers[i].attributes["aliasName"] + " : " + item.powerTransformers[i].attributes["altPowerRating"]
    }

    $("#powerReserve")[0].innerHTML = item.attributes["Power"];
    $("#powerContracts")[0].innerHTML = item.substationMeasurementControls[0].attributes["loadForecastContracts"];
    $("#powerClaims")[0].innerHTML = item.substationMeasurementControls[0].attributes["loadForecastClaims"];

    if (item.attributes["Renovation"] > 0) {
      $("#reconstruction-header").show();
      $("#powerTransformerReconstruction-list").show();
      for (var i = 0; i < item.powerTrasformerMeasurements.length; i++) {
        $("#powerTransformerLoad-list")[0].innerHTML += "<div>" + item.powerTrasformerMeasurements[i].attributes["aliasName"] + " : " + item.powerTrasformerMeasurements[i].attributes["loadModeNormal"]
      }
    }
  }

  function _getSubstationStatus(_ptSet, _measurements) {
    var measurements = featuresPropertyToArray(_measurements, "loadModeNormal");
    var powerTransformers = featuresPropertyToArray(_ptSet, "powerRating");
    var sumMeasurements = 0;
    var minPTNominalPower = Infinity;
    for (var j = 0; j < measurements.length; j++) sumMeasurements += Number(measurements[j]);
    for (var k = 0; k < powerTransformers.length; k++) {
      var powerRating = Number(powerTransformers[k]);
      if ((minPTNominalPower > powerRating) && (powerRating != 0 )) {
        minPTNominalPower = Number(powerTransformers[k]);
      }
    }
    var relation = sumMeasurements / (1.05 * minPTNominalPower);
    if (relation < 0.75) return 1;
    if ((relation >= 0.75) && (relation < 1.05)) return 2;
    if (relation >= 1.05) return 3;
  }

  function _getSubstationClass(voltageLevels) {
    var voltageLevelList = [];
    for (var j = 0; j < voltageLevels.length; j++) {
      voltageLevelList.push(voltageLevels[j].attributes["nominalVoltage"]);
    }
    voltageLevelList = voltageLevelList.sort(function (a, b) {
      return a <= b;
    });
    voltageLevelList = voltageLevelList.join("/");
    return voltageLevelList;
  }

  function _getSubstationMaxVoltage(voltageLevels) {
    var voltageLevelList = [];
    for (var j = 0; j < voltageLevels.length; j++) {
      voltageLevelList.push(Number(voltageLevels[j].attributes["nominalVoltage"]));
    }
    return Math.max.apply(null, voltageLevelList);
  }

  function _getSubstationRenovation(measurementControls) {
    for (var j = 0; j < measurementControls.length; j++) {
      if (measurementControls[j].attributes["powerInputYear"] > 0) {
        return 1;
      }
    }
    return 0;
  }

  function _getSubstationPower(measurementControls) {
    for (var j = 0; j < measurementControls.length; j++) {
      if (measurementControls[j].attributes["powerReserve1N105"] > 0) {
        return measurementControls[j].attributes["powerReserve1N105"];
      }
    }
    return NaN;
  }

  return {
    updateTechnicalConnectionInfo: updateTechnicalConnectionInfo,
    getSubstationEnergyCenterReport: getSubstationEnergyCenterReport,
  };
});