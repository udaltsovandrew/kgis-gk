/**
 * Created by udaltsov on 25.08.15.
 */
"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var userAccount = null;
var session = null;
var map = {};
var config = {};
var coreConfig = {};
var _carto = {};
var forms = {};
var utils = {};
var model = {};
var logic = {};
var db = {
  Document: null,
  DocumentIdentificationObjectRole: null,
  SurfaceFacility: null,
  Building: null,
  Railroad: null,
  Road: null,
  UndergroundFacility: null
};
var idb = null;

//временное хранилище
var store = {
  layers: [],
  editors: [],
  widgets: [],
  dicts: {},
  stack: {
    features: {
      substation: {},
      voltageLevel: {},
      structure: {},
      acLineSegment: {},
      dcLineSegment: {},
      busBarSection: {},
      powerTransformer: {},
      switch: {}
    }
  },
  treeModel: null
};

function getUrlParameters() {
  var vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

//функция инициализации
function init() {
  require(['esri/map', 'js/app/http/getUrl.js', './js/app/dataAccess/model-compiled.js', 'js/app/domain/carto-compiled.js', 'js/app/domain/logic-compiled.js', 'js/app/utils/utils-compiled.js', 'js/app/forms/forms-compiled.js', 'esri/config', 'esri/tasks/GeometryService', 'dojo/parser', 'dojo/domReady!'], (() => {
    var _ref = _asyncToGenerator(function* (Map, getUrl, coreModel, coreCarto, coreLogic, coreUtils, coreForms, esriConfig, GeometryService, parser) {

      parser.parse();

      config = JSON.parse((yield getUrl.getUrl(_services.config + "/configEditor/" + _currentServer + "/administrator")));
      coreConfig = config;
      _carto = coreCarto;
      forms = coreForms;
      model = coreModel;
      utils = coreUtils;
      logic = coreLogic;

      esriConfig.defaults.io.proxyUrl = config.proxyUrl;
      esriConfig.defaults.geometryService = new GeometryService(config.geometryServiceUrl);

      function initMap() {
        return new Promise(function (resolve) {
          map = new Map("mapDiv", {
            basemap: "osm",
            center: [40.229, 47.399911],
            zoom: 18,
            nav: true,
            slider: true,
            sliderPosition: "top-right",
            autoResize: true,
            showAttribution: false,
            showLabels: true,
            displayGraphicsOnPan: false,
            fadeOnZoom: true,
            force3DTransforms: true,
            logo: false,
            navigationMode: "css-transforms",
            opacity: 0.3
          });

          resolve("success");
        });
      }

      utils.initPouchDB().then(function () {
        return idb.get("map_settings");
      }).then(function (doc) {
        return initMap(doc);
      }).catch(function () {
        return initMap();
      }).then(function () {
        return utils.loadDictionaries();
      }).then(function () {
        return utils.initLoginWindow();
      }).then(function (currentSession) {
        utils.loadEditorHandlers(currentSession);

        coreUtils.loadVectorLayers(currentSession);
        coreUtils.loadEditorLayers(currentSession);
        coreUtils.loadControls(currentSession);

        map.on("layers-add-result", function (evt) {
          coreUtils.initEditor(evt, currentSession);
          coreUtils.initTableFeatureLayer();
          coreUtils.initList(currentSession);
        });
      });
    });

    return function (_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8, _x9, _x10) {
      return _ref.apply(this, arguments);
    };
  })());
}

//отчет по ЦП
function substationEnergyCenterReport() {
  require(["../../../../Application/" + _currentServer + "/config/config-compiled.js", "./js/app/dataAccess/model-compiled.js", "js/app/domain/logic-compiled.js", "js/app/utils/utils-compiled.js", "js/app/forms/forms-compiled.js", "dojo/parser", "dojo/domReady!"], function (coreConfig, coreModel, coreLogic, coreUtils, coreForms, parser) {

    parser.parse();

    config = coreConfig;
    forms = coreForms;
    model = coreModel;
    utils = coreUtils;
    logic = coreLogic;

    utils.loadDB();
    logic.getSubstationEnergyCenterReport(getUrlParameters()["id"]);
  });
}

function initSearch() {
  return new Promise(function (resolve) {
    require(["../../../../Application/" + _currentServer + "/config/config-compiled.js", "./js/app/dataAccess/model-compiled.js", "js/app/domain/logic-compiled.js", "js/app/utils/utils-compiled.js", "js/app/forms/forms-compiled.js", "dojo/parser", "dojo/domReady!"], function (coreConfig, coreModel, coreLogic, coreUtils, coreForms, parser) {

      parser.parse();

      config = coreConfig;
      forms = coreForms;
      model = coreModel;
      utils = coreUtils;
      logic = coreLogic;

      utils.loadDB();
      resolve({ status: "success" });
    });
  });
}

function _getConf(id) {
  for (var i = 0; i < config.editors.length; i++) {
    if (config.editors[i].id == id) return config.editors[i];
  }
}

function _getStore(id) {
  for (var i = 0; i < config.editors.length; i++) {
    if (config.editors[i].id == id) {
      return store.editors[i];
    }
  }
}

function _getEditorLayer(id) {
  for (var i = 0; i < store.editors.length; i++) {
    if (store.editors[i].id == id) {
      return store.editors[i];
    }
  }
}

function _updateLayerByFeature(id, feature, fieldName) {
  var layer = _getEditorLayer(id);
  var graphics = layer.graphics;
  var graphic = null;
  for (var i = 0; i < graphics.length; i++) {
    if (graphics[i].attributes[fieldName] == feature.attributes[fieldName]) {
      graphic = graphics[i];
      graphic.setGeometry(feature.geometry);
      graphic.setAttributes(feature.attributes);
      break;
    }
  }
}

function getFieldTranslation(fieldName) {
  if (config.translation[fieldName] !== undefined) return config.translation[fieldName].alias;
  return fieldName;
}

function featuresToArray(data, field) {
  var features = data.features;
  var result = [];
  for (var i = 0; i < features.length; i++) {
    if (field !== undefined) {
      result.push(features[i].attributes[field]);
    } else {
      var attributes = features[i].attributes;
      var geometryProps = _carto.getGeometryProps(features[i].geometry);
      if (geometryProps != null) {
        try {
          attributes["lat"] = geometryProps["lat"];
          attributes["lon"] = geometryProps["lon"];
        } catch (e) {
          attributes["lat"] = '-';
          attributes["lon"] = '-';
        }
      }
      result.push(attributes);
    }
  }
  return result;
}

function featuresPropertyToArray(data, fieldName) {
  var result = [];
  for (var i = 0; i < data.length; i++) {
    result.push(data[i].attributes[fieldName]);
  }
  return result;
}

function bindClick(elementName, func) {
  var $element = $("#" + elementName);
  $element.off("click", null);
  $element.click(func);
}

function linkClick(elementName, func) {
  var $element = $("a[href='#" + elementName + "']");
  $element.off("click", null);
  $element.click(func);
}

/**
 * Сохранение объекта в файл
 * @param filename
 * @param text
 */
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

//todo
function distinct(objectArray) {

  var distinctResult = [];

  $.each(objectArray, function (i, currentObject) {
    if (!exists(distinctResult, currentObject)) distinctResult.push(currentObject);
  });

  return distinctResult;
}

function exists(arr, object) {
  var compareToJson = JSON.stringify(object),
      result = false;
  $.each(arr, function (i, existingObject) {
    if (JSON.stringify(existingObject) === compareToJson) {
      result = true;
      return false; // break
    }
  });

  return result;
}

//# sourceMappingURL=app-compiled.js.map