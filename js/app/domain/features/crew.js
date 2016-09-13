"use strict";
define([
  "./js/app/forms/forms-compiled.js",
  "./js/app/dataAccess/model-compiled.js",
  "./js/app/domain/http-compiled.js",
  "./js/app/domain/dxf.js",
  "./js/app/domain/features/substation-compiled.js",
  "./js/app/domain/features/powerLine-compiled.js",
  "./js/app/domain/features/acLineSegment-compiled.js",
  "./js/app/domain/features/voltageLevel-compiled.js",
  "./js/app/domain/features/powerTransformer-compiled.js",
  "./js/app/domain/features/account-compiled.js",
  "./js/app/domain/interactiveMap/index.js",
  "./js/app/domain/generators-compiled.js",
  "./js/app/domain/carto-compiled.js",
  "./js/app/domain/misc/sac-compiled.js",
  "./js/app/domain/misc/projects-compiled.js",
  "./js/app/domain/misc/geometryView-compiled.js",
  "./js/app/domain/misc/export-compiled.js"
], function (forms,
             model,
             httpUtils,
             dxfUtils,
             substation,
             temporaryPowerLine,
             acLineSegment,
             voltageLevel,
             powerTransformer,
             account,
             interactiveMap,
             generators,
             carto,
             sac,
             projects,
             geometryView,
             exportUtils) {
  
  var context = new model({url: "", className: "context", map: map});
  
  function initCrewTabs(data) {
    var id = context.key(data);
    loadCrewErpPersonList(id);
    loadCrewRouteList(id);
  }
  
  async function loadGuardCrewErpPersonList(id) {
    var table = "GuardCrew-ErpPerson-List";
    var tableCandidate = "GuardCrew-ErpPerson-Candidate-List";
    
    bindClick("linkGuardCrewErpPerson", async function () {
      var data = await (db.GuardCrew.getById(id));
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
        }
      });
      var action = await (db.ErpPersonIdentificationObjectRole.addArray(containers));
      if (action) {
        data = await (db.ErpPerson.getByArray(ids));
        features = context.all(data);
        loadGuardCrewErpPersonList(id);
      }
    });
    bindClick("relinkGuardCrewErpPerson", async function () {
      var ids = forms.getObjectIDS(table);
      var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
      var where = "parentMRID=" + id + " AND parentClassName='GuardCrew' AND chieldClassName='ErpPerson' AND (" + chieldIds + ")";
      var containers = await (db.ErpPersonIdentificationObjectRole.get({where: where}));
      containers = context.all(containers);
      ids = containers.map(function (item) {
        return item.attributes.OBJECTID
      });
      await (db.ErpPersonIdentificationObjectRole.delByArray(ids));
      forms.removeSelectedRows(table);
    });
    
    var features = await (getChields(id, "GuardCrew", "ErpPerson", "ErpPersonIdentificationObjectRole"));
    forms.createTable(table, features, "ErpPerson");
    
    var candidates = await (db.ErpPerson.get({where: "1=1"}));
    candidates = context.all(candidates);
    forms.createTable(tableCandidate, candidates, "ErpPerson");
  }
  
  async function loadCrewRouteList(id) {
    var table = "Crew-Route-List";
    var tableCandidate = "Crew-Route-Candidate-List";
    
    bindClick("linkCrewRoute", async function () {
      var data = await (db.Crew.getById(id));
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
        }
      });
      var action = await (db.Location.addArray(containers));
      if (action) {
        data = await (db.Route.getByArray(ids));
        features = context.all(data);
        loadCrewRouteList(id);
      }
    });
    bindClick("relinkCrewRoute", async function () {
      var ids = forms.getObjectIDS(table);
      var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
      var where = "parentMRID=" + id + " AND parentClassName='Crew' AND chieldClassName='Route' AND (" + chieldIds + ")";
      var containers = await (db.Location.get({where: where}));
      containers = context.all(containers);
      ids = containers.map(function (item) {
        return item.attributes.OBJECTID
      });
      await (db.Location.delByArray(ids));
      forms.removeSelectedRows(table);
    });
    
    bindClick("crewRouteRefresh", async function () {
      var editor = _getEditorLayer("Route");
      //noinspection JSUnresolvedFunction
      var candidates = editor.getSelectedFeatures();
      forms.createTable(tableCandidate, candidates, "Route");
    });
    
    var features = await (getChields(id, "Crew", "Route", "Location"));
    forms.createTable(table, features, "Route");
    
    var editor = _getEditorLayer("Route");
    //noinspection JSUnresolvedFunction
    var candidates = editor.getSelectedFeatures();
    forms.createTable(tableCandidate, candidates, "Route");
  }
  
  async function loadCrewErpPersonList(id) {
    var table = "Crew-ErpPerson-List";
    var tableCandidate = "Crew-ErpPerson-Candidate-List";
    
    bindClick("linkCrewErpPerson", async function () {
      var data = await (db.Crew.getById(id));
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
        }
      });
      var action = await (db.ErpPersonIdentificationObjectRole.addArray(containers));
      if (action) {
        data = await (db.ErpPerson.getByArray(ids));
        features = context.all(data);
        loadCrewErpPersonList(id);
      }
    });
    bindClick("relinkCrewErpPerson", async function () {
      var ids = forms.getObjectIDS(table);
      var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
      var where = "parentMRID=" + id + " AND parentClassName='Crew' AND chieldClassName='ErpPerson' AND (" + chieldIds + ")";
      var containers = await (db.ErpPersonIdentificationObjectRole.get({where: where}));
      containers = context.all(containers);
      ids = containers.map(function (item) {
        return item.attributes.OBJECTID
      });
      await (db.ErpPersonIdentificationObjectRole.delByArray(ids));
      forms.removeSelectedRows(table);
    });
    
    var features = await (getChields(id, "Crew", "ErpPerson", "ErpPersonIdentificationObjectRole"));
    forms.createTable(table, features, "ErpPerson");
    
    var candidates = await (db.ErpPerson.get({where: "1=1"}));
    candidates = context.all(candidates);
    forms.createTable(tableCandidate, candidates, "ErpPerson");
  }
  
  function initGuardCrewTabs(data) {
    var id = context.key(data);
    loadGuardCrewErpPersonList(id);
    loadGuardCrewRouteList(id);
  }
  
  async function loadGuardCrewRouteList(id) {
    var table = "GuardCrew-Route-List";
    var tableCandidate = "GuardCrew-Route-Candidate-List";
    
    bindClick("linkGuardCrewRoute", async function () {
      var data = await (db.GuardCrew.getById(id));
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
        }
      });
      var action = await (db.Location.addArray(containers));
      if (action) {
        data = await (db.Route.getByArray(ids));
        features = context.all(data);
        loadGuardCrewRouteList(id);
      }
    });
    bindClick("relinkGuardCrewRoute", async function () {
      var ids = forms.getObjectIDS(table);
      var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
      var where = "parentMRID=" + id + " AND parentClassName='GuardCrew' AND chieldClassName='Route' AND (" + chieldIds + ")";
      var containers = await (db.Location.get({where: where}));
      containers = context.all(containers);
      ids = containers.map(function (item) {
        return item.attributes.OBJECTID
      });
      await (db.Location.delByArray(ids));
      forms.removeSelectedRows(table);
    });
    
    bindClick("GuardCrewRouteRefresh", async function () {
      var editor = _getEditorLayer("Route");
      //noinspection JSUnresolvedFunction
      var candidates = editor.getSelectedFeatures();
      forms.createTable(tableCandidate, candidates, "Route");
    });
    
    var features = await (getChields(id, "GuardCrew", "Route", "Location"));
    forms.createTable(table, features, "Route");
    
    var editor = _getEditorLayer("Route");
    //noinspection JSUnresolvedFunction
    var candidates = editor.getSelectedFeatures();
    forms.createTable(tableCandidate, candidates, "Route");
  }
  
  async function getChields(parentMRID, parentClassName, chieldClassName, proxyClassName) {
    var where = "parentClassName = '" + parentClassName + "' AND chieldClassName='" + chieldClassName + "' AND parentMRID=" + parentMRID;
    var data = await db[proxyClassName].get({where: where});
    var features = context.all(data);
    var ids = features.map(function (item) {
      return item.attributes.chieldMRID
    });
    data = await (db[chieldClassName].getByArray(ids));
    features = context.all(data);
    return features;
  }
  
  return {
    initCrewTabs: initCrewTabs,
    initGuardCrewTabs: initGuardCrewTabs
  }
});