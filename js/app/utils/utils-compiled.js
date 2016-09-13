"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

define([
//'../../../../Application/'+_currentServer+'/config/config-compiled.js',
'./js/app/dataAccess/model-compiled.js', './js/app/domain/carto-compiled.js', './js/app/domain/generators-compiled.js', './js/app/forms/forms-compiled.js', 'dojo/store/Memory', 'dojo/store/Observable', 'dijit/tree/ObjectStoreModel', 'dijit/Tree', 'esri/layers/VectorTileLayer', 'esri/layers/FeatureLayer', 'esri/Color', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/dijit/editing/Editor', 'esri/dijit/editing/TemplatePicker', 'esri/dijit/LayerList', 'esri/undoManager', 'esri/dijit/Search', 'esri/dijit/Scalebar', 'esri/dijit/LocateButton', 'dojo/_base/array', 'dojo/request', 'dojo/domReady!'], function ( //coreConfig,
model, carto, generators, forms, Memory, Observable, ObjectStoreModel, Tree, VectorTileLayer, FeatureLayer, Color, SimpleMarkerSymbol, SimpleLineSymbol, Editor, TemplatePicker, LayerList, UndoManager, Search, Scalebar, LocateButton, arrayUtils, request) {
  let initApplicationTesting = (() => {
    var _ref = _asyncToGenerator(function* () {
      let testCase1 = (() => {
        var _ref2 = _asyncToGenerator(function* () {
          var substations = yield db.Substation.get({ where: "1=1" });
          var powerLines = yield db.Account.get({ where: "1=1" });
          var structures = db.Structure.getAsync({ where: "1=1" });
          console.log(substations, powerLines, structures);
          return { substations: substations, powerLines: powerLines };
        });

        return function testCase1() {
          return _ref2.apply(this, arguments);
        };
      })();

      bindClick("applicationTesting", testCase1);
    });

    return function initApplicationTesting() {
      return _ref.apply(this, arguments);
    };
  })();

  let initPilotGPS = (() => {
    var _ref3 = _asyncToGenerator(function* () {
      var baseUrl = "https://ya.ru";
      bindClick("pilotGPSMessages", _asyncToGenerator(function* () {
        var data = yield getPilotGPSList(baseUrl);
        var element = $("#pilotGpsData");
        console.log(element);
      }));
    });

    return function initPilotGPS() {
      return _ref3.apply(this, arguments);
    };
  })();

  let getPilotGPSList = (() => {
    var _ref5 = _asyncToGenerator(function* (baseUrl) {
      var data = yield getUrl(baseUrl, {
        handleAs: "html"
      });
      console.log(data);
    });

    return function getPilotGPSList(_x) {
      return _ref5.apply(this, arguments);
    };
  })();

  let getUrl = (() => {
    var _ref6 = _asyncToGenerator(function* (url, params) {
      return new Promise(function (resolve) {
        request(url, params).then(function (data) {
          resolve.data;
        });
      });
    });

    return function getUrl(_x2, _x3) {
      return _ref6.apply(this, arguments);
    };
  })();

  var wainInfoWindowInterval = null;
  var context = new model({ url: "", className: "", map: map });

  function loadControls() {
    initExitEvent();
    initSearchControl();
    initLocateButton();
    initBaseMapList();
    initScaleBar();
    initEditorWindow();
    initLayersWindow();
    initLayerList();
    initTreeIdentifiedObject();
    initPanelHandlers();
    initToolsControls();
  }

  function initExitEvent() {
    window.onbeforeunload = closingCode;
    function closingCode() {
      saveMapSettings();
      session.attributes["sessionTimeEnd"] = Date.now();
      session.attributes["sessionStatus"] = "закрытая";
      db.Session.set(session);
    }
  }

  function saveMapSettings() {
    //localStorage.setItem("extent", JSON.stringify(map.extent));
    //localStorage.setItem("zoom", JSON.stringify(map.getZoom()));
  }

  function initToolsControls() {
    bindClick("window-tools", function () {
      forms.toWindow("tools-container", "Инструменты");
      forms.showWindow("tools-container");
    });
    bindClick("gpxToStructure", function () {
      logic.pointToFeature("Structure", carto.getGpxPoint()).then(function () {
        _getEditorLayer("Structure").refresh();
      });
    });
    bindClick("gpxToSubstation", function () {
      logic.pointToFeature("Substation", carto.getGpxPoint()).then(function () {
        _getEditorLayer("Substation").refresh();
      });
    });
    bindClick("gpxToSwitch", function () {
      logic.pointToFeature("Switch", carto.getGpxPoint()).then(function () {
        _getEditorLayer("Switch").refresh();
      });
    });
  }

  function initLocateButton() {
    var locateButton = new LocateButton({
      map: map,
      useTracking: true,
      geolocationOptions: {
        maximumAge: 3,
        timeout: 1000,
        enableHighAccuracy: true
      }
    }, "locateButton");
    locateButton.startup();
  }

  function createFeatureLayer(params) {
    return new FeatureLayer(params.url, {
      id: params.id,
      outFields: ['*'],
      mode: FeatureLayer.MODE_SNAPSHOT,
      tileHeight: 1600,
      tileWidth: 1600,
      showLabels: true
    });
  }

  function loadVectorLayers() {
    if (coreConfig.layers) {
      for (var i = 0; i < coreConfig.layers.length; i++) {
        var layer = createFeatureLayer(coreConfig.layers[i]);
        store.layers.push(layer);
        map.addLayer(layer);
      }
    }
  }

  function loadEditorLayers(currentSession) {
    var mapEditors = [];
    for (var i = 0; i < coreConfig.editors.length; i++) {
      var layer = createFeatureLayer(coreConfig.editors[i]);
      layer.setScaleRange(coreConfig.editors[i].minScale, coreConfig.editors[i].maxScale);
      if (isCustomRenderer(coreConfig.editors[i].id) == true) {
        layer.setRenderer(getLayerDefaultRenderer(coreConfig.editors[i].id));
      }
      layer.on("edits-complete", coreConfig.editors[i].editorHandler);
      layer.on("click", coreConfig.editors[i].clickHandler);
      layer.on("mouse-over", waitForInfo);
      store.editors.push(layer);

      var usage = "system";
      if (coreConfig.editors[i].load == true) {
        var layerName = coreConfig.editors[i].id;
        var key = currentSession.attributes.userGroup + "." + currentSession.attributes.userRole;
        var roleEditors = coreConfig.roles[key]["editors"];
        if (roleEditors.some(function (item) {
          return item == layerName;
        })) {
          mapEditors.push(layer);
        }
        usage = "common";
      }

      db[coreConfig.editors[i].id] = new model({
        url: _getConf(coreConfig.editors[i].id).url,
        classAlias: _getConf(coreConfig.editors[i].id).alias,
        className: coreConfig.editors[i].id,
        usage: usage,
        map: map
      });
    }

    map.on("zoom-end", updateRenderers);
    map.addLayers(mapEditors);
  }

  function waitForInfo() {
    if (wainInfoWindowInterval == null) {
      wainInfoWindowInterval = setTimeout(function () {
        wainInfoWindowInterval = null;
      }, 10);
    }
  }

  function updateRenderers() {
    for (var i = 0; i < coreConfig.editors.length; i++) {
      var layer = _getEditorLayer(coreConfig.editors[i].id);
      layer.setScaleRange(coreConfig.editors[i].minScale, coreConfig.editors[i].maxScale);
      if (isCustomRenderer(coreConfig.editors[i].id) == true) {
        layer.setRenderer(getLayerDefaultRenderer(coreConfig.editors[i].id));
      }
    }
  }

  function isCustomRenderer(id) {
    return coreConfig.renderers[id] !== undefined;
  }

  function getLayerDefaultRenderer(id) {
    return carto.getUniqueRenderer(coreConfig.renderers[id]["default"]);
  }

  function loadDB() {
    for (var i = 0; i < coreConfig.editors.length; i++) {
      db[coreConfig.editors[i].id] = new model({
        url: _getConf(coreConfig.editors[i].id).url,
        className: coreConfig.editors[i].id
      });
    }
  }

  function initPanelHandlers() {
    bindClick("window-layers", function () {
      forms.showWindow("layers-container");
    });

    bindClick("window-editor", function () {
      forms.showWindow("editor-container");
    });

    bindClick("window-table", function () {
      forms.showWindow("list-container");
    });

    bindClick("window-gpx", function () {
      forms.showWindow("gpx-container");
    });
  }

  function initLoginWindow() {
    //if (window.location.hostname != "vm.igit.spb.ru") return;
    //noinspection JSUnresolvedFunction
    $("#login-container").kendoWindow({
      actions: ["Pin"],
      modal: true,
      draggable: false
    });
    var panel = $("#login-container").data("kendoWindow");
    panel.pin();
    panel.title("Авторизация");
    panel.open();
    panel.center();
    panel.maximize();

    return new Promise(function (resolve, reject) {
      bindClick("login", function () {
        return verifyCredentials(panel).then(function (data) {
          resolve(data);
        });
      });
    });
  }

  function verifyCredentials(panel) {
    var username = $("#username").val();
    var password = $("#password").val();
    //forms.hideNode("update-technical-connection");
    //forms.showWindow("editor-container");
    panel.close();
    db.Session = new model({ url: _getConf("Session").url });
    db.Account = new model({ url: _getConf("Account").url });
    var _session = null;
    return db.Session.get({ where: "sessionStatus = 'активная'" }).then(function (data) {
      var activeSessions = context.all(data);
      if (activeSessions.length > 1000 * coreConfig.maxSessionNumber) {
        forms.showNotify("Все соединения с сервером исчерпаны (" + activeSessions.length + " из " + coreConfig.maxSessionNumber + "). " + "В случае снижения производительности, попробуйте перезагрузить редактор через несколько минут или попросите коллег завершить текущие сеансы работы.", "info");
      } else {
        return db.Account.get({ where: "1=1" }).then(function (data) {
          var accounts = data.features;
          for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].attributes.userName == username && accounts[i].attributes.password == password) {
              userAccount = accounts[i];
              break;
            }
          }
          if (userAccount != null) {
            _session = generators.Session.default;
            _session.attributes["userName"] = userAccount.attributes.userName;
            _session.attributes["sessionStatus"] = "активная";
            _session.attributes["sessionTimeStart"] = Date.now();
            _session.attributes["userRole"] = userAccount.attributes.userRole;
            _session.attributes["userGroup"] = userAccount.attributes.userGroup;
            _session.geometry = carto.getGpxPoint();
            return db.Session.add(_session);
          }
        }).then(function (data) {
          var id = data[0][0].objectId;
          return db.Session.getById(id);
        }).then(function (data) {
          switch (userAccount.attributes.userRole) {
            case 'администратор':
              forms.showNode("accounts-manage");
              forms.showNode("session-manage");
              break;
          }
          switch (userAccount.attributes.userGroup) {
            case "ИКТП":
              forms.showNode("update-technical-connection");
              break;
          }
          panel.close();
          forms.hideNode("update-technical-connection");
          //forms.showWindow("editor-container");
          session = context.first(data);
          //updateSessionStatus();
          return new Promise(function (resolve, reject) {
            resolve(_session);
          });
        });
      }
    });
  }

  function initEditorWindow() {
    //noinspection JSUnresolvedFunction
    $("#editor-container").kendoWindow({
      actions: ["Minimize", "Maximize", "Close"],
      position: {
        top: 65,
        left: '78%',
        scrollable: true
      },
      width: '21%'
    });
    var panel = $("#editor-container").data("kendoWindow");
    panel.pin();
    panel.title("Панель объектов");
    panel.close();
  }

  function initLayersWindow() {
    //noinspection JSUnresolvedFunction
    $("#layers-container").kendoWindow({
      actions: ["Close"]
    });
    var panel = $("#layers-container").data("kendoWindow");
    panel.pin();
    panel.title("Слои");
    panel.maximize();
    panel.close();
  }

  function initTableFeatureLayer() {
    //noinspection JSUnresolvedFunction
    $("#table-container").kendoWindow({
      actions: ["Minimize", "Maximize", "Close"],
      position: {
        top: '65px',
        left: '10px'
      },
      width: '40%'
    });
    var panel = $("#table-container").data("kendoWindow");
    panel.pin();
    panel.title("Реестр объектов");
    panel.close();

    logic.loadPowerLineList();
    logic.loadSubstationList();

    /*
     var tabsElementName = "featuresTabs";
     var tabsContainer = "featuresTabsContainer";
     
     
     var tabs = [
     {
     item: db.SACEvent, name: "Мероприятия"
     },
     ]
     
     for (var i=0; i<tabs.length; i++){
     forms.generateTab(tabsElementName, tabs[i].item, tabs[i].name);
     forms.generateTabContainer(tabsContainer, tabs[i].item);
     logic.initFeatureTable(tabs[i].item);
     }
     */
  }

  function initList(currentSession) {
    //noinspection JSUnresolvedFunction
    $("#list-container").kendoWindow({
      actions: ["Minimize", "Maximize", "Close"],
      position: {
        top: '65px',
        left: '10px'
      },
      width: '40%'
    });
    var panel = $("#list-container").data("kendoWindow");
    panel.pin();
    panel.title("Реестр объектов");
    panel.close();
    var data = [];

    var classes = [];
    for (var i = 0; i < coreConfig.editors.length; i++) {

      var layerName = coreConfig.editors[i].id;
      var key = currentSession.attributes.userGroup + "." + currentSession.attributes.userRole;
      var roleEditors = coreConfig.roles[key]["editors"];
      var flag = roleEditors.some(function (item) {
        return item == layerName;
      });

      if (coreConfig.editors[i].editable == true && flag == true) classes.push(store.editors[i]);
    }
    var classAliases = {};
    for (var i = 0; i < classes.length; i++) {
      var className = classes[i].id;
      var dataItem = {
        name: className,
        alias: db[className].classAlias
      };
      classAliases[className] = db[className].classAlias;
      data.push(dataItem);
    }

    forms.createComboBox("classSelection", data, "name", "alias");
    var select = $("#classSelection").data("kendoComboBox");
    $("#showFeatureTableButton").click(function () {
      var selectedClassName = select.value();
      var elementName = addFeatureTableTab(classAliases[selectedClassName]) + "-table";
      logic.initFeatureList(selectedClassName, elementName);

      //toDo
      $(document).on('afterFilter', function (event, params, dataSource) {
        console.log(params);
        var editorLayer = _getEditorLayer(selectedClassName);
        var where = "1=1";
        if (params !== null) where = getWhere(params);
        console.log("className=" + selectedClassName, "where=" + where);
        editorLayer.setDefinitionExpression(where);
        editorLayer.refresh();

        /*if (params !== null && params.hasOwnProperty('overrideEvent') && params.overrideEvent === true) {
         console.log("did not fire")
         } else if (params !== null && $.isEmptyObject(params) === false) {
         console.log("p", params)
         } else if (params === null || $.isEmptyObject(params) === true) {
         console.log("cleared");
         }*/
      });
    });
  }

  function getWhere(params) {
    var filters = params.filters;
    var where = "";
    var clauses = [];
    for (var i = 0; i < filters.length; i++) {
      var filter = filters[i];
      var field = filter.field;
      var operator = getOperator(filter.operator);
      var value = getQueryValue(filter.value);
      switch (operator.baseOperator) {
        case "startswith":
          value = "'" + filter.value + "%'";
          break;
        case "contains":
          value = "'%" + filter.value + "%'";
          break;
        case "doesnotcontain":
          value = "'%" + filter.value + "%'";
          break;
        case "endswith":
          value = "'%" + filter.value + "'";
          break;
      }
      var partWhere = field + operator.finalOperator + value;
      clauses.push(partWhere);
    }
    where = clauses.join(" AND ");
    return where;
  }

  function getOperator(operator) {
    var operators = {
      "neq": " <> ",
      "eq": " = ",
      "gt": " > ",
      "lt:": " < ",
      "gte": " >= ",
      "lte": " <= ",
      "startswith": " like ",
      "contains": " like ",
      "doesnotcontain": " not like ",
      "endswith": " like "
    };
    return { baseOperator: operator, finalOperator: operators[operator] };
  }

  function getQueryValue(data) {
    var typeValue = typeof data;
    var value;
    switch (typeValue) {
      case "string":
        value = "'" + data + "'";
        break;
      case "number":
        value = data;
        break;
      case "object":
        value = "'" + moment(data).format() + "'";
        break;
    }
    return value;
  }

  function addFeatureTableTab(title) {
    var tabsElementName = "featureTable-tabs";
    var containerElementName = "featureTable-container";
    var tabsElement = $("#" + tabsElementName)[0];
    var containerElement = $("#" + containerElementName)[0];
    var itemName = "featureTable-" + Date.now();
    var tabHTML = "" + "<li>" + "<a id='" + itemName + "-tab' data-toggle='tab' href='#" + itemName + " ' >" + title + "</a>" + "</li>";
    tabsElement.innerHTML += tabHTML;
    var containerDiv = document.createElement("div");
    containerDiv.className = "tab-pane clear-padding";
    containerDiv.id = itemName;
    containerDiv.innerHTML += "<div id='" + itemName + "-table'></div>";
    containerDiv.innerHTML += "<div id='" + itemName + "-where'></div>";
    containerElement.appendChild(containerDiv);

    return itemName;
  }

  function initTreeIdentifiedObject() {
    return;
    //noinspection JSUnresolvedFunction
    $("#tree-container").kendoWindow({
      actions: ["Minimize", "Maximize", "Close"],
      position: {
        top: 65,
        left: '10px'
      },
      width: '20%'
    });
    var panel = $("#tree-container").data("kendoWindow");
    panel.pin();
    panel.title("Иерархия объектов");
    panel.open();

    store.treeModel = new Memory({
      data: [{ id: 'root', name: 'Сетевая организация', type: 'planet', population: '6 billion' }],
      getChildren: function (object) {
        return this.query({ parent: object.id });
      }
    });

    store.treeModel = new Observable(store.treeModel);

    // Create the model
    var myModel = new ObjectStoreModel({
      store: store.treeModel,
      query: { id: 'root' }
    });

    // Create the Tree.
    var tree = new Tree({
      model: myModel,
      showRoot: false
    });

    tree.placeAt("tree-IdentifyObject");
    tree.startup();

    map.on("extent-change", updateControls);
  }

  function featuresToTreeModel(data, className) {
    var features = data.features;
    for (var i = 0; i < features.length; i++) {
      var root = 'root';
      var feature = features[i];
      var attrs = feature.attributes;

      var company = root + "-company-" + attrs["company"];
      if (_isEmptyNode(company)) store.treeModel.add({
        id: company,
        name: _getNodeName("company", attrs),
        type: 'company',
        parent: root
      });

      var branch = company + "-branch-" + attrs["branch"];
      if (_isEmptyNode(branch)) store.treeModel.add({
        id: branch,
        name: _getNodeName("branch", attrs),
        type: 'branch',
        parent: company
      });

      var gridArea = branch + "-gridArea-" + attrs["gridArea"];
      if (_isEmptyNode(gridArea)) store.treeModel.add({
        id: gridArea,
        name: _getNodeName("gridArea", attrs),
        type: 'gridArea',
        parent: branch
      });

      var gridSector = gridArea + "-gridSector-" + attrs["gridSector"];
      if (_isEmptyNode(gridSector)) store.treeModel.add({
        id: gridSector,
        name: _getNodeName("gridSector", attrs),
        type: 'gridSector',
        parent: gridArea
      });

      var classNode = gridSector + "-" + className;
      if (_isEmptyNode(classNode)) store.treeModel.add({
        id: classNode,
        name: coreConfig.translation[className].alias,
        type: className,
        parent: gridSector
      });

      var leaf = classNode + "-" + attrs["localName"];
      if (_isEmptyNode(leaf)) store.treeModel.add({
        id: leaf,
        name: attrs["localName"],
        type: 'leaf',
        parent: classNode
      });
    }

    function _isEmptyNode(id) {
      return store.treeModel.query({ id: id }).length == 0;
    }

    function _getNodeName(name, value) {
      if (value[name] == null || value[name] === undefined) {
        return coreConfig.translation[name].alias;
      }
      return value[name];
    }
  }

  function updateControls(e) {
    db.Substation.getByGeometry({ where: "1=1", geometry: map.extent }).then(function (data) {
      featuresToTreeModel(data, "Substation");
    });
    db.ACLineSegment.getByGeometry({ where: "1=1", geometry: map.extent }).then(function (data) {
      featuresToTreeModel(data, "ACLineSegment");
    });
    db.Switch.getByGeometry({ where: "1=1", geometry: map.extent }).then(function (data) {
      featuresToTreeModel(data, "Switch");
    });
  }

  function initSearchControl() {
    var _searchControl = new Search({
      enableButtonMode: false, //this enables the search widget to display as a single button
      enableInfoWindow: false,
      showInfoWindowOnSelect: false,
      enableHighlight: true,
      enableLabel: true,
      map: map
    }, "searchField");

    var sources = _searchControl.get("sources");

    for (var i = 0; i < coreConfig.editors.length; i++) {
      sources.push({
        featureLayer: new FeatureLayer(coreConfig.editors[i].url),
        searchFields: coreConfig.editors[i].searchFields,
        displayField: coreConfig.editors[i].searchFields[0],
        exactMatch: coreConfig.search.exactMatch,
        outFields: coreConfig.editors[i].searchFields,
        name: coreConfig.editors[i].alias,
        placeholder: coreConfig.editors[i].placeholder,
        maxResults: coreConfig.search.maxResults,
        maxSuggestions: coreConfig.search.maxSuggestions,
        enableSuggestions: coreConfig.search.enableSuggestions,
        minCharacters: coreConfig.minCharacters
      });
    }

    _searchControl.set("sources", sources);
    _searchControl.startup();
  }

  function initBaseMapList() {
    var vectorLayer = new VectorTileLayer("http://www.arcgis.com/sharing/rest/content/items/f96366254a564adda1dc468b447ed956/resources/styles/root.json", {
      id: "Векторная подложка",
      visibility: false
    });
    var osmLayer = map.getLayer("osm");
    var spaceLayer = map.getLayer("hybrid");
    var defLayer = map.getLayer("layer0");
    $("#basemapList li").click(function (e) {
      switch (e.target.text) {
        case "Космоснимки":
          vectorLayer.setVisibility(false);
          map.setBasemap("hybrid");
          break;
        case "Осветленная карта":
          vectorLayer.setVisibility(false);
          map.setBasemap("gray");
          break;
        case "Open Street Map":
          vectorLayer.setVisibility(false);
          map.setBasemap("osm");
          break;
        case "Векторная карта":
          map.addLayer(vectorLayer);
          vectorLayer.setVisibility(true);
          osmLayer.setVisibility(false);
          spaceLayer.setVisibility(false);
          defLayer.setVisibility(false);
          break;
      }
    });

    function setVisibleVectorLayer(status) {
      if (status == true) {} else {}
    }
  }

  function initLayerList() {
    var layerList = new LayerList({
      map: map,
      layers: null,
      subLayers: true
    }, "layersDiv");
    layerList.startup();
  }

  function initScaleBar() {
    new Scalebar({
      map: map,
      scalebarUnit: "metric"
    });
  }

  function loadEditorHandlers() {
    for (var i = 0; i < coreConfig.editors.length; i++) {
      loadEditorHandler(coreConfig.editors[i].id);
    }
  }

  function loadEditorHandler(id) {
    for (var i = 0; i < coreConfig.editors.length; i++) {
      if (coreConfig.editors[i].id == id) {
        coreConfig.editors[i].editorHandler = logic.getEditorHandler(id);
        coreConfig.editors[i].clickHandler = logic.getClickHandler(id);
        break;
      }
    }
  }

  function loadDictionaryEnum(dictionaryName, url, field, where) {
    idb.get("dict_" + dictionaryName).then(function (doc) {
      store.dicts[dictionaryName] = [];
      store.dicts[dictionaryName] = doc.data;
      forms.showNotify(" классификатор " + dictionaryName + " взят из кэша приложения", "info");
    }).catch(function (err) {
      var dictionary = new model({ url: url, className: "" });
      dictionary.getDictionary({ where: where }, [field]).then(_innerLoader);
    });

    function _innerLoader(data) {
      var features = data.features;
      var result = featuresPropertyToArray(features, field);
      store.dicts[dictionaryName] = [];
      store.dicts[dictionaryName] = result;
      idb.put({
        _id: "dict_" + dictionaryName,
        title: "dict_" + dictionaryName,
        data: result
      }).then(function (response) {
        // handle response
        console.log(response);
      }).catch(function (err) {
        console.log(err);
      });
      forms.showNotify(" загружен классификатор " + dictionaryName, "info");
    }
  }

  function loadDictionaries() {
    return new Promise(function (resolve, reject) {
      // загрузка словарей (для уменьшения нагрузки в дальнейшем
      for (var i = 0; i < coreConfig.dicts.length; i++) {
        loadDictionaryEnum(coreConfig.dicts[i].id, coreConfig.dicts[i].url, coreConfig.dicts[i].field, coreConfig.dicts[i].where);
      }
      resolve("success");
    });
  }

  function updateDictionaryEnum(dictionaryName, url, where) {
    var dictionary = new model({ className: dictionaryName, url: url });
    return dictionary.get({ where: where });
  }

  function getDictionaryIdValue(url, fieldName, value) {
    var dictionary = new model({ className: "", url: url });
    return dictionary.get({ where: fieldName + " = '" + value + "'" });
  }

  function getCascade(url, selectedValue, selectedFieldName, parentKey, chieldKey) {
    var dictionary = new model({ className: "", url: url });
    var where = "";
    if (selectedFieldName != null) {
      where = selectedFieldName + "='" + selectedValue + "'";
    }
    return dictionary.get({ where: where }) // получаем объект по значению списка
    .then(function (data) {
      var feature = context.first(data);
      var value = feature.attributes[chieldKey];
      var innerWhere = parentKey + "=" + value;
      return dictionary.get({ where: innerWhere }); //получаем объект по
    });
  }

  function initEditor(evt, currentSession) {
    var templateLayers = [];
    for (var i = 0; i < coreConfig.editors.length; i++) {

      var layerName = coreConfig.editors[i].id;
      var key = currentSession.attributes.userGroup + "." + currentSession.attributes.userRole;
      var roleEditors = coreConfig.roles[key]["editors"];
      var flag = roleEditors.some(function (item) {
        return item == layerName;
      });

      if (coreConfig.editors[i].editable == true && flag == true) templateLayers.push(store.editors[i]);
    }
    var templatePicker = new TemplatePicker({
      featureLayers: templateLayers,
      grouping: true,
      rows: "auto",
      columns: 5,
      showTooltip: true
    }, "templateDiv");
    templatePicker.startup();

    var layers = arrayUtils.map(evt.layers, function (result) {
      return { featureLayer: result.layer };
    });

    var layersInfos = [];
    for (var i = 0; i < layers.length; i++) {
      var layerInfo = layers[i];
      layerInfo.disableAttributeUpdate = true;
      layersInfos.push(layerInfo);
    }

    var undoManager = new UndoManager({ maxOperations: 100 });

    /** @namespace Editor.CREATE_TOOL_POLYGON */
    /** @namespace Editor.CREATE_TOOL_POLYLINE */
    var settings = {
      enableUndoRedo: true,
      maxUndoRedoOperations: 100,
      map: map,
      templatePicker: templatePicker,
      layerInfos: layersInfos,
      toolbarVisible: true,
      createOptions: {
        polylineDrawTools: [Editor.CREATE_TOOL_POLYLINE],
        polygonDrawTools: [Editor.CREATE_TOOL_POLYGON]
      },
      toolbarOptions: {
        reshapeVisible: true,
        cutVisible: true,
        mergeVisible: true
      },
      undoManager: undoManager
    };

    var params = { settings: settings };
    var _editor = new Editor(params, 'editorDiv');
    var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 25, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([50, 0, 200, 0.8]), 3), null);
    map.enableSnapping({
      alwaysSnap: true,
      snapPointSymbol: symbol,
      tolerance: 25,
      snapKey: 17
    });

    _editor.startup();
    forms.hideWindow("editor-container");
  }

  function initPouchDB() {
    return new Promise(function (resolve, reject) {
      idb = new PouchDB('idb', { adapter: "idb" });
      resolve("success");
    });
  }

  function saveColumnState(className, columnName, state) {
    return idb.upsert(className + "_columns", function (doc) {
      if (doc.data) {
        doc.data[columnName] = state;
      } else {
        doc.data = {};
        doc.data[columnName] = state;
      }
      return doc;
    });
  }

  function getColumnsState(className) {
    return idb.get(className + "_columns");
  }

  function initVoltageLevelGeneration() {
    bindClick("voltageLevelGeneration", function () {
      return db.Substation.getIds({ where: "1=1" }).then(function (data) {
        var ids = data;
        var i = 0;
        var interval = setInterval(function () {
          if (i == ids.length) {
            interval = 0;
          }
          generateVoltageLevel(ids[i]);
          i++;
        }, 200);
      });
    });

    function generateVoltageLevel(substationId) {
      var substation = {};
      return db.Substation.getById(substationId).then(function (data) {
        substation = context.first(data);
        return db.EquipmentContainer.get({ where: context.containerWhere("Substation", "VoltageLevel", substationId) });
      }).then(function (data) {
        var features = context.all(data);
        if (features.length == 0) {
          db.ACLineSegment.getByGeometry({ where: "1=1", geometry: substation.geometry, distance: 1 }).then(function (data) {
            var segments = context.all(data);
            var voltages = segments.map(function (item) {
              return item.attributes.nominalVoltage;
            });
            voltages = distinct(voltages);
            console.log('Создаем коллекцию РУ для ', substation.attributes.localName);
            console.log('Сегменты', segments);
            console.log('Напряжения', voltages);
            for (var i = 0; i < voltages.length; i++) {
              if (voltages[i] !== undefined) {
                var voltageLevel = {
                  attributes: {
                    localName: "РУ-" + voltages[i] + "кВ",
                    aliasName: "РУ-" + voltages[i] + "кВ",
                    assetType: "распределительное устройство",
                    nominalVoltage: voltages[i]
                  },
                  geometry: substation.geometry
                };
                console.log('Создается РУ для ' + voltages[i] + " кВ");
                db.VoltageLevel.add(voltageLevel).then(function (data) {
                  var chieldMRID = data[0][0].objectId;
                  var container = {
                    attributes: {
                      parentMRID: substationId,
                      chieldMRID: chieldMRID,
                      parentClassName: "Substation",
                      chieldClassName: "VoltageLevel"
                    },
                    geometry: substation.geometry
                  };
                  db.EquipmentContainer.add(container).then(function () {
                    console.log('Создано РУ на ПС ' + substation.attributes.localName);
                  });
                });
              }
            }
          });
        } else {
          console.log('На подстанции ' + substation.attributes.localName + " уже " + features.length + " РУ", features);
        }
      });
    }
  }

  function initACLineSegmentVoltageLevelConnection() {
    bindClick("acLineSegmentVoltageLevelConnection", function () {
      return db.ACLineSegment.getIds({ where: "1=1" }).then(function (data) {
        var ids = data;
        var i = 0;
        var interval = setInterval(function () {
          if (i == ids.length) {
            interval = 0;
          }
          acLineSegmentVoltageLevelConnect(ids[i], 1);
          acLineSegmentVoltageLevelConnect(ids[i], 2);
          i++;
        }, 500);
      });
    });

    function acLineSegmentVoltageLevelConnect(parentId, terminalNumber) {
      var where = "parentClassName='ACLineSegment' AND chieldClassName='VoltageLevel' AND parentMRID=" + parentId;
      return db.AssetContainer.get({ where: where }).then(function (data) {
        var features = context.all(data);
        var hasTerminals = features.some(function (item) {
          var attributes = item.attributes;
          var terminal = Number(attributes.localName.replace("terminal", ""));
          return terminal == terminalNumber;
        });
        if (features.length !== 0 || hasTerminals == true) {
          console.log("");
          console.log("Сегмент [" + parentId + "], терминал [" + terminalNumber + "] -> " + features.length + " связей с РУ");
          console.log("");
        } else {
          var acLineSegment = {};
          db.ACLineSegment.getById(parentId).then(function (data) {
            acLineSegment = context.first(data);
            var point = terminalNumber === 1 ? carto.getFirstPointInLine(acLineSegment.geometry) : carto.getLastPointInLine(acLineSegment.geometry);
            db.VoltageLevel.getByGeometry({ where: "1=1", geometry: point, distance: 1 }).then(function (data) {
              var voltageLevels = context.all(data);
              console.log("");
              console.log("Сегмент [" + parentId + "] имеет " + voltageLevels.length + " пересечений");

              var targetVoltageLevel = voltageLevels.find(function (item) {
                return item.attributes.nominalVoltage == acLineSegment.attributes.nominalVoltage;
              });
              console.log("Целевой id РУ -" + targetVoltageLevel.attributes.OBJECTID);
              console.log("");
              var point = terminalNumber === 1 ? carto.getFirstPointInLine(acLineSegment.geometry) : carto.getLastPointInLine(acLineSegment.geometry);
              var topologyNode = {
                attributes: {
                  localName: "terminal" + terminalNumber,
                  parentClassName: "ACLineSegment",
                  chieldClassName: "VoltageLevel",
                  parentMRID: parentId,
                  chieldMRID: targetVoltageLevel.attributes.OBJECTID
                },
                geometry: point
              };
              db.AssetContainer.add(topologyNode).then(function (data) {
                console.log("Связь Segment[" + acLineSegment.attributes.localName + "] - VL[" + targetVoltageLevel.attributes.OBJECTID + "] -> id=" + data[0][0].objectId);
              });
            });
          });
        }
      });
    }
  }

  return {
    initLoginWindow: initLoginWindow,
    initPouchDB: initPouchDB,
    createFeatureLayer: createFeatureLayer,
    initEditor: initEditor,
    loadVectorLayers: loadVectorLayers,
    loadEditorLayers: loadEditorLayers,
    loadControls: loadControls,
    loadEditorHandlers: loadEditorHandlers,
    loadDictionaryEnum: loadDictionaryEnum,
    loadDictionaries: loadDictionaries,
    loadDB: loadDB,
    initTableFeatureLayer: initTableFeatureLayer,
    initList: initList,
    updateDictionaryEnum: updateDictionaryEnum,
    getDictionaryIdValue: getDictionaryIdValue,
    getCascade: getCascade,
    bindClick: bindClick,
    saveColumnState: saveColumnState,
    getColumnsState: getColumnsState,
    initPilotGPS: initPilotGPS
  };
});

//# sourceMappingURL=utils-compiled.js.map