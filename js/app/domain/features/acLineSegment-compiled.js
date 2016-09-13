/**
 * Created by udaltsov on 30.10.15.
 */
"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

define(["./js/app/dataAccess/model-compiled.js", "./js/app/domain/carto-compiled.js", "./js/app/domain/generators-compiled.js"], function (model, carto, generators) {
  let connectToCandidate = (() => {
    var ref = _asyncToGenerator(function* (parentId, terminalNumber, candidateId, candidateClassName, isGetNominalVoltage) {
      var data = yield db.ACLineSegment.getById(parentId);
      //получаем сегмент
      var acLineSegment = context.first(data);
      //получаем коллекцию соединительных узлов
      var where = "parentClassName='ACLineSegment' AND localName='terminal" + terminalNumber + "' AND parentMRID=" + parentId;
      data = yield db.AssetContainer.get({ where: where });
      var containers = data.features;
      //удаляем существующие соединения с объектами
      if (containers) containers.forEach(function (item) {
        db.AssetContainer.delById(item.attributes.OBJECTID);
      });
      //получаем точку связи из сегмента в зависимости от терминала
      var point = terminalNumber === 1 ? carto.getFirstPointInLine(acLineSegment.geometry) : carto.getLastPointInLine(acLineSegment.geometry);
      //формируем (записываем) шаблон соединения
      var connectivityNode = context.containerTemplate(parentId, candidateId, "ACLineSegment", candidateClassName, point);
      connectivityNode.attributes.localName = 'terminal' + terminalNumber;
      var action = yield db.AssetContainer.add(connectivityNode);
      var connectivityNodeId = action[0][0].objectId;
      //получаем объект дочернего класса
      data = yield db[candidateClassName].getById(candidateId);
      var candidate = context.first(data);
      //получаем сегмент
      //получаем контейнер оборудования ЛИНИЯ - СЕГМЕНТ
      data = yield db.EquipmentContainer.get({ where: context.containerWhere('PowerLine', 'ACLineSegment', null, parentId) });
      var equipmentContainer = context.first(data);
      //получаем ЛИНИЮ
      data = yield db.PowerLine.getById(equipmentContainer.attributes.parentMRID);
      var powerLine = context.first(data);
      //присваиваем напряжение
      var nominalVoltage = candidate.attributes.nominalVoltage;
      if (nominalVoltage && isGetNominalVoltage) {
        acLineSegment.attributes["nominalVoltage"] = nominalVoltage;
        powerLine.attributes["nominalVoltage"] = nominalVoltage;
        db.PowerLine.set(powerLine);
        db.ACLineSegment.set(acLineSegment);
      }
      return candidate;
    });

    return function connectToCandidate(_x, _x2, _x3, _x4, _x5) {
      return ref.apply(this, arguments);
    };
  })();

  let disconnectFromCandidate = (() => {
    var ref = _asyncToGenerator(function* (parentId, terminalNumber, candidateId) {
      var where = "parentClassName='ACLineSegment' AND localName='terminal" + terminalNumber + "'" + " AND parentMRID=" + parentId + " AND chieldMRID=" + candidateId;
      var data = yield db.AssetContainer.get({ where: where });
      var feature = context.first(data);
      var action = db.AssetContainer.delById(feature.attributes.OBJECTID);
      return action !== undefined;
    });

    return function disconnectFromCandidate(_x6, _x7, _x8) {
      return ref.apply(this, arguments);
    };
  })();

  var context = new model({ url: "", className: "", map: map });

  var proto = {
    base: {
      className: "ACLineSegment"
    },
    chields: []
  };

  function create(line) {
    var feature = generators.ACLineSegment.default;
    feature.geometry = line;
    return db.ACLineSegment.add(feature);
  }

  function createDefault(line) {
    var feature = generators.ACLineSegment.default;
    feature.geometry = line;
    return db.ACLineSegment.add(feature);
  }

  function read(id) {
    return db.ACLineSegment.getById(id);
  }

  function allByParent(id) {
    return db.EquipmentContainer.get({ where: context.containerWhere("PowerLine", "ACLineSegment", id, null) }).then(function (data) {
      var features = context.all(data);
      var ids = featuresPropertyToArray(features, "chieldMRID");
      return db.ACLineSegment.getByArray(ids);
    });
  }

  function linkToVoltageLevel(parentId, candidateId, terminalNumber) {
    var _feature = null;
    var _connectionNodes = [];
    var _voltageLevel = null;
    var _acLineSegment = null;
    var _container = null;
    var _powerLine = null;
    var _node = null;

    return db.ACLineSegment.getById(parentId).then(function (data) {
      //получаем сегмент
      _feature = context.first(data);
      //получаем коллекцию соединительных узлов
      return db.AssetContainer.get({ where: context.containerWhere('ACLineSegment', 'VoltageLevel', parentId, candidateId) + " AND localName='terminal" + terminalNumber + "'" });
    }).then(function (data) {

      _connectionNodes = context.all(data);
      //if (_connectionNodes.length != 0) return;
      var geometry = null;
      //получаем точку линии в зависимости от терминала
      if (terminalNumber == 1) {
        geometry = carto.getFirstPointInLine(_feature.geometry);
      }
      if (terminalNumber == 2) {
        geometry = carto.getLastPointInLine(_feature.geometry);
      }
      //формируем шаблон соединения
      _node = context.containerTemplate(parentId, candidateId, "ACLineSegment", "VoltageLevel", geometry);
      _node.attributes.localName = 'terminal' + terminalNumber;
      return db.AssetContainer.add(_node);
    }).then(function () {
      //получаем РУ
      return db.VoltageLevel.getById(candidateId);
    }).then(function (data) {
      _voltageLevel = context.first(data);
      //получаем сегмент
      return db.ACLineSegment.getById(parentId);
    }).then(function (data) {
      _acLineSegment = context.first(data);
      //получаем контейнер оборудования ЛИНИЯ - СЕГМЕНТ
      return db.EquipmentContainer.get({ where: context.containerWhere('PowerLine', 'ACLineSegment', null, parentId) });
    }).then(function (data) {
      _container = context.first(data);
      //получаем ЛИНИЮ
      return db.PowerLine.getById(_container.attributes["parentMRID"]);
    }).then(function (data) {
      _powerLine = context.first(data);
      //присваиваем напряжение
      _acLineSegment.attributes["nominalVoltage"] = _voltageLevel.attributes["nominalVoltage"];
      _powerLine.attributes["nominalVoltage"] = _voltageLevel.attributes["nominalVoltage"];
      db.ACLineSegment.set(_acLineSegment);
      db.PowerLine.set(_powerLine);
      //зачем-то возвращаем РУ
      return db.VoltageLevel.getById(candidateId);
    });
  }

  function update(data) {}

  function updateParent(feature) {
    var id = context.key(feature);
    var parentId = null;
    var _powerLine = null;
    var acLineSegments = [];
    _updateLayerByFeature("ACLineSegment", feature, "OBJECTID");
    return db.EquipmentContainer.get({ where: context.containerWhere("PowerLine", "ACLineSegment", null, id) }).then(function (data) {
      _powerLine = context.first(data);
      parentId = context.keyByField(_powerLine, "parentMRID");
      return db.EquipmentContainer.get({ where: context.containerWhere("PowerLine", "ACLineSegment", parentId, null) });
    }).then(function (data) {
      return db.ACLineSegment.getByArray(featuresToArray(data, "chieldMRID"));
    }).then(function (data) {
      acLineSegments = context.all(data);
      return db.PowerLine.getById(parentId);
    }).then(function (data) {
      _powerLine = context.first(data);
      _powerLine.geometry = carto.sumLineGeometry(acLineSegments);
      _updateLayerByFeature("PowerLine", _powerLine, "OBJECTID");
      return db.PowerLine.set(_powerLine);
    });
  }

  function updateByVoltageLevel(feature) {
    var voltageLevelId = context.key(feature);
    var acLineSegments = null;
    var assetContainers = null;
    return db.AssetContainer.get({ where: context.containerWhere("ACLineSegment", "VoltageLevel", null, voltageLevelId) }).then(function (data) {
      assetContainers = context.all(data);
      return db.ACLineSegment.getByArray(featuresToArray(data, "parentMRID"));
    }).then(function (data) {
      acLineSegments = context.all(data);
      for (var i = 0; i < acLineSegments.length; i++) {
        acLineSegments[i].geometry = carto.updateLineByPoint(acLineSegments[i].geometry, assetContainers[i].geometry, feature.geometry);
      }
      for (var i = 0; i < assetContainers.length; i++) {
        assetContainers[i].geometry = feature.geometry;
      }
      return db.ACLineSegment.setArray(acLineSegments);
    }).then(function () {
      return db.AssetContainer.setArray(assetContainers);
    }).then(function () {
      for (var i = 0; i < acLineSegments.length; i++) {
        updateParent(acLineSegments[i]);
      }
    });
  }

  function generateStructures(data, template) {
    var points = [];
    var structures = [];
    var parentId = context.key(data);

    var geometry = data.geometry.paths[0];
    var generationTemplate = template;

    for (var i = 0; i < geometry.length; i++) {
      var attributes = {};
      var structurePrototype = getStructureAssetType(generationTemplate, i);
      attributes["localName"] = i + 1;
      attributes["aliasName"] = i + 1;
      attributes["assetType"] = structurePrototype.assetType;
      attributes["towerConstruction"] = structurePrototype.towerConstruction;
      attributes["material"] = structurePrototype.material;
      attributes["assetUsage"] = structurePrototype.assetUsage;

      var structureGeom = carto.getNPointInLine(data.geometry, i);
      points.push({
        geometry: structureGeom,
        attributes: attributes
      });
    }

    if (generationTemplate.length == 1) {
      for (var i = 1; i < geometry.length - 1; i++) {
        points[i].attributes["localName"] = i;
        points[i].attributes["aliasName"] = i;
        structures.push(points[i]);
      }
    }
    if (generationTemplate.length > 1) {
      for (var i = 0; i < geometry.length; i++) {
        points[i].attributes["localName"] = i;
        points[i].attributes["aliasName"] = i;
        structures.push(points[i]);
      }
    }

    for (var i = 0; i < structures.length; i++) {
      db.Structure.add(structures[i]).then(function (data) {
        var id = data[0][0].objectId;
        return addStructureLink(parentId, id);
      });
    }

    function addStructureLink(parentMRID, chieldMRID) {
      var feature = null;
      return db.Structure.getById(chieldMRID).then(function (data) {
        feature = context.first(data);
        var container = context.containerTemplate(parentMRID, chieldMRID, "ACLineSegment", "Structure", feature.geometry);
        return db.EquipmentContainer.add(container);
      });
    }

    function getStructureAssetType(data, n) {
      var result = {};
      result.assetType = "промежуточная (П)";
      result.towerConstruction = "Одностоечная";
      result.material = "Железобетонная";
      result.assetUsage = "на балансе";
      var template = data.split('-');
      var index = n % template.length;
      var item = "(" + template[index] + ")";
      for (var i = 0; i < config.classes.Structure.length; i++) {
        var pattern = config.classes.Structure[i];
        if (pattern.indexOf(item) > -1) {
          result.assetType = pattern;
          result.towerConstruction = generators.Structure[pattern].attributes["towerConstruction"];
          result.material = generators.Structure[pattern].attributes["material"];
          result.assetUsage = generators.Structure[pattern].attributes["assetUsage"];
          return result;
        }
      }
      return result;
    }
  }

  function del(id) {
    return db.ACLineSegment.delById(id);
  }

  function deleteChields(id) {}

  return {
    proto: proto,
    create: create,
    read: read,
    allByParent: allByParent,
    update: update,
    updateParent: updateParent,
    updateByVoltageLevel: updateByVoltageLevel,
    generateStructures: generateStructures,
    del: del,
    linkToVoltageLevel: linkToVoltageLevel,
    deleteChields: deleteChields,
    createDefault: createDefault,
    connectToCandidate: connectToCandidate,
    disconnectFromCandidate: disconnectFromCandidate
  };
});

//# sourceMappingURL=acLineSegment-compiled.js.map