"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

define(["./js/app/forms/forms-compiled.js", "./js/app/dataAccess/model-compiled.js", "./js/app/domain/http-compiled.js", "./js/app/domain/dxf.js", "./js/app/domain/features/substation-compiled.js", "./js/app/domain/features/powerLine-compiled.js", "./js/app/domain/features/acLineSegment-compiled.js", "./js/app/domain/features/voltageLevel-compiled.js", "./js/app/domain/features/powerTransformer-compiled.js", "./js/app/domain/features/account-compiled.js", "./js/app/domain/interactiveMap/index.js", "./js/app/domain/generators-compiled.js", "./js/app/domain/carto-compiled.js", "./js/app/domain/misc/sac-compiled.js", "./js/app/domain/misc/projects-compiled.js", "./js/app/domain/misc/geometryView-compiled.js", "./js/app/domain/misc/export-compiled.js"], function (forms, model, httpUtils, dxfUtils, substation, temporaryPowerLine, acLineSegment, voltageLevel, powerTransformer, account, interactiveMap, generators, carto, sac, projects, geometryView, exportUtils) {
  let loadGuardCrewErpPersonList = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var table = "GuardCrew-ErpPerson-List";
      var tableCandidate = "GuardCrew-ErpPerson-Candidate-List";

      bindClick("linkGuardCrewErpPerson", _asyncToGenerator(function* () {
        var data = yield db.GuardCrew.getById(id);
        var feature = context.first(data);
        var ids = forms.getObjectIDS(tableCandidate);
        var containers = ids.map(function (childId) {
          return {
            geometry: feature.geometry,
            attributes: {
              parentMRID: id,
              parentClassName: "GuardCrew",
              chieldClassName: "ErpPerson",
              chieldMRID: childId
            }
          };
        });
        var action = yield db.ErpPersonIdentificationObjectRole.addArray(containers);
        if (action) {
          data = yield db.ErpPerson.getByArray(ids);
          features = context.all(data);
          loadGuardCrewErpPersonList(id);
        }
      }));
      bindClick("relinkGuardCrewErpPerson", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(table);
        var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
        var where = "parentMRID=" + id + " AND parentClassName='GuardCrew' AND chieldClassName='ErpPerson' AND (" + chieldIds + ")";
        var containers = yield db.ErpPersonIdentificationObjectRole.get({ where: where });
        containers = context.all(containers);
        ids = containers.map(function (item) {
          return item.attributes.OBJECTID;
        });
        yield db.ErpPersonIdentificationObjectRole.delByArray(ids);
        forms.removeSelectedRows(table);
      }));

      var features = yield getChields(id, "GuardCrew", "ErpPerson", "ErpPersonIdentificationObjectRole");
      forms.createTable(table, features, "ErpPerson");

      var candidates = yield db.ErpPerson.get({ where: "1=1" });
      candidates = context.all(candidates);
      forms.createTable(tableCandidate, candidates, "ErpPerson");
    });

    return function loadGuardCrewErpPersonList(_x) {
      return ref.apply(this, arguments);
    };
  })();

  let loadCrewRouteList = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var table = "Crew-Route-List";
      var tableCandidate = "Crew-Route-Candidate-List";

      bindClick("linkCrewRoute", _asyncToGenerator(function* () {
        var data = yield db.Crew.getById(id);
        var feature = context.first(data);
        var ids = forms.getObjectIDS(tableCandidate);
        var containers = ids.map(function (childId) {
          return {
            geometry: feature.geometry,
            attributes: {
              parentMRID: id,
              parentClassName: "Crew",
              chieldClassName: "Route",
              chieldMRID: childId
            }
          };
        });
        var action = yield db.Location.addArray(containers);
        if (action) {
          data = yield db.Route.getByArray(ids);
          features = context.all(data);
          loadCrewRouteList(id);
        }
      }));
      bindClick("relinkCrewRoute", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(table);
        var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
        var where = "parentMRID=" + id + " AND parentClassName='Crew' AND chieldClassName='Route' AND (" + chieldIds + ")";
        var containers = yield db.Location.get({ where: where });
        containers = context.all(containers);
        ids = containers.map(function (item) {
          return item.attributes.OBJECTID;
        });
        yield db.Location.delByArray(ids);
        forms.removeSelectedRows(table);
      }));

      bindClick("crewRouteRefresh", _asyncToGenerator(function* () {
        var editor = _getEditorLayer("Route");
        //noinspection JSUnresolvedFunction
        var candidates = editor.getSelectedFeatures();
        forms.createTable(tableCandidate, candidates, "Route");
      }));

      var features = yield getChields(id, "Crew", "Route", "Location");
      forms.createTable(table, features, "Route");

      var editor = _getEditorLayer("Route");
      //noinspection JSUnresolvedFunction
      var candidates = editor.getSelectedFeatures();
      forms.createTable(tableCandidate, candidates, "Route");
    });

    return function loadCrewRouteList(_x2) {
      return ref.apply(this, arguments);
    };
  })();

  let loadCrewErpPersonList = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var table = "Crew-ErpPerson-List";
      var tableCandidate = "Crew-ErpPerson-Candidate-List";

      bindClick("linkCrewErpPerson", _asyncToGenerator(function* () {
        var data = yield db.Crew.getById(id);
        var feature = context.first(data);
        var ids = forms.getObjectIDS(tableCandidate);
        var containers = ids.map(function (childId) {
          return {
            geometry: feature.geometry,
            attributes: {
              parentMRID: id,
              parentClassName: "Crew",
              chieldClassName: "ErpPerson",
              chieldMRID: childId
            }
          };
        });
        var action = yield db.ErpPersonIdentificationObjectRole.addArray(containers);
        if (action) {
          data = yield db.ErpPerson.getByArray(ids);
          features = context.all(data);
          loadCrewErpPersonList(id);
        }
      }));
      bindClick("relinkCrewErpPerson", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(table);
        var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
        var where = "parentMRID=" + id + " AND parentClassName='Crew' AND chieldClassName='ErpPerson' AND (" + chieldIds + ")";
        var containers = yield db.ErpPersonIdentificationObjectRole.get({ where: where });
        containers = context.all(containers);
        ids = containers.map(function (item) {
          return item.attributes.OBJECTID;
        });
        yield db.ErpPersonIdentificationObjectRole.delByArray(ids);
        forms.removeSelectedRows(table);
      }));

      var features = yield getChields(id, "Crew", "ErpPerson", "ErpPersonIdentificationObjectRole");
      forms.createTable(table, features, "ErpPerson");

      var candidates = yield db.ErpPerson.get({ where: "1=1" });
      candidates = context.all(candidates);
      forms.createTable(tableCandidate, candidates, "ErpPerson");
    });

    return function loadCrewErpPersonList(_x3) {
      return ref.apply(this, arguments);
    };
  })();

  let loadGuardCrewRouteList = (() => {
    var ref = _asyncToGenerator(function* (id) {
      var table = "GuardCrew-Route-List";
      var tableCandidate = "GuardCrew-Route-Candidate-List";

      bindClick("linkGuardCrewRoute", _asyncToGenerator(function* () {
        var data = yield db.GuardCrew.getById(id);
        var feature = context.first(data);
        var ids = forms.getObjectIDS(tableCandidate);
        var containers = ids.map(function (childId) {
          return {
            geometry: feature.geometry,
            attributes: {
              parentMRID: id,
              parentClassName: "GuardCrew",
              chieldClassName: "Route",
              chieldMRID: childId
            }
          };
        });
        var action = yield db.Location.addArray(containers);
        if (action) {
          data = yield db.Route.getByArray(ids);
          features = context.all(data);
          loadGuardCrewRouteList(id);
        }
      }));
      bindClick("relinkGuardCrewRoute", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(table);
        var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
        var where = "parentMRID=" + id + " AND parentClassName='GuardCrew' AND chieldClassName='Route' AND (" + chieldIds + ")";
        var containers = yield db.Location.get({ where: where });
        containers = context.all(containers);
        ids = containers.map(function (item) {
          return item.attributes.OBJECTID;
        });
        yield db.Location.delByArray(ids);
        forms.removeSelectedRows(table);
      }));

      bindClick("GuardCrewRouteRefresh", _asyncToGenerator(function* () {
        var editor = _getEditorLayer("Route");
        //noinspection JSUnresolvedFunction
        var candidates = editor.getSelectedFeatures();
        forms.createTable(tableCandidate, candidates, "Route");
      }));

      var features = yield getChields(id, "GuardCrew", "Route", "Location");
      forms.createTable(table, features, "Route");

      var editor = _getEditorLayer("Route");
      //noinspection JSUnresolvedFunction
      var candidates = editor.getSelectedFeatures();
      forms.createTable(tableCandidate, candidates, "Route");
    });

    return function loadGuardCrewRouteList(_x4) {
      return ref.apply(this, arguments);
    };
  })();

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

    return function getChields(_x5, _x6, _x7, _x8) {
      return ref.apply(this, arguments);
    };
  })();

  var context = new model({ url: "", className: "context", map: map });

  function initCrewTabs(data) {
    var id = context.key(data);
    loadCrewErpPersonList(id);
    loadCrewRouteList(id);
  }

  function initGuardCrewTabs(data) {
    var id = context.key(data);
    loadGuardCrewErpPersonList(id);
    loadGuardCrewRouteList(id);
  }

  return {
    initCrewTabs: initCrewTabs,
    initGuardCrewTabs: initGuardCrewTabs
  };
});

//# sourceMappingURL=crew-compiled.js.map