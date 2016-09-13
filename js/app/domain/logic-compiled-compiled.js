"use strict";

function _asyncToGenerator(fn) {
  return function () {
    var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);var value = info.value;
        } catch (error) {
          reject(error);return;
        }if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            return step("next", value);
          }, function (err) {
            return step("throw", err);
          });
        }
      }return step("next");
    });
  };
}

define(["./js/app/forms/forms-compiled.js", "./js/app/dataAccess/model-compiled.js", "./js/app/domain/http-compiled.js", "./js/app/domain/dxf.js", "./js/app/domain/features/substation-compiled.js", "./js/app/domain/features/powerLine-compiled.js", "./js/app/domain/features/acLineSegment-compiled.js", "./js/app/domain/features/voltageLevel-compiled.js", "./js/app/domain/features/powerTransformer-compiled.js", "./js/app/domain/features/account-compiled.js", "./js/app/domain/interactiveMap/index.js", "./js/app/domain/generators-compiled.js", "./js/app/domain/carto-compiled.js", "./js/app/domain/misc/sac-compiled.js", "./js/app/domain/misc/projects-compiled.js", "./js/app/domain/misc/geometryView-compiled.js", "./js/app/domain/misc/export-compiled.js", "./js/app/domain/features/crew-compiled.js"], function (forms, model, httpUtils, dxfUtils, substation, temporaryPowerLine, acLineSegment, voltageLevel, powerTransformer, account, interactiveMap, generators, carto, sac, projects, geometryView, exportUtils, crewUtils) {
  let getChields = (() => {
    var ref = _asyncToGenerator(function* (parentMRID, parentClassName, chieldClassName, proxyClassName) {
      var where = "parentClassName = '" + parentClassName + "' AND chieldClassName='" + chieldClassName + "' AND parentMRID=" + parentMRID;
      var data = yield db[proxyClassName].get({ where: where });
      var features = context.all(data);
      var ids = features.map(function (item) {
        return item.attributes.chieldMRID;
      });
      data = yield db[chieldClassName].getByArray(ids);
      features = context.all(data);
      return features;
    });

    return function getChields(_x, _x2, _x3, _x4) {
      return ref.apply(this, arguments);
    };
  })();

  let initFeatureList = (() => {
    var ref = _asyncToGenerator(function* (className, elementName) {
      var tableName = elementName;
      var data = yield db[className].get({ where: "1=1" });
      forms.createTable(tableName, context.all(data), className);
    });

    return function initFeatureList(_x5, _x6) {
      return ref.apply(this, arguments);
    };
  })();

  let loadCustomerVoltageLevelList = (() => {
    var ref = _asyncToGenerator(function* (id, className) {
      var tableName = className + "-VoltageLevel-List";
      bindClick("add" + className + "VoltageLevel", _asyncToGenerator(function* () {
        var data = yield db[className].getById(id);
        data = context.first(data);
        var voltageLevel = generators.VoltageLevel.U04CustomerErpPerson;
        voltageLevel.geometry = data.geometry;
        data = yield db.VoltageLevel.add(voltageLevel);
        var chieldMRID = data[0][0].objectId;
        voltageLevel = yield db.VoltageLevel.getById(chieldMRID);
        voltageLevel = context.first(voltageLevel);
        var container = context.containerTemplate(id, chieldMRID, className, "VoltageLevel", voltageLevel.geometry);
        data = yield db.EquipmentContainer.add(container);
        if (data) forms.appendRowInTable(tableName, voltageLevel.attributes);
      }));
      bindClick("edit" + className + "VoltageLevel", _asyncToGenerator(function* () {
        var objectId = forms.getObjectID(tableName);
        var feature = yield db.VoltageLevel.getById(objectId);
        feature = context.first(feature);
        forms.open("VoltageLevel", feature);
      }));
      bindClick("delete" + className + "VoltageLevel", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(tableName);
        ids = "chieldMRID=" + ids.join(" OR chieldMRID=");
        var where = "parentClassName='" + className + "' AND chieldClassName='VoltageLevel' AND parentMRID=" + id + " AND (" + ids + ")";
        var data = yield db.EquipmentContainer.get({ where: where });
        ids = data.features.map(function (item) {
          return item.attributes.OBJECTID;
        });
        data = yield db.EquipmentContainer.delByArray(ids);
        if (data) forms.removeSelectedRows(tableName);
      }));

      var data = yield db.EquipmentContainer.get({ where: "parentClassName='" + className + "' AND chieldClassName='VoltageLevel' AND parentMRID=" + id });
      var ids = data.features.map(function (item) {
        return item.attributes.chieldMRID;
      });
      data = yield db.VoltageLevel.getByArray(ids);
      forms.createTable(tableName, context.all(data), "VoltageLevel");
    });

    return function loadCustomerVoltageLevelList(_x7, _x8) {
      return ref.apply(this, arguments);
    };
  })();

  let loadCustomerPowerCircuitList = (() => {
    var ref = _asyncToGenerator(function* (id, className) {
      var table = className + "-PowerCircuit-List";
      bindClick("add" + className + "PowerCircuit", _asyncToGenerator(function* () {
        var data = yield db[className].getById(id);
        var feature = context.first(data);

        var _powerCircuit = {
          attributes: {
            parentMRID: id,
            parentClassName: className,
            chieldClassName: "PowerCircuit"
          },
          geometry: feature.geometry
        };
        var action = yield db.PsrList.add(_powerCircuit);
        var _powerCircuitId = action[0][0].objectId;
        action = yield db.PsrList.getById(_powerCircuitId);
        _powerCircuit = context.first(action);
        forms.appendRowInTable(table, _powerCircuit.attributes);
      }));
      bindClick("edit" + className + "PowerCircuit", _asyncToGenerator(function* () {
        var objectId = forms.getObjectID(table);
        var action = yield db.PsrList.getById(objectId);
        var feature = context.first(action);
        forms.open("PsrList", feature);
        loadPsrListClassNameList(objectId, "Substation");
        loadPsrListClassNameList(objectId, "PowerLine");
        loadPsrListClassNameList(objectId, "EnergySource");
      }));
      bindClick("delete" + className + "PowerCircuit", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(table);
        forms.removeSelectedRows(table);
        for (var i = 0; i < ids.length; i++) {
          db.PsrList.delById(ids[i]);
        }
      }));

      var where = "parentMRID=" + id + " AND parentClassName='" + className + "' AND chieldClassName='PowerCircuit'";
      var data = yield db.PsrList.get({ where: where });
      var features = context.all(data);
      forms.createTable(table, features, "PsrList");
    });

    return function loadCustomerPowerCircuitList(_x9, _x10) {
      return ref.apply(this, arguments);
    };
  })();

  let loadPsrListClassNameList = (() => {
    var ref = _asyncToGenerator(function* (id, className) {
      var table = "PsrList-" + className + "-List";
      var tableCandidate = "PsrList-" + className + "-Candidate-List";
      bindClick("linkPsrList" + className, _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(tableCandidate);
        var containers = ids.map(function (chieldId) {
          return {
            attributes: {
              parentMRID: id,
              parentClassName: "PsrList",
              chieldClassName: className,
              chieldMRID: chieldId
            }
          };
        });
        var action = yield db.PsrIdObjectRole.addArray(containers);
        if (action) {
          var data = yield db[className].getByArray(ids);
          features = context.all(data);
          loadPsrListClassNameList(id, className);
        }
      }));
      bindClick("relinkPsrList" + className, _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(table);
        var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
        var where = "parentMRID=" + id + " AND parentClassName='PsrList' AND chieldClassName='" + className + "' AND (" + chieldIds + ")";
        var containers = yield db.PsrIdObjectRole.get({ where: where });
        containers = context.all(containers);
        ids = containers.map(function (item) {
          return item.attributes.OBJECTID;
        });
        for (var i = 0; i < ids.length; i++) {
          yield db.PsrIdObjectRole.delById(ids[i]);
        }
        forms.removeSelectedRows(table);
      }));

      bindClick("refreshPsrList" + className, _asyncToGenerator(function* () {
        var editor = _getEditorLayer(className);
        //noinspection JSUnresolvedFunction
        var candidates = editor.getSelectedFeatures();
        forms.createTable(tableCandidate, candidates, className);
      }));

      var features = yield getChields(id, "PsrList", className, "PsrIdObjectRole");
      forms.createTable(table, features, className);

      var editor = _getEditorLayer(className);
      //noinspection JSUnresolvedFunction
      var candidates = editor.getSelectedFeatures();
      forms.createTable(tableCandidate, candidates, className);
    });

    return function loadPsrListClassNameList(_x11, _x12) {
      return ref.apply(this, arguments);
    };
  })();

  let initStructureTabs = (() => {
    var ref = _asyncToGenerator(function* (data) {
      var id = context.key(data);
      loadStructureACLineSegments(id);
      linkClick("Structure-Geometry", function () {
        geometryView.loadGeometryProperty(data, "Structure-Geometry");
      });
    });

    return function initStructureTabs(_x13) {
      return ref.apply(this, arguments);
    };
  })();

  let loadStructureACLineSegments = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var tableName = "Structure-Connection-List";

      bindClick("editStructureACLineSegment", _asyncToGenerator(function* () {
        var acLineSegmentId = forms.getObjectID(tableName);
        var data = yield db.ACLineSegment.getById(acLineSegmentId);
        forms.open("ACLineSegment", context.first(data));
      }));

      bindClick("deleteStructureConnection", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(tableName);
        ids = "parentMRID=" + ids.join(" OR parentMRID=");
        var where = "parentClassName='ACLineSegment' AND chieldClassName='Structure' AND chieldMRID=" + id + " AND (" + ids + ")";
        var data = yield db.EquipmentContainer.get({ where: where });
        ids = data.features.map(function (item) {
          return item.attributes.OBJECTID;
        });
        var action = yield db.EquipmentContainer.delByArray(ids);
        if (action) forms.removeSelectedRows(tableName);
      }));

      var containers = yield db.EquipmentContainer.get({ where: context.containerWhere("ACLineSegment", "Structure", null, id) });
      containers = context.all(containers);
      var ids = containers.map(function (item) {
        return item.attributes.parentMRID;
      });
      var acLineSegments = yield db.ACLineSegment.getByArray(ids);
      acLineSegments = context.all(acLineSegments);
      forms.createTable(tableName, acLineSegments, "ACLineSegment");
    });

    return function loadStructureACLineSegments(_x14) {
      return ref.apply(this, arguments);
    };
  })();

  //Мероприятие САЦ

  // Список ответственных лиц, связанных с объектом мероприятия

  let loadSACEventListErpPersonList = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var tableNameDestination = "SACEventList-ErpPerson-List";
      var tableNameSource = "SACEventList-ErpPerson-Source-List";
      forms.createTable(tableNameDestination, [], "ErpPerson");
      forms.createTable(tableNameSource, [], "ErpPerson");

      db.ErpPerson.get({ where: "1=1" }).then(function (data) {
        forms.loadTableData(tableNameSource, featuresToArray(data));
      });

      db.ErpPersonIdentificationObjectRole.get({ where: "parentClassName='SACEventList' AND chieldClassName='ErpPerson' AND parentMRID=" + id }).then(function (data) {
        var ids = featuresToArray(data, "chieldMRID");
        return db.ErpPerson.getByArray(ids);
      }).then(function (data) {
        forms.loadTableData(tableNameDestination, featuresToArray(data));
      });

      bindClick("linkSACEventListErpPerson", function () {
        var ids = forms.getTableRows(tableNameSource).map(function (item) {
          return item.OBJECTID;
        });
        var persons = null;
        return db.ErpPerson.getByArray(ids).then(function (data) {
          persons = context.all(data);
          var containers = persons.map(function (item) {
            var attributes = item.attributes;
            attributes.parentMRID = id;
            attributes.parentClassName = "SACEventList";
            attributes.chieldClassName = "ErpPerson";
            attributes.chieldMRID = attributes.OBJECTID;
            return {
              geometry: item.geometry,
              attributes: attributes
            };
          });
          return db.ErpPersonIdentificationObjectRole.addArray(containers);
        }).then(function () {
          for (var i = 0; i < persons.length; i++) {
            forms.appendRowInTable(tableNameDestination, persons[i].attributes);
          }
        });
      });
      bindClick("relinkSACEventListErpPerson", function () {
        var ids = forms.getTableRows(tableNameDestination).map(function (item) {
          return item.OBJECTID;
        });
        forms.removeSelectedRows(tableNameDestination);
        for (var i = 0; i < ids.length; i++) {
          db.ErpPersonIdentificationObjectRole.get({ where: "parentClassName='SACEventList' AND chieldClassName='ErpPerson' AND parentMRID=" + id + " AND chieldMRID=" + ids[i] }).then(function (data) {
            var featureId = context.key(context.first(data));
            db.ErpPersonIdentificationObjectRole.delById(featureId);
          });
        }
      });
      bindClick("addErpPersonFromSACEventList", function () {
        db.ErpPerson.add(generators.ErpPerson.default).then(function (data) {
          return db.ErpPerson.getById(data[0][0].objectId);
        }).then(function (data) {
          forms.open("ErpPerson", context.first(data));
          forms.appendRowInTable(tableNameSource, context.first(data)["attributes"]);
        });
      });
      bindClick("editErpPersonFromSACEventList", function () {
        var featureId = forms.getTableSelection(tableNameSource)["OBJECTID"];
        db.ErpPerson.getById(featureId).then(function (data) {
          forms.open("ErpPerson", context.first(data));
        });
      });
      bindClick("deleteErpPersonFromSACEventList", function () {
        var featureId = forms.getTableSelection(tableNameSource)["OBJECTID"];
        db.ErpPerson.delById(featureId).then(function () {
          forms.deleteRowInTable(tableNameSource, featureId);
        });
      });
    });

    return function loadSACEventListErpPersonList(_x15) {
      return ref.apply(this, arguments);
    };
  })();

  //Функции САЦ - вынести в отдельный класс

  let loadSACEventListChieldClassNameList = (() => {
    var ref = _asyncToGenerator(function* (id, className, connectionType) {
      var tableName = "SACEventList-" + className + "-List";
      bindClick("addSACEventList" + className, _asyncToGenerator(function* () {
        var editor = _getEditorLayer(className);
        //noinspection JSUnresolvedFunction
        var features = editor.getSelectedFeatures();
        var containers = [];
        for (var i = 0; i < features.length; i++) {
          var attributes = features[i].attributes;
          attributes.parentMRID = id;
          attributes.chieldMRID = features[i].attributes["OBJECTID"];
          attributes.parentClassName = "SACEvent";
          attributes.chieldClassName = className;
          attributes.collectionType = connectionType;
          delete attributes.OBJECTID;
          containers.push({
            attributes: attributes,
            geometry: features[i].geometry
          });
        }
        var data = yield db.SACEventList.addArray(containers);
        var ids = data[0].map(function (item) {
          return item.objectId;
        });
        _getEditorLayer("SACEventList").refresh();
        data = yield db.SACEventList.getByArray(ids);
        features = context.all(data);
        features.forEach(function (item) {
          forms.appendRowInTable(tableName, item.attributes);
        });
      }));
      bindClick("editSACEventList" + className, _asyncToGenerator(function* () {
        var featureId = forms.getTableSelection(tableName)["OBJECTID"];
        var data = yield db.SACEventList.getById(featureId);
        forms.open("SACEventList", context.first(data));
        initSACEventListTabs(context.first(data));
      }));
      bindClick("infoSACEventList" + className, _asyncToGenerator(function* () {
        var feature = forms.getTableSelection(tableName);
        var data = yield db[feature.chieldClassName].getById(feature.chieldMRID);
        forms.open(feature.chieldClassName, context.first(data));
      }));
      bindClick("deleteSACEventList" + className, _asyncToGenerator(function* () {
        var features = forms.getTableRows(tableName);
        var ids = features.map(function (item) {
          return item.OBJECTID;
        });
        yield db.SACEventList.delByArray(ids);
        forms.removeSelectedRows(tableName);
        _getEditorLayer("SACEventList").refresh();
      }));

      var where = "parentMRID=" + id + " AND parentClassName='SACEvent' AND chieldClassName='" + className + "'";
      var data = yield db.SACEventList.get({ where: where });
      var features = context.all(data);
      forms.createTable(tableName, features, "SACEventList");
    });

    return function loadSACEventListChieldClassNameList(_x16, _x17, _x18) {
      return ref.apply(this, arguments);
    };
  })();

  let addSubstation = (() => {
    var ref = _asyncToGenerator(function* (tableName) {
      var point = carto.getCenter(map.extent);
      substation.create(point).then(function (data) {
        var feature = context.first(data);
        forms.appendRowInTable(tableName, feature.attributes);
        forms.open("Substation", feature);
        initSubstationTabs(feature);
      });
    });

    return function addSubstation(_x19) {
      return ref.apply(this, arguments);
    };
  })();

  let addPowerLine = (() => {
    var ref = _asyncToGenerator(function* (tableName) {
      var data = yield db.PowerLine.add(generators.PowerLine.default);
      var id = data[0][0].objectId;
      data = yield db.PowerLine.getById(id);
      var feature = context.first(data);
      forms.appendRowInTable(tableName, feature.attributes);
    });

    return function addPowerLine(_x20) {
      return ref.apply(this, arguments);
    };
  })();

  let editPowerLine = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var data = yield db.PowerLine.getById(id);
      forms.open("PowerLine", context.first(data));
      console.log("Что твм", context.first(data));
      loadPowerLineACLineSegmentList(id);
      //forms.createTable(tableName, acLineSegments, "ACLineSegment")
      linkClick("PowerLine-Geometry", function () {
        geometryView.loadGeometryProperty(context.first(data), "PowerLine-Geometry");
      });
    });

    return function editPowerLine(_x21) {
      return ref.apply(this, arguments);
    };
  })();

  let editJoint = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var data = yield db.Joint.getById(id);
      forms.open("Joint", context.first(data));
      linkClick("Joint-Geometry", function () {
        geometryView.loadGeometryProperty(context.first(data), "Joint-Geometry");
      });
    });

    return function editJoint(_x22) {
      return ref.apply(this, arguments);
    };
  })();

  let addPowerLineACLineSegment = (() => {
    var ref = _asyncToGenerator(function* (id, tableNameTo, tableNameFrom) {
      var _acLineSegment = null;
      var _acLineSegmentIds = [];
      var _acLineSegments = [];
      var _powerLine = null;

      db.ACLineSegment.getById(forms.getObjectID(tableNameFrom)).then(function (data) {
        _acLineSegment = context.first(data);
        var container = context.containerTemplate(id, _acLineSegment.attributes["OBJECTID"], "PowerLine", "ACLineSegment", carto.getFirstPointInLine(_acLineSegment.geometry));
        return db.EquipmentContainer.add(container);
      }).then(function () {
        return db.EquipmentContainer.get({ where: context.containerWhere('PowerLine', 'ACLineSegment', id, null) });
      }).then(function (data) {
        _acLineSegmentIds = featuresToArray(data, "chieldMRID");
        return db.ACLineSegment.getByArray(_acLineSegmentIds);
      }).then(function (data) {
        _acLineSegments = context.all(data);
        return db.PowerLine.getById(id);
      }).then(function (data) {
        _powerLine = context.first(data);
        _powerLine.geometry = carto.sumLineGeometry(_acLineSegments);
        forms.appendRowInTable(tableNameTo, _acLineSegment.attributes);
        forms.deleteRowInTable(tableNameFrom, _acLineSegment.attributes["OBJECTID"]);
        return db.PowerLine.set(_powerLine);
      });
    });

    return function addPowerLineACLineSegment(_x23, _x24, _x25) {
      return ref.apply(this, arguments);
    };
  })();

  let editACLineSegment = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var data = yield db.ACLineSegment.getById(id);
      forms.open("ACLineSegment", context.first(data));
      initACLineSegmentTabs(context.first(data));
    });

    return function editACLineSegment(_x26) {
      return ref.apply(this, arguments);
    };
  })();

  /**
   * Инициализирует загрузку соединений к ACLineSegment и элементов управления
   * @param id
   * @param terminalNumber
   */

  let loadACLineSegmentConnectionList = (() => {
    var ref = _asyncToGenerator(function* (id, terminalNumber) {
      var baseTable = "ACLineSegment-Connection-Current-" + terminalNumber;
      var candidateTable = "ACLineSegment-Connection-Candidate-List-" + terminalNumber;
      var candidateColumns = config.misc.ACLineSegment.Connectivity.candidatesTableColumns;

      bindClick("linkConnectionNodeCandidate" + terminalNumber, _asyncToGenerator(function* () {
        var candidateId = forms.getObjectID(candidateTable);
        var tableSelection = forms.getTableSelection(candidateTable);
        var candidateClassName = tableSelection.className;
        var isGetNominalVoltage = terminalNumber === 1;
        var candidate = yield acLineSegment.connectToCandidate(id, terminalNumber, candidateId, candidateClassName, isGetNominalVoltage);
        forms.clearTableData(baseTable);
        forms.createResultTable(baseTable, [candidate], candidateColumns);
        _getEditorLayer("ACLineSegment").refresh();
        _getEditorLayer("PowerLine").refresh();
      }));
      bindClick("relinkConnectionNode" + terminalNumber, _asyncToGenerator(function* () {
        var candidateId = forms.getObjectID(baseTable);
        var status = yield acLineSegment.disconnectFromCandidate(id, terminalNumber, candidateId);
        if (status) {
          forms.deleteRowInTable(baseTable, candidateId);
        }
      }));

      //возможные соединения
      var candidates = yield loadACLineSegmentCandidateList(id, terminalNumber);
      forms.createResultTable(candidateTable, candidates, candidateColumns);

      //текущие соединения
      var data = yield loadACLineSegmentCurrentConnection(id, terminalNumber);
      if (data.className) forms.createTable(baseTable, context.all(data.data), data.className);
    });

    return function loadACLineSegmentConnectionList(_x27, _x28) {
      return ref.apply(this, arguments);
    };
  })();

  /**
   * Возвращает имя класса и объекты, соединенные с сегментом / ACLineSegment
   * @param id
   * @param terminalNumber
   * @returns {{data: *, className: (string|null|string|exports.chieldClassName|{alias, group}|string|*)}}
   */

  let loadACLineSegmentCurrentConnection = (() => {
    var ref = _asyncToGenerator(function* (id, terminalNumber) {
      var data = yield db.AssetContainer.get({ where: "parentMRID=" + id + " AND parentClassName='ACLineSegment' AND localName='terminal" + terminalNumber + "'" });
      var feature = context.first(data);
      if (!feature) return { className: undefined, data: undefined };
      var chieldClassName = feature.attributes.chieldClassName;
      data = yield db[chieldClassName].get({ where: "OBJECTID=" + feature.attributes.chieldMRID });
      return {
        data: data,
        className: chieldClassName
      };
    });

    return function loadACLineSegmentCurrentConnection(_x29, _x30) {
      return ref.apply(this, arguments);
    };
  })();

  let loadACLineSegmentCandidateList = (() => {
    var ref = _asyncToGenerator(function* (id, terminalNumber) {
      var data = yield db.ACLineSegment.getById(id);
      var feature = context.first(data);
      var point = terminalNumber === 1 ? carto.getFirstPointInLine(feature.geometry) : carto.getLastPointInLine(feature.geometry);
      var candidateClasses = ["VoltageLevel", "ACLineSegment", "Switch", "Joint"];
      var candidates = candidateClasses.map((() => {
        var ref = _asyncToGenerator(function* (item) {
          return yield db[item].getByGeometry({ where: "1=1", geometry: point, distance: 1 });
        });

        return function (_x33) {
          return ref.apply(this, arguments);
        };
      })());
      var result = yield Promise.all(candidates);
      var features = [];
      for (var i = 0; i < candidateClasses.length; i++) {
        result[i].features.forEach(function (item) {
          var candidateColumns = config.misc.ACLineSegment.Connectivity.candidatesTableColumns;
          var attributes = { className: candidateClasses[i] };
          candidateColumns.forEach(function (element) {
            if (element.field != "className") attributes[element.field] = item.attributes[element.field];
          });
          features.push({ attributes: attributes, geometry: item.geometry });
        });
      }
      return features;
    });

    return function loadACLineSegmentCandidateList(_x31, _x32) {
      return ref.apply(this, arguments);
    };
  })();

  let linkACLineSegmentSwitch = (() => {
    var ref = _asyncToGenerator(function* (parentId, chieldId, tableNameTo, tableNameFrom) {
      var data = yield db.Switch.getById(chieldId);
      var chield = context.first(data);
      var container = generators.EquipmentContainer.default;
      container.geometry = chield.geometry;
      container.attributes.parentClassName = "ACLineSegment";
      container.attributes.chieldClassName = "Switch";
      container.attributes.parentMRID = parentId;
      container.attributes.chieldMRID = chieldId;
      var action = yield db.EquipmentContainer.add(container);
      if (action) {
        forms.appendRowInTable(tableNameTo, chield.attributes);
        forms.deleteRowInTable(tableNameFrom, chieldId);
      }
    });

    return function linkACLineSegmentSwitch(_x34, _x35, _x36, _x37) {
      return ref.apply(this, arguments);
    };
  })();

  let editStructure = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var data = yield db.Structure.getById(id);
      forms.open("Structure", context.first(data));
    });

    return function editStructure(_x38) {
      return ref.apply(this, arguments);
    };
  })();

  let editSwitch = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var data = yield db.Switch.getById(id);
      forms.open("Switch", context.first(data));
    });

    return function editSwitch(_x39) {
      return ref.apply(this, arguments);
    };
  })();

  let createVoltageLevel = (() => {
    var ref = _asyncToGenerator(function* (id, tableName) {
      var data = yield voltageLevel.create(id);
      forms.appendRowInTable(tableName, context.first(data).attributes);
    });

    return function createVoltageLevel(_x40, _x41) {
      return ref.apply(this, arguments);
    };
  })();

  let editVoltageLevel = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var data = yield voltageLevel.read(id);
      forms.open("VoltageLevel", context.first(data));
    });

    return function editVoltageLevel(_x42) {
      return ref.apply(this, arguments);
    };
  })();

  let deleteVoltageLevel = (() => {
    var ref = _asyncToGenerator(function* (id, tableName) {
      var action = yield voltageLevel.del(id);
      forms.deleteRowInTable(tableName, id);
      return action;
    });

    return function deleteVoltageLevel(_x43, _x44) {
      return ref.apply(this, arguments);
    };
  })();

  let loadSubstationErpAddressList = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var tableName = "Substation-ErpAddress-List";
      forms.createTable(tableName, [], "ErpAddress");

      bindClick("addSubstationErpAddress", function () {
        createErpAddress(id, tableName);
      });
      bindClick('editSubstationErpAddress', function () {
        editErpAddress(forms.getObjectID(tableName));
      });
      bindClick('deleteSubstationErpAddress', function () {
        deleteErpAddress(forms.getObjectID(tableName));
      });

      var data = yield db.Location.get({ where: "parentMRID = " + id + " AND parentClassName = 'Substation' AND chieldClassName = 'ErpAddress'" });
      var features = context.all(data);
      var ids = featuresPropertyToArray(features, "chieldMRID");
      data = yield db.ErpAddress.getByArray(ids);
      forms.loadTableData(tableName, featuresToArray(data));
    });

    return function loadSubstationErpAddressList(_x45) {
      return ref.apply(this, arguments);
    };
  })();

  let editErpAddress = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var data = yield db.ErpAddress.getById(id);
      forms.open("ErpAddress", context.first(data));
    });

    return function editErpAddress(_x46) {
      return ref.apply(this, arguments);
    };
  })();

  var context = new model({ url: "", className: "context", map: map });

  function getClickHandler(id) {
    var alias = id;
    if (alias.indexOf("Substation") != -1) alias = "Substation";
    if (alias.indexOf("Structure") != -1) alias = "Structure";

    var handlers = {
      SurfaceFacility: function (data) {
        forms.open("SurfaceFacility", data.graphic);
        loadClassNameDocumentList(id, "SurfaceFacility");
      },
      Building: function (data) {
        forms.open("Building", data.graphic);
        loadClassNameDocumentList(id, "Building");
      },
      Railroad: function (data) {
        forms.open("Railroad", data.graphic);
        loadClassNameDocumentList(id, "Road");
      },
      Road: function (data) {
        forms.open("Road", data.graphic);
        loadClassNameDocumentList(id, "Road");
      },
      UndergroundFacility: function (data) {
        forms.open("UndergroundFacility", data.graphic);
        loadClassNameDocumentList(id, "UndergroundFacility");
      }
    };
    return handlers[alias];
  }

  function getEditorHandler(id) {
    var handlers = {
      /*Substation: function (data) {
       var adds = data.adds;
       /!** @namespace data.updates *!/
       var updates = data.updates;
       /!** @namespace data.deletes *!/
       var deletes = data.deletes;
       
       _addItem(adds);
       _deleteItem(deletes);
       _updateItem(updates);
       
       function _addItem(data) {
       if (data.length == 0) return;
       var id = data[0].objectId;
       var feature = null;
       substation
       .read(id)
       .then(function (data) {
       feature = context.first(data);
       var substationView = feature.attributes["substationView"];
       switch (substationView) {
       case "Трансформаторная подстанция":
       return substation.createDefaultEquipment(id);
       break;
       case "Распределительная трансформаторная подстанция":
       return substation.createDefaultEquipment(id);
       break;
       default:
       return substation.read(id);
       break;
       }
       })
       .then(function () {
       forms.open("Substation", feature);
       initSubstationTabs(feature);
       });
       }
       
       function _deleteItem(data) {
       if (data.length == 0) return;
       var id = data[0].objectId;
       substation.deleteChields(id);
       forms.hideWindow("Substation");
       forms.showNotify("удаляются связанные объекты с ПС (ТП)", "info");
       forms.showNotify("удаление ПС (ТП) завершено", "info");
       }
       
       function _updateItem(data) {
       if (data.length == 0) return;
       onModifyFeature(data);
       }
       
       function onModifyFeature(data) {
       if (data.length == 0) return;
       var objectId = data[0].objectId;
       var feature = null;
       var voltageLevels = [];
       var powerTransformers = [];
       substation.read(objectId)
       .then(function (data) {
       feature = context.first(data);
       forms.open("Substation", feature);
       initSubstationTabs(feature);
       return db.EquipmentContainer.get({where: context.containerWhere("Substation", "VoltageLevel", objectId, null)})
       })
       .then(function (data) {
       return db.VoltageLevel.getByArray(featuresToArray(data, "chieldMRID"))
       })
       .then(function (data) {
       voltageLevels = context.all(data);
       return db.EquipmentContainer.get({where: context.containerWhere("Substation", "PowerTransformer", objectId, null)})
       })
       .then(function (data) {
       var ptIds = featuresToArray(data, "chieldMRID");
       return db.PowerTransformer.getByArray(ptIds);
       })
       .then(function (data) {
       powerTransformers = context.all(data);
       voltageLevels = context.updateFeaturesGeometry(voltageLevels, feature.geometry);
       powerTransformers = context.updateFeaturesGeometry(powerTransformers, feature.geometry);
       db.VoltageLevel.setArray(voltageLevels);
       db.PowerTransformer.setArray(powerTransformers);
       for (var i = 0; i < voltageLevels.length; i++) {
       acLineSegment.updateByVoltageLevel(voltageLevels[i]);
       }
       })
       }
       },
       ACLineSegment: function (data) {
       var adds = data.adds;
       var updates = data.updates;
       var deletes = data.deletes;
       var actionType = false;
       
       _addItem(adds);
       _deleteItem(deletes);
       _updateItem(updates);
       
       function _addItem(data) {
       if (data.length == 0) return;
       actionType = "add";
       onModifyFeature(data);
       }
       
       function _deleteItem(data) {
       if (data.length == 0) return false;
       }
       
       function _updateItem(data) {
       if (data.length == 0) return;
       actionType = "update";
       onModifyFeature(data);
       }
       
       function onModifyFeature(data) {
       if (data.length == 0) return;
       var objectId = data[0].objectId;
       acLineSegment.read(objectId)
       .then(function (featureSet) {
       var feature = context.first(featureSet);
       var isGenerateTower = $('#edit-options-generate-tower').prop('checked');
       if ((isGenerateTower == true) && (actionType == "add")) {
       acLineSegment.generateStructures(feature, forms.getTableSelection("Structure-Generate-Option-List")["sequenceName"]);
       }
       
       var isGeneratePowerLine = $('#edit-options-create-powerLine').prop('checked');
       if ((isGeneratePowerLine == true) && (actionType == "add")) _generatePowerLine(feature);
       
       forms.open("ACLineSegment", feature);
       initACLineSegmentTabs(feature);
       acLineSegment.updateParent(feature);
       });
       
       function _generatePowerLine(feature) {
       var id = context.key(feature);
       db.EquipmentContainer.get({where: context.containerWhere("PowerLine", "ACLineSegment", null, id)})
       .then(function (data) {
       var containers = context.all(data);
       if (containers.length == 0) {
       var powerLine = generators.PowerLine.default;
       powerLine.geometry = feature.geometry;
       return db.PowerLine.add(powerLine)
       }
       })
       .then(function (data) {
       var powerLineId = data[0][0].objectId;
       var container = context.containerTemplate(powerLineId, id, "PowerLine", "ACLineSegment", carto.getFirstPointInLine(feature.geometry));
       return db.EquipmentContainer.add(container);
       })
       }
       
       }
       },
       VoltageLevel: function (data) {
       var adds = data.adds;
       var updates = data.updates;
       var deletes = data.deletes;
       
       _addItem(adds);
       _deleteItem(deletes);
       _updateItem(updates);
       
       function _addItem(data) {
       if (data.length == 0) return false;
       }
       
       function _deleteItem(data) {
       if (data.length == 0) return false;
       forms.hideNode(forms.getNodeName("VoltageLevel"));
       }
       
       function _updateItem(data) {
       if (data.length == 0) return false;
       onModifyFeature(data);
       }
       
       function onModifyFeature(data) {
       if (data.length == 0) return;
       var objectId = data[0].objectId;
       voltageLevel.read(objectId)
       .then(function (data) {
       var feature = context.first(data);
       forms.open("VoltageLevel", feature);
       })
       }
       },
       Structure: function (data) {
       var adds = data.adds;
       var updates = data.updates;
       var deletes = data.deletes;
       
       _addItem(adds);
       _deleteItem(deletes);
       _updateItem(updates);
       
       function _addItem(data) {
       if (data.length == 0) return false;
       }
       
       function _deleteItem(data) {
       if (data.length == 0) return;
       forms.hideNode(forms.getNodeName("Structure"));
       }
       
       function _updateItem(data) {
       if (data.length == 0) return;
       onModifyFeature(data);
       }
       
       function onModifyFeature(data) {
       if (data.length == 0) return;
       var id = data[0].objectId;
       var feature = null;
       var acLineSegmentIds = [];
       var equipmentContainers = [];
       var acLineSegments = [];
       var prevStructure = null;
       db.Structure
       .getById(id)
       .then(function (data) {
       feature = context.first(data);
       return db.EquipmentContainer.get({where: "parentClassName='ACLineSegment' AND chieldClassName='Structure' and chieldMRID=" + id})
       })
       .then(function (data) {
       equipmentContainers = context.all(data);
       prevStructure = context.first(data);
       acLineSegmentIds = featuresToArray(data, "parentMRID");
       return db.ACLineSegment.getByArray(acLineSegmentIds)
       })
       .then(function (data) {
       acLineSegments = context.all(data);
       for (let i = 0; i < acLineSegments.length; i++) {
       acLineSegments[i].geometry = carto.updateLineByPoint(acLineSegments[i].geometry, prevStructure.geometry, feature.geometry);
       _updateLayerByFeature("ACLineSegment", acLineSegments[i], "OBJECTID");
       }
       for (var i = 0; i < equipmentContainers.length; i++) {
       equipmentContainers[i].geometry = feature.geometry;
       }
       return db.ACLineSegment.setArray(acLineSegments);
       })
       .then(function () {
       return db.EquipmentContainer.setArray(equipmentContainers);
       })
       .then(function () {
       var ids = acLineSegments.map(function (item) {
       return item.attributes.OBJECTID;
       });
       ids = "chieldMRID=" + ids.join(" OR chieldMRID=");
       return db.EquipmentContainer.get({where: "parentClassName='PowerLine' AND chieldClassName='ACLineSegment' AND (" + ids + ")"});
       })
       .then(function (data) {
       var powerLineContainers = context.all(data);
       var segments = {};
       for (var i = 0; i < powerLineContainers.length; i++) {
       var attributes = powerLineContainers[i].attributes;
       if (segments[attributes.parentMRID] === undefined) segments[attributes.parentMRID] = attributes.chieldMRID;
       }
       for (var segment in segments) {
       db.ACLineSegment.getById(segments[segment]).then(function (data) {
       var _segment = context.first(data);
       acLineSegment.updateParent(_segment);
       })
       }
       });
       }
       },
       Switch: function (data) {
       var adds = data.adds;
       var updates = data.updates;
       var deletes = data.deletes;
       
       _addItem(adds);
       _deleteItem(deletes);
       _updateItem(updates);
       
       function _addItem(data) {
       if (data.length == 0) return false;
       }
       
       function _deleteItem(data) {
       if (data.length == 0) return;
       forms.hideNode(forms.getNodeName("Switch"));
       }
       
       function _updateItem(data) {
       if (data.length == 0) return;
       onModifyFeature(data);
       }
       
       function onModifyFeature(data) {
       if (data.length == 0) return;
       var id = data[0].objectId;
       var feature = null;
       var acLineSegmentIds = [];
       var equipmentContainers = [];
       var acLineSegments = [];
       var prevSwitch = null;
       db.Switch
       .getById(id)
       .then(function (data) {
       feature = context.first(data);
       return db.EquipmentContainer.get({where: "parentClassName='ACLineSegment' AND chieldClassName='Switch' and chieldMRID=" + id})
       })
       .then(function (data) {
       equipmentContainers = context.all(data);
       prevSwitch = context.first(data);
       acLineSegmentIds = featuresToArray(data, "parentMRID");
       return db.ACLineSegment.getByArray(acLineSegmentIds)
       })
       .then(function (data) {
       acLineSegments = context.all(data);
       for (let i = 0; i < acLineSegments.length; i++) {
       acLineSegments[i].geometry = carto.updateLineByPoint(acLineSegments[i].geometry, prevSwitch.geometry, feature.geometry);
       _updateLayerByFeature("ACLineSegment", acLineSegments[i], "OBJECTID");
       }
       for (let i = 0; i < equipmentContainers.length; i++) {
       equipmentContainers[i].geometry = feature.geometry;
       }
       return db.ACLineSegment.setArray(acLineSegments);
       })
       .then(function () {
       return db.EquipmentContainer.setArray(equipmentContainers);
       })
       .then(function () {
       acLineSegment.updateParent(acLineSegments[0]);
       })
       }
       },
       CustomerErpPerson: function (data) {
       var adds = data.adds;
       var updates = data.updates;
       var deletes = data.deletes;
       
       _addItem(adds);
       _deleteItem(deletes);
       _updateItem(updates);
       
       function _addItem(data) {
       if (data.length == 0) return false;
       }
       
       function _deleteItem(data) {
       if (data.length == 0) return;
       forms.hideWindow(forms.getNodeName("CustomerErpPerson"));
       }
       
       function _updateItem(data) {
       if (data.length == 0) return;
       onModifyFeature(data);
       }
       
       function onModifyFeature(data) {
       if (data.length == 0) return;
       var id = data[0].objectId;
       //получаем объект
       var feature;
       db.CustomerErpPerson.getById(id)
       .then(function (data) {
       feature = context.first(data);
       return db.EquipmentContainer.get({where: context.containerWhere("CustomerErpPerson", "VoltageLevel", id)})
       })
       .then(function (data) {
       var ids = data.features.map(function (item) {
       return item.attributes.chieldMRID;
       });
       return db.VoltageLevel.getByArray(ids);
       })
       .then(function (data) {
       var voltageLevels = context.all(data);
       voltageLevels = context.updateFeaturesGeometry(voltageLevels, feature.geometry);
       db.VoltageLevel.setArray(voltageLevels);
       for (var i = 0; i < voltageLevels.length; i++) {
       acLineSegment.updateByVoltageLevel(voltageLevels[i]);
       }
       })
       }
       },
       CustomerOrganisation: function (data) {
       var adds = data.adds;
       var updates = data.updates;
       var deletes = data.deletes;
       
       _addItem(adds);
       _deleteItem(deletes);
       _updateItem(updates);
       
       function _addItem(data) {
       if (data.length == 0) return false;
       }
       
       function _deleteItem(data) {
       if (data.length == 0) return;
       forms.hideWindow(forms.getNodeName("CustomerOrganisation"));
       }
       
       function _updateItem(data) {
       if (data.length == 0) return;
       onModifyFeature(data);
       }
       
       function onModifyFeature(data) {
       if (data.length == 0) return;
       var id = data[0].objectId;
       //получаем объект
       var feature;
       db.CustomerOrganisation.getById(id)
       .then(function (data) {
       feature = context.first(data);
       return db.EquipmentContainer.get({where: context.containerWhere("CustomerOrganisation", "VoltageLevel", id)})
       })
       .then(function (data) {
       var ids = data.features.map(function (item) {
       return item.attributes.chieldMRID;
       });
       return db.VoltageLevel.getByArray(ids);
       })
       .then(function (data) {
       var voltageLevels = context.all(data);
       voltageLevels = context.updateFeaturesGeometry(voltageLevels, feature.geometry);
       db.VoltageLevel.setArray(voltageLevels);
       for (var i = 0; i < voltageLevels.length; i++) {
       acLineSegment.updateByVoltageLevel(voltageLevels[i]);
       }
       })
       }
       }*/
    };
    return handlers[id];
  }

  function initFeatureTable(className) {
    var tableName = className + "-List";
    db[className].get({ where: "1=1" }).then(function (data) {
      forms.createTable(tableName, context.all(data), className);
    });
  }

  function loadPowerLineList() {
    var tableName = "PowerLine-List";
    bindClick("addPowerLine", function () {
      addPowerLine(tableName);
    });
    bindClick("editPowerLine", function () {
      editPowerLine(forms.getObjectID(tableName));
    });
    bindClick("deletePowerLine", function () {
      deletePowerLine(forms.getObjectID(tableName), tableName);
    });
    initFeatureTable("PowerLine");
  }

  function loadSubstationList() {
    var tableName = "Substation-List";
    bindClick("addSubstation", function () {
      addSubstation(tableName);
    });
    bindClick("editSubstation", function () {
      editSubstation(forms.getObjectID(tableName));
    });
    bindClick("deleteSubstation", function () {
      deleteSubstation(forms.getObjectID(tableName), tableName);
    });
    initFeatureTable("Substation");
  }

  function initCustomerErpPersonTabs(data) {
    var id = context.key(data);
    loadCustomerVoltageLevelList(id, "CustomerErpPerson");
    loadCustomerPowerCircuitList(id, "CustomerErpPerson");
  }

  function initCustomerOrganisationTabs(data) {
    var id = context.key(data);
    loadCustomerVoltageLevelList(id, "CustomerOrganisation");
    loadCustomerPowerCircuitList(id, "CustomerOrganisation");
  }

  function initSACEventListTabs(data) {
    loadSACEventListErpPersonList(context.key(data));
    loadClassNameDocumentList(context.key(data), "SACEventList");
  }function initSACEventTabs(data) {
    loadSACEventListChieldClassNameList(context.key(data), "CustomerOrganisation", "площадка мероприятия");
    loadSACEventListChieldClassNameList(context.key(data), "CustomerErpPerson", "площадка мероприятия");
    loadSACEventListChieldClassNameList(context.key(data), "EnergySource", "РИСЭ");
    loadSACEventListChieldClassNameList(context.key(data), "Crew", "бригада");
    loadSACEventListChieldClassNameList(context.key(data), "StorageFacility", "склад аварийного резерва");
    loadSACEventListChieldClassNameList(context.key(data), "GuardCrew", "патрульная группа");
    loadSACEventListChieldClassNameList(context.key(data), "GuardFacility", "пост охраны");
    loadSACEventListChieldClassNameList(context.key(data), "Organisation", "подрядная организация");
    loadSACEventListChieldClassNameList(context.key(data), "Vehicle", "автотранспорт");
    loadSACEventListChieldClassNameList(context.key(data), "Substation", "площадка мероприятия");
    loadClassNameDocumentList(context.key(data), "SACEvent");
  }

  function loadClassNameDocumentList(id, className) {
    var tableName = className + "-" + "Document" + "-List";
    forms.createTable(tableName, [], "Document");

    initAddFile(className, id);

    function initAddFile(_className, _id) {
      var feature;
      var document;
      forms.getUpload("add" + _className + "Document", config.documents.saveUrl + "?className=" + _className + "&id=" + _id).then(function (data) {
        var filesData = data;
        initAddFile(_className, _id);
        return db[className].getById(_id).then(function (data) {
          feature = context.first(data);
          document = generators.Document.default;
          document.attributes.name = filesData[0].name;
          document.attributes.docTitle = filesData[0].name;
          document.attributes.docType = "прочее";
          document.attributes.docStatus = "действующий";
          document.attributes.pathName = config.documents.documentsUrl + "/" + _className + "/" + _id + "/" + filesData[0].name;
          document.geometry = feature.geometry;
          return db.Document.add(document);
        }).then(function (data) {
          return db.Document.getById(data[0][0].objectId);
        }).then(function (data) {
          document = context.first(data);
          var container = {
            attributes: {
              parentMRID: _id,
              chieldMRID: document.attributes["OBJECTID"],
              parentClassName: _className,
              chieldClassName: "Document"
            },
            geometry: null
          };
          return db.DocumentIdentificationObjectRole.add(container);
        }).then(function () {
          forms.appendRowInTable(tableName, document.attributes);
        });
      });
    }

    bindClick("edit" + className + "Document", function () {
      var featureId = forms.getTableSelection(tableName)["OBJECTID"];
      return db.Document.getById(featureId).then(function (data) {
        forms.open("Document", context.first(data));
      });
    });

    bindClick("delete" + className + "Document", function () {
      var features = forms.getTableRows(tableName);
      var ids = features.map(function (item) {
        return item.OBJECTID;
      });
      for (var i = 0; i < ids.length; i++) {
        db.Document.delById(ids[i]);
        db.DocumentIdentificationObjectRole.get({ where: "parentClassName='" + className + "' AND chieldClassName='Document' AND parentMRID=" + id + " AND chieldMRID=" + ids[i] }).then(function (data) {
          var keyId = context.key(context.first(data));
          db.DocumentIdentificationObjectRole.delById(keyId);
        });
        forms.deleteRowInTable(tableName, ids[i]);
      }
    });

    db.DocumentIdentificationObjectRole.get({ where: "parentClassName='" + className + "' AND chieldClassName='Document' AND parentMRID=" + id }).then(function (data) {
      var features = context.all(data);
      var ids = features.map(function (item) {
        return item.attributes.chieldMRID;
      });
      return db.Document.getByArray(ids);
    }).then(function (data) {
      forms.createDocumentsTable(tableName, featuresToArray(data), "Document");
    });
  }

  function initSubstationTabs(data) {
    var id = context.key(data);
    linkClick("Substation-VoltageLevel", function () {
      loadSubstationVoltageLevelList(id);
    });
    linkClick("Substation-PowerTransformer", function () {
      loadSubstationPowerTransformerList(id);
    });
    linkClick("Substation-PowerLine", function () {
      loadSubstationPowerLineList(id);
    });
    linkClick("Substation-MeasurementControl", function () {
      loadSubstationMeasurementControlList(id);
    });
    linkClick("Substation-ErpAddress", function () {
      loadSubstationErpAddressList(id);
    });
    linkClick("Substation-Document", function () {
      loadClassNameDocumentList(id, "Substation");
    });
    linkClick("Substation-Geometry", function () {
      geometryView.loadGeometryProperty(data, "Substation-Geometry");
    });
  }

  function editSubstation(id) {
    substation.read(id).then(function (data) {
      forms.open("Substation", context.first(data));
      initSubstationTabs(context.first(data));
    });
  }

  function deleteSubstation(id, tableName) {
    substation.del(id).then(function () {
      forms.deleteRowInTable(tableName, id);
    });
  }

  function deletePowerLine(id, tableName) {
    db.PowerLine.delById(id);
    forms.deleteRowInTable(tableName, id);
  }

  function loadPowerLineACLineSegmentList(id) {
    var tableName = "PowerLine-ACLineSegment-List";
    var tableNameSelected = "PowerLine-ACLineSegment-Select-List";
    var kmlBtn = "ACLineSegment-KML";
    forms.createTable(tableName, [], "ACLineSegment");
    updatePowerLineACLineSegment(tableNameSelected);

    bindClick("addPowerLineACLineSegment", function () {
      addPowerLineACLineSegment(id, tableName, tableNameSelected);
    });
    bindClick("editPowerLineACLineSegment", function () {
      editACLineSegment(forms.getObjectID(tableName));
    });
    bindClick("deletePowerLineACLineSegment", function () {
      deletePowerLineACLineSegment(id, forms.getObjectID(tableName), tableName);
    });
    bindClick("updatePowerLineACLineSegment", function () {
      updatePowerLineACLineSegment(tableNameSelected);
    });
    bindClick(kmlBtn, function () {
      carto.exportFeaturesToKML(tableName, "ACLineSegment");
    });
    acLineSegment.allByParent(id).then(function (data) {
      forms.loadTableData(tableName, featuresToArray(data));
    });
  }

  function deletePowerLineACLineSegment(parentId, chieldId, tableName) {
    var acLineSegmentIds = [];
    var acLineSegments = [];
    var powerLine = null;
    db.EquipmentContainer.get({ where: context.containerWhere("PowerLine", "ACLineSegment", parentId, null) }).then(function (data) {
      var ids = featuresToArray(data, "chieldMRID");
      if (ids.length == 1) {
        alert("Не пытайтесь удалить последний сегмент из ЛЭП");
        return true;
      }
      return db.EquipmentContainer.get({ where: "parentMRID=" + parentId + " AND chieldMRID=" + chieldId + " AND parentClassName='PowerLine' AND chieldClassName='ACLineSegment'" });
    }).then(function (data) {
      var container = context.first(data);
      return db.EquipmentContainer.delById(container.attributes["OBJECTID"]);
    }).then(function () {
      return db.EquipmentContainer.get({ where: "parentMRID=" + parentId + " AND parentClassName='PowerLine' AND chieldClassName='ACLineSegment'" });
    }).then(function (data) {
      acLineSegmentIds = featuresToArray(data, "chieldMRID");
      return db.ACLineSegment.getByArray(acLineSegmentIds);
    }).then(function (data) {
      acLineSegments = context.all(data);
      return db.PowerLine.getById(parentId);
    }).then(function (data) {
      powerLine = context.first(data);
      powerLine.geometry = carto.sumLineGeometry(acLineSegments);
      forms.deleteRowInTable(tableName, chieldId);
      return db.PowerLine.set(powerLine);
    }).then(function (data) {
      console.log(data);
    });
  }

  function updatePowerLineACLineSegment(tableName) {
    //noinspection JSUnresolvedFunction
    var features = _getEditorLayer("ACLineSegment").getSelectedFeatures();
    forms.createTable(tableName, features, "ACLineSegment");
  }

  function initACLineSegmentTabs(data) {
    var id = context.key(data);
    linkClick("ACLineSegment-Structure", function () {
      loadACLineSegmentStructureList(id);
    });
    linkClick("ACLineSegment-Switch", function () {
      loadACLineSegmentSwitchList(id);
    });
    linkClick("ACLineSegment-Connection-1", function () {
      loadACLineSegmentConnectionList(id, 1);
    });
    linkClick("ACLineSegment-Connection-2", function () {
      loadACLineSegmentConnectionList(id, 2);
    });
    linkClick("ACLineSegment-Document", function () {
      loadClassNameDocumentList(id, "ACLineSegment");
    });

    linkClick("ACLineSegment-Geometry", function () {
      geometryView.loadGeometryProperty(data, "ACLineSegment-Geometry");
    });
  }

  function loadACLineSegmentStructureList(id) {
    var tableNameEquipment = "ACLineSegment-Structure-List";
    var tableNameIntersection = "ACLineSegment-Structure-Intersects-List";
    var btnKML = "ACLineSegment-Structure-List-KML";

    forms.createTable(tableNameEquipment, [], "Structure");
    forms.createTable(tableNameIntersection, [], "Structure");

    bindClick(btnKML, function () {
      carto.exportFeaturesToKML(tableNameEquipment, "Structure");
    });

    bindClick("editACLineStructure", function () {
      editStructure(forms.getObjectID(tableNameEquipment));
    });
    bindClick("linkACLineSegmentStructure", function () {
      var ids = forms.getObjectIDS(tableNameIntersection);
      for (var i = 0; i < ids.length; i++) {
        linkACLineSegmentStructure(id, ids[i], tableNameEquipment, tableNameIntersection);
      }
    });
    bindClick("relinkACLineSegmentStructure", function () {
      var ids = forms.getObjectIDS(tableNameEquipment);
      for (var i = 0; i < ids.length; i++) {
        relinkACLineSegmentStructure(id, ids[i], tableNameEquipment, tableNameIntersection);
      }
    });

    var disjoinedStructureList = [];
    var joinedStructureList = [];
    var equipmentIds = [];

    //опоры по EquipmentContainer
    db.EquipmentContainer.get({
      where: "parentMRID = " + id + " AND parentClassName = 'ACLineSegment' AND chieldClassName = 'Structure'"
    }).then(function (data) {
      var features = context.all(data);
      equipmentIds = featuresPropertyToArray(features, "chieldMRID");
      db.Structure.getByArray(equipmentIds).then(function (data) {
        joinedStructureList = context.all(data);
        //forms.createTable(tableNameEquipment, joinedStructureList, "Structure");
        forms.loadTableData(tableNameEquipment, featuresToArray(data));
      }).always(function () {
        //опоры по пересечению
        db.ACLineSegment.getById(id).then(function (data) {
          var geometry = context.first(data).geometry;
          return db.Structure.getByGeometry({ where: "1=1", geometry: geometry });
        }).then(function (data) {
          var intersectStructureList = context.all(data);
          for (let i = 0; i < intersectStructureList.length; i++) {
            intersectStructureList[i]["JOINED"] = false;
            for (let j = 0; j < joinedStructureList.length; j++) {
              if (intersectStructureList[i].attributes["OBJECTID"] == joinedStructureList[j].attributes["OBJECTID"]) {
                intersectStructureList[i]["JOINED"] = true;
              }
            }
          }
          for (let i = 0; i < intersectStructureList.length; i++) {
            if (intersectStructureList[i]["JOINED"] == false) {
              disjoinedStructureList.push(intersectStructureList[i]);
            }
          }
          var tableData = { features: disjoinedStructureList };
          //forms.createTable(tableNameIntersection, tableData, "Structure");
          forms.loadTableData(tableNameIntersection, featuresToArray(tableData));
        });
      });
    });
  }

  function linkACLineSegmentStructure(parentId, chieldId, tableNameTo, tableNameFrom) {
    var chield = null;
    var container = null;
    db.Structure.getById(chieldId).then(function (data) {
      chield = context.first(data);
      return acLineSegment.read(parentId);
    }).then(function () {
      container = context.containerTemplate(parentId, chieldId, "ACLineSegment", "Structure", chield.geometry);
      return db.EquipmentContainer.add(container);
    }).then(function () {
      forms.appendRowInTable(tableNameTo, chield.attributes);
      forms.deleteRowInTable(tableNameFrom, chieldId);
    });
  }

  function relinkACLineSegmentStructure(parentId, chieldId, tableNameTo, tableNameFrom) {
    db.EquipmentContainer.get({ where: "parentMRID = " + parentId + " AND chieldMRID=" + chieldId + " AND parentClassName = 'ACLineSegment' AND chieldClassName = 'Structure'" }).then(function (data) {
      var id = context.key(context.first(data));
      db.EquipmentContainer.delById(id);
      forms.deleteRowInTable(tableNameTo, chieldId);
      db.Structure.getById(chieldId).then(function (data) {
        var feature = context.first(data);
        forms.appendRowInTable(tableNameFrom, feature.attributes);
      });
    });
  }

  function loadACLineSegmentSwitchList(id) {
    var tableNameEquipment = "ACLineSegment-Switch-List";
    var tableNameIntersection = "ACLineSegment-Switch-Intersects-List";
    var switchBtnKML = "ACLineSegment-Switch-List-KML";
    forms.createTable(tableNameEquipment, [], "Switch");
    forms.createTable(tableNameIntersection, [], "Switch");

    bindClick(switchBtnKML, function () {
      carto.exportFeaturesToKML(tableNameEquipment, "Switch");
    });

    bindClick("editACLineSwitch", function () {
      editSwitch(forms.getObjectID(tableNameEquipment));
    });
    bindClick("linkACLineSegmentSwitch", function () {
      linkACLineSegmentSwitch(id, forms.getObjectID(tableNameIntersection), tableNameEquipment, tableNameIntersection);
    });
    bindClick("relinkACLineSegmentSwitch", function () {
      relinkACLineSegmentSwitch(id, forms.getObjectID(tableNameEquipment), tableNameEquipment, tableNameIntersection);
    });

    var disjoinedSwitchList = [];
    var joinedSwitchList = [];
    var equipmentIds = [];

    //опоры по EquipmentContainer
    db.EquipmentContainer.get({
      where: "parentMRID = " + id + " AND parentClassName = 'ACLineSegment' AND chieldClassName = 'Switch'"
    }).then(function (data) {
      var features = context.all(data);
      equipmentIds = featuresPropertyToArray(features, "chieldMRID");
      db.Switch.getByArray(equipmentIds).then(function (data) {
        joinedSwitchList = context.all(data);
        forms.loadTableData(tableNameEquipment, featuresToArray(data));
      }).always(function () {
        //опоры по пересечению
        db.ACLineSegment.getById(id).then(function (data) {
          var geometry = context.first(data).geometry;
          return db.Switch.getByGeometry({ where: "1=1", geometry: geometry });
        }).then(function (data) {
          var intersectSwitchList = context.all(data);
          for (let i = 0; i < intersectSwitchList.length; i++) {
            intersectSwitchList[i]["JOINED"] = false;
            for (let j = 0; j < joinedSwitchList.length; j++) {
              if (intersectSwitchList[i].attributes["OBJECTID"] == joinedSwitchList[j].attributes["OBJECTID"]) {
                intersectSwitchList[i]["JOINED"] = true;
              }
            }
          }
          for (let i = 0; i < intersectSwitchList.length; i++) {
            if (intersectSwitchList[i]["JOINED"] == false) {
              disjoinedSwitchList.push(intersectSwitchList[i]);
            }
          }
          var tableData = { features: disjoinedSwitchList };
          forms.loadTableData(tableNameIntersection, featuresToArray(tableData));
        });
      });
    });
  }

  function relinkACLineSegmentSwitch(parentId, chieldId, tableNameTo, tableNameFrom) {
    db.EquipmentContainer.get({ where: "parentMRID = " + parentId + " AND chieldMRID=" + chieldId + " AND parentClassName = 'ACLineSegment' AND chieldClassName = 'Switch'" }).then(function (data) {
      var id = context.key(context.first(data));
      db.EquipmentContainer.delById(id);
      forms.deleteRowInTable(tableNameTo, chieldId);
      db.Switch.getById(chieldId).then(function (data) {
        var feature = context.first(data);
        forms.appendRowInTable(tableNameFrom, feature.attributes);
      });
    });
  }

  function loadSubstationVoltageLevelList(id) {
    var tableName = "Substation-VoltageLevel-List";
    forms.createTable(tableName, [], "VoltageLevel");

    bindClick("addVoltageLevel", function () {
      createVoltageLevel(id, tableName);
    });
    bindClick('editVoltageLevel', function () {
      editVoltageLevel(forms.getObjectID(tableName));
    });
    bindClick('deleteVoltageLevel', function () {
      deleteVoltageLevel(forms.getObjectID(tableName), tableName);
    });

    db.EquipmentContainer.get({
      where: "parentMRID = " + id + " AND parentClassName = 'Substation' AND chieldClassName = 'VoltageLevel'"
    }).then(function (data) {
      var features = context.all(data);
      var ids = featuresPropertyToArray(features, "chieldMRID");
      db.VoltageLevel.getByArray(ids).then(function (data) {
        forms.loadTableData(tableName, featuresToArray(data));
      });
    });
  }

  function createErpAddress(id, tableName) {
    var substation = {};
    db.Substation.getById(id).then(function (data) {
      substation = context.first(data);
      var graphic = { geometry: substation.geometry, attributes: generators.ErpAddress.default };
      db.ErpAddress.add(graphic).then(function (data) {
        return db.ErpAddress.getByData(data);
      }).then(function (data) {
        var feature = context.first(data);
        forms.appendRowInTable(tableName, feature.attributes);

        var location = graphic;
        location.attributes.parentMRID = id;
        location.attributes.chieldMRID = feature.attributes["OBJECTID"];
        location.attributes.parentClassName = "Substation";
        location.attributes.chieldClassName = "ErpAddress";
        db.Location.add(location).then(function (data) {});
      });
    });
  }

  function deleteErpAddress(id) {
    db.Location.get({ where: "chieldMRID = " + id + " AND chieldClassName='ErpAddress' AND parentClassName='Substation'" }).then(function (data) {
      return db.Location.delById(context.key(context.first(data)));
    }).then(function () {
      return db.ErpAddress.delById(id);
    }).then(function () {
      forms.deleteRowInTable("Substation-ErpAddress-List", id);
    });
  }

  function loadSubstationPowerTransformerList(id) {
    var tableName = "Substation-PowerTransformer-List";

    forms.createTable(tableName, [], "PowerTransformer");

    bindClick("addPowerTransformer", function () {
      createPowerTransformer(id, tableName);
    });
    bindClick('editPowerTransformer', function () {
      editPowerTransformer(forms.getObjectID(tableName));
    });
    bindClick('deletePowerTransformer', function () {
      deletePowerTransformer(forms.getObjectID(tableName), tableName);
    });

    db.EquipmentContainer.get({
      where: "parentMRID = " + id + " AND parentClassName = 'Substation' AND chieldClassName = 'PowerTransformer'"
    }).then(function (data) {
      var features = context.all(data);
      var ids = featuresPropertyToArray(features, "chieldMRID");
      db.PowerTransformer.getByArray(ids).then(function (data) {
        forms.loadTableData(tableName, featuresToArray(data));
      });
    });
  }

  function createPowerTransformer(id, tableName) {
    powerTransformer.create(id).then(function (data) {
      forms.appendRowInTable(tableName, context.first(data).attributes);
    });
  }

  function editPowerTransformer(id) {
    powerTransformer.read(id).then(function (data) {
      var feature = context.first(data);
      forms.open("PowerTransformer", feature);
      loadPowerTransformerMeasurementControlList(context.key(feature));
    });
  }

  function deletePowerTransformer(id, tableName) {
    powerTransformer.del(id).then(function () {
      forms.deleteRowInTable(tableName, id);
    });
  }

  function loadSubstationPowerLineList(id) {
    var tableName = "Substation-PowerLine-List";
    return db.EquipmentContainer.get({ where: "parentClassName='Substation' AND chieldClassName='VoltageLevel' AND parentMRID=" + id }).then(function (data) {
      var features = context.all(data);
      var ids = features.map(function (item) {
        return item.attributes.chieldMRID;
      });
      ids = "chieldMRID=" + ids.join(" OR chieldMRID=");
      return db.AssetContainer.get({ where: "parentClassName='ACLineSegment' AND chieldClassName='VoltageLevel' AND " + ids });
    }).then(function (data) {
      var features = context.all(data);
      var ids = features.map(function (item) {
        return item.attributes.parentMRID;
      });
      ids = "chieldMRID=" + ids.join(" OR chieldMRID=");
      return db.EquipmentContainer.get({ where: "parentClassName='PowerLine' AND chieldClassName='ACLineSegment' AND " + ids });
    }).then(function (data) {
      var features = context.all(data);
      var ids = features.map(function (item) {
        return item.attributes.parentMRID;
      });
      ids = "OBJECTID=" + ids.join(" OR OBJECTID=");
      return db.PowerLine.get({ where: ids });
    }).then(function (data) {
      forms.createTable(tableName, data.features, "PowerLine");
    });
  }

  function loadSubstationMeasurementControlList(id) {
    var tableName = "Substation-MeasurementControl-List";
    forms.createTable("Substation-MeasurementControl-List", [], "SubstationMeasurementControl");

    bindClick("addSubstationMeasurementControl", function () {
      createSubstationMeasurementControl(id, tableName);
    });
    bindClick('editSubstationMeasurementControl', function () {
      editSubstationMeasurementControl(forms.getObjectID(tableName));
    });
    bindClick('deleteSubstationMeasurementControl', function () {
      deleteSubstationMeasurementControl(forms.getObjectID(tableName));
    });

    db.MeasurementContainer.get({
      where: "parentMRID = " + id + " AND parentClassName = 'Substation' AND chieldClassName = 'SubstationMeasurementControl'"
    }).then(function (data) {
      var features = context.all(data);
      var ids = featuresPropertyToArray(features, "chieldMRID");
      db.SubstationMeasurementControl.getByArray(ids).then(function (data) {
        forms.loadTableData("Substation-MeasurementControl-List", featuresToArray(data));
      });
    });
  }

  function createSubstationMeasurementControl(id, tableName) {
    var substation = {};
    db.Substation.getById(id).then(function (data) {
      substation = context.first(data);
      var graphic = {
        geometry: substation.geometry,
        attributes: generators.SubstationMeasurementControl.default
      };
      db.SubstationMeasurementControl.add(graphic).then(function (data) {
        return db.SubstationMeasurementControl.getByData(data);
      }).then(function (data) {
        var feature = context.first(data);
        forms.appendRowInTable(tableName, feature.attributes);

        var equipment = graphic;
        equipment.attributes.parentMRID = id;
        equipment.attributes.chieldMRID = feature.attributes["OBJECTID"];
        equipment.attributes.parentClassName = "Substation";
        equipment.attributes.chieldClassName = "SubstationMeasurementControl";
        db.MeasurementContainer.add(equipment).then(function (data) {});
      });
    });
  }

  function editSubstationMeasurementControl(id) {
    db.SubstationMeasurementControl.getById(id).then(function (data) {
      var feature = context.first(data);
      forms.open("SubstationMeasurementControl", feature);
    });
  }

  function deleteSubstationMeasurementControl(id) {
    db.MeasurementContainer.get({ where: "chieldMRID = " + id + " AND chieldClassName='SubstationMeasurementControl' AND parentClassName='Substation'" }).then(function (data) {
      return db.MeasurementContainer.delById(context.key(context.first(data)));
    }).then(db.SubstationMeasurementControl.delById(id)).then(function () {
      forms.deleteRowInTable("Substation-MeasurementControl-List", id);
    });
  }

  function loadPowerTransformerMeasurementControlList(id) {
    var tableName = "PowerTransformer-MeasurementControl-List";
    forms.createTable(tableName, [], "PowerTransformerMeasurementControl");

    bindClick("addPowerTransformerMeasurementControl", function () {
      createPowerTransformerMeasurementControl(id, tableName);
    });
    bindClick('editPowerTransformerMeasurementControl', function () {
      editPowerTransformerMeasurementControl(forms.getObjectID(tableName));
    });
    bindClick('deletePowerTransformerMeasurementControl', function () {
      deletePowerTransformerMeasurementControl(forms.getObjectID(tableName));
    });

    db.MeasurementContainer.get({
      where: "parentMRID = " + id + " AND parentClassName = 'PowerTransformer' AND chieldClassName = 'PowerTransformerMeasurementControl'"
    }).then(function (data) {
      var features = context.all(data);
      var ids = featuresPropertyToArray(features, "chieldMRID");
      db.PowerTransformerMeasurementControl.getByArray(ids).then(function (data) {
        forms.loadTableData(tableName, featuresToArray(data));
      });
    });
  }

  function createPowerTransformerMeasurementControl(id, tableName) {
    var PowerTransformer = {};
    db.PowerTransformer.getById(id).then(function (data) {
      PowerTransformer = context.first(data);
      var graphic = {
        geometry: PowerTransformer.geometry,
        attributes: generators.PowerTransformerMeasurementControl.default
      };
      db.PowerTransformerMeasurementControl.add(graphic).then(function (data) {
        return db.PowerTransformerMeasurementControl.getByData(data);
      }).then(function (data) {
        var feature = context.first(data);
        forms.appendRowInTable(tableName, feature.attributes);

        var equipment = graphic;
        equipment.attributes.parentMRID = id;
        equipment.attributes.chieldMRID = feature.attributes["OBJECTID"];
        equipment.attributes.parentClassName = "PowerTransformer";
        equipment.attributes.chieldClassName = "PowerTransformerMeasurementControl";
        db.MeasurementContainer.add(equipment).then(function (data) {});
      });
    });
  }

  function editPowerTransformerMeasurementControl(id) {
    db.PowerTransformerMeasurementControl.getById(id).then(function (data) {
      var feature = context.first(data);
      forms.open("PowerTransformerMeasurementControl", feature);
    });
  }

  function deletePowerTransformerMeasurementControl(id) {
    db.MeasurementContainer.get({ where: "chieldMRID = " + id + " AND chieldClassName='PowerTransformerMeasurementControl' AND parentClassName='PowerTransformer'" }).then(function (data) {
      return db.MeasurementContainer.delById(context.key(context.first(data)));
    }).then(db.PowerTransformerMeasurementControl.delById(id)).then(function () {
      forms.deleteRowInTable("PowerTransformer-MeasurementControl-List", id);
    });
  }

  function pointToFeature(className, point) {
    var feature = generators[className]["defaultType1"];
    feature.geometry = point;
    switch (className) {
      case "Substation":
        return db.Substation.add(feature).then(function (data) {
          var id = data[0][0].objectId;
          return substation.createDefaultEquipment(id);
        });
        break;
      case "Structure":
        return db[className].add(feature);
        break;
      case "Switch":
        return db[className].add(feature);
        break;
    }
  }

  function readGPXFile(evt) {
    var tableName = "gpx-table";
    //Retrieve the first (and only!) File from the FileList object
    bindClick("deleteGpxPoints", function () {
      carto.deleteGpxPoints();
      forms.loadTableData(tableName, null);
    });

    bindClick("pointToStructure", function () {
      var data = forms.getTableSelection(tableName);
      var feature = generators.Structure.defaultType1;
      feature.attributes.localName = data.name;
      feature.attributes.description = data.desc;
      feature.geometry = carto.toMercator(data.lon, data.lat);
      db.Structure.add(feature).then(function () {
        forms.removeSelectedRow(tableName);
        _getEditorLayer("Structure").refresh();
      });
    });

    bindClick("pointToSwitch", function () {
      var data = forms.getTableSelection(tableName);
      var feature = generators.Switch.defaultType1;
      feature.attributes.localName = data.name;
      feature.attributes.description = data.desc;
      feature.geometry = carto.toMercator(data.lon, data.lat);
      db.Switch.add(feature).then(function () {
        forms.removeSelectedRow(tableName);
        _getEditorLayer("Switch").refresh();
      });
    });

    bindClick("pointToSubstation", function () {
      var data = forms.getTableSelection(tableName);
      var feature = generators.Substation.defaultType1;
      feature.attributes.localName = data.name;
      feature.attributes.description = data.desc;
      feature.geometry = carto.toMercator(data.lon, data.lat);
      db.Substation.add(feature).then(function (data) {
        var id = data[0][0].objectId;
        return substation.createDefaultEquipment(id);
      }).then(function () {
        forms.removeSelectedRow(tableName);
        _getEditorLayer("Substation").refresh();
      });
    });

    bindClick("pointsToPowerLine", function () {
      var data = forms.getTableRows(tableName);
      var features = [];
      var points = [];
      for (var i = 0; i < data.length; i++) {
        var feature = {
          geometry: carto.toMercator(data[i].lon, data[i].lat),
          attributes: {
            localName: data[i].name,
            description: data[i].description
          }
        };
        features.push(feature);
        points.push(feature.geometry);
      }
      var lineGeometry = carto.pointsToPolyline(points);
      var _structures = null;
      var _acLineSegment = null;
      var _powerLine = null;
      return db.Structure.addArray(features).then(function (data) {
        var ids = data[0].map(function (item) {
          return item.objectId;
        });
        forms.removeSelectedRows(tableName);
        _getEditorLayer("Structure").refresh();
        return db.Structure.getByArray(ids);
      }).then(function (data) {
        _structures = context.all(data);
        return acLineSegment.createDefault(lineGeometry);
      }).then(function (data) {
        var id = context.getAdds(data)[0].objectId;
        _getEditorLayer("ACLineSegment").refresh();
        return acLineSegment.read(id);
      }).then(function (data) {
        _acLineSegment = context.first(data);
        return temporaryPowerLine.create(lineGeometry);
      }).then(function (data) {
        _getEditorLayer("PowerLine").refresh();
        _powerLine = context.first(data);
        var containers = [];
        for (var i = 0; i < _structures.length; i++) {
          var item = context.containerTemplate(context.key(_acLineSegment), context.key(_structures[i]), "ACLineSegment", "Structure", _structures[i].geometry);
          containers.push(item);
        }
        return db.EquipmentContainer.addArray(containers);
      }).then(function () {
        var container = context.containerTemplate(context.key(_powerLine), context.key(_acLineSegment), "PowerLine", "ACLineSegment", carto.getFirstPointInLine(lineGeometry));
        return db.EquipmentContainer.add(container);
      });
    });

    var files = evt.target.files[0];

    if (files) {
      var fileReader = new FileReader();
      var fileType = files.type;
      fileReader.readAsText(files);
      fileReader.onload = function (e) {
        var contents = e.target.result;
        var dom = new DOMParser().parseFromString(contents, 'text/xml');
        var geoJson = null;
        if (fileType == 'application/vnd.google-earth.kml+xml') {
          geoJson = toGeoJSON.kml(dom);
        } else {
          geoJson = toGeoJSON.gpx(dom);
        }

        var features = carto.parseGeoJSON(geoJson);
        var data = featuresToArray({ features: features });
        forms.loadTableData("gpx-table", data);
        carto.addGpxGraphicsToMap(features);
      };
    } else {
      alert("Не получилось загрузить файл gpx");
    }
  }

  function openAccountsManageSettings() {
    var tableName = "accounts-manage-container";
    forms.showWindow("accounts-window");

    bindClick("addAccount", function () {
      createAccount(tableName);
    });
    bindClick("editAccount", function () {
      editAccount(forms.getObjectID(tableName), tableName);
    });
    bindClick("deleteAccount", function () {
      deleteAccount(forms.getObjectID(tableName), tableName);
    });

    account.all().then(function (data) {
      forms.createTable(tableName, context.all(data), "Account", null);
      forms.hideColumn(tableName, "password");
      forms.hideColumn(tableName, "lat");
      forms.hideColumn(tableName, "lon");
      forms.hideColumn(tableName, "createDate");
    });
  }

  function createAccount(tableName) {
    account.create(carto.getCenter(map.extent)).then(function (data) {
      var feature = context.first(data);
      forms.appendRowInTable(tableName, feature.attributes);
      forms.open("Account", feature);
    });
  }

  function editAccount(id) {
    account.read(id).then(function (data) {
      forms.open("Account", context.first(data));
    });
  }

  function deleteAccount(id, tableName) {
    account.del(id).then(function () {
      forms.deleteRowInTable(tableName, id);
    });
  }

  function openAccountSettings(account) {
    db.Account.getById(context.key(account)).then(function (data) {
      forms.open("Account", context.first(data));
    });
  }

  function openSessionManageWindow() {
    var tableName = "sessionManageDiv";
    var schedulerName = "sessionSchedulerDiv";
    forms.showWindow("session-container");
    db.Session.get({ where: "1=1" }).then(function (data) {
      var sessions = context.all(data);
      forms.createTable(tableName, sessions, "Session");
      forms.createScheduler(schedulerName, sessions);
    });
  }

  return {
    getClickHandler: getClickHandler,
    getEditorHandler: getEditorHandler,
    updateTechnicalConnectionInfo: interactiveMap.updateTechnicalConnectionInfo,
    getSubstationEnergyCenterReport: interactiveMap.getSubstationEnergyCenterReport,
    loadPowerLineList: loadPowerLineList,
    loadSubstationList: loadSubstationList,
    openAccountSettings: openAccountSettings,
    openAccountsManageSettings: openAccountsManageSettings,
    openSessionManageWindow: openSessionManageWindow,
    pointToFeature: pointToFeature,
    exportMap: exportUtils.exportMap,
    showSituationCenterMessages: sac.showSituationCenterMessages,
    showNetworkProjects: projects.showNetworkProjects,
    loadNetworkProject: dxfUtils.loadNetworkProject,
    initFeatureList: initFeatureList,
    readGPXFile: readGPXFile
  };
});

//# sourceMappingURL=logic-compiled.js.map

//# sourceMappingURL=logic-compiled-compiled.js.map