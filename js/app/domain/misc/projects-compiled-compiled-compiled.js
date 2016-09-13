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

/**
 * Created by lomteva.aa on 23.08.2016.
 */
/**
 * Created by lomteva.aa on 23.08.2016.
 */
define(["./js/app/forms/forms-compiled.js", "./js/app/dataAccess/model-compiled.js"], function (forms, model) {
  let initProjectClassNameTab = (() => {
    var ref = _asyncToGenerator(function* (feature, className) {
      var id = feature.attributes.OBJECTID;
      var tableName = "Project-" + className + "-List";

      bindClick("linkProject" + className, _asyncToGenerator(function* () {
        var editor = _getEditorLayer(className);
        //noinspection JSUnresolvedFunction
        var candidates = editor.getSelectedFeatures();
        var ids = candidates.map(function (item) {
          return item.attributes.OBJECTID;
        });
        var containers = ids.map(function (childId) {
          return {
            geometry: feature.geometry,
            attributes: {
              parentMRID: id,
              parentClassName: "Project",
              chieldClassName: className,
              chieldMRID: childId
            }
          };
        });
        var action = yield db.PsrIdObjectRole.addArray(containers);
        if (action) {
          initProjectClassNameTab(feature, className);
        }
      }));

      bindClick("relinkProject" + className, _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(tableName);
        var chieldIds = "chieldMRID=" + ids.join(" OR chieldMRID=");
        var where = "parentMRID=" + id + " AND parentClassName='Project' AND chieldClassName='" + className + "' AND (" + chieldIds + ")";
        var containers = yield db.PsrIdObjectRole.get({ where: where });
        containers = context.all(containers);
        ids = containers.map(function (item) {
          return item.attributes.OBJECTID;
        });
        var action = yield db.PsrIdObjectRole.delByArray(ids);
        if (action) {
          forms.removeSelectedRows(tableName);
        }
      }));

      var where = "parentClassName='Project' AND chieldClassName='" + className + "' AND parentMRID=" + id;
      var data = yield db.PsrIdObjectRole.get({ where: where });
      var features = context.all(data);
      var ids = features.map(function (item) {
        return item.attributes.chieldMRID;
      });
      where = "OBJECTID=" + ids.join(" OR OBJECTID=");
      data = yield db[className].get({ where: where });
      features = context.all(data);
      forms.createTable(tableName, features, className);
    });

    return function initProjectClassNameTab(_x, _x2) {
      return ref.apply(this, arguments);
    };
  })();

  let showNetworkProjects = (() => {
    var ref = _asyncToGenerator(function* () {
      const windowName = "project-container";
      const tableName = "Project-List";
      forms.toWindow(windowName, "Проекты развития сети");
      forms.showWindow(windowName);

      bindClick("addProject", _asyncToGenerator(function* () {
        var protoFeature = generators.Project.default;
        protoFeature.geometry = carto.getGpxPoint();
        protoFeature.attributes.subject = userAccount.userName;
        //protoFeature.attributes.createdDateTime =;
        var data = yield db.Project.add(protoFeature);
        var id = data[0][0].objectId;
        data = yield db.Project.getById(id);
        var feature = context.first(data);
        forms.appendRowInTable(tableName, feature.attributes);
      }));

      bindClick("editProject", _asyncToGenerator(function* () {
        var objectId = forms.getObjectID(tableName);
        var data = yield db.Project.getById(objectId);
        var feature = context.first(data);
        forms.open("Project", feature);
        initProjectClassNameTab(feature, "CustomerOrganisation");
        initProjectClassNameTab(feature, "CustomerErpPerson");
        initProjectClassNameTab(feature, "PowerLine");
        initProjectClassNameTab(feature, "Substation");
      }));

      bindClick("deleteProject", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(tableName);
        forms.removeSelectedRows(tableName);
        for (var i = 0; i < ids.length; i++) {
          db.Project.delById(ids[i]);
        }
      }));

      bindClick("showProject", _asyncToGenerator(function* () {
        var id = forms.getObjectID(tableName);
        var classes = ["Substation", "PowerLine", "CustomerOrganisation", "CustomerErpPerson"];
        classes.forEach((() => {
          var ref = _asyncToGenerator(function* (classItem) {
            var where = "parentClassName='Project' AND chieldClassName='" + classItem + "' AND parentMRID=" + id;
            var data = yield db.PsrIdObjectRole.get({ where: where });
            var features = context.all(data);
            var ids = features.map(function (item) {
              return item.attributes.chieldMRID;
            });
            where = "OBJECTID=" + ids.join(" OR OBJECTID=");
            var editor = _getEditorLayer(classItem);
            editor.setDefinitionExpression(where);
            editor.refresh();
          });

          return function (_x3) {
            return ref.apply(this, arguments);
          };
        })());
      }));

      bindClick("clearProject", _asyncToGenerator(function* () {
        var classes = ["Substation", "PowerLine", "CustomerOrganisation", "CustomerErpPerson"];
        classes.forEach((() => {
          var ref = _asyncToGenerator(function* (classItem) {
            var editor = _getEditorLayer(classItem);
            /** @namespace editor.defaultDefinitionExpression */
            editor.setDefinitionExpression(editor.defaultDefinitionExpression);
            editor.refresh();
          });

          return function (_x4) {
            return ref.apply(this, arguments);
          };
        })());
      }));

      bindClick("exportProject", _asyncToGenerator(function* () {
        var id = forms.getObjectID(tableName);
        var classes = ["Substation", "PowerLine", "CustomerOrganisation", "CustomerErpPerson"];
        var types = {
          "Substation": "esriGeometryPoint",
          "PowerLine": "esriGeometryPolyline",
          "CustomerErpPerson": "esriGeometryPoint",
          "CustomerOrganisation": "esriGeometryPoint"
        };
        var _result = [];
        for (var i = 0; i < classes.length; i++) {
          var items = yield getChields(id, "Project", classes[i], "PsrIdObjectRole");
          items = _convertFeatures(items, classes[i], types[classes[i]]);
          for (var j = 0; j < items.length; j++) _result.push(JSON.stringify(items[j]));
        }

        return httpUtils.POST("http://localhost:3000/exportDxf", {
          data: _result
        }).then(function (data) {
          var fileName = "file://" + JSON.parse(data)["fileInfo"];
          forms.toWindow("fileDownload", "Скачивание файла");
          var element = $("#fileDownload-content")[0];
          element.innerHTML = "";
          element.innerHTML += "" + "<div class='container'>" + "<div class='text-default'>" + "Файл проекта, содержащий исходные данные для выполнения ПИР" + "</div>" + "<br>" + "<a class='btn btn-default' href='" + fileName + "'>" + "<span class='glyphicon glyphicon-cloud-download'></span>" + " Скачать" + "</a>" + "<br>" + "<hr>" + "<div class='text-default'>" + "Если не удается загрузить файл, используйте прямой путь" + "<br>" + "<div class='text-success'>" + "" + fileName + "" + "</div>" + "</div>" + "</div>";
          forms.showWindow("fileDownload");
        });
      }));

      var data = yield db.Project.get({ where: "1=1" });
      var features = context.all(data);
      forms.createTable(tableName, features, "Project");
    });

    return function showNetworkProjects() {
      return ref.apply(this, arguments);
    };
  })();

  var context = new model({ url: "", className: "context", map: map });

  function _convertFeatures(data, layerName, geometryType) {
    var features = data;
    features = features.map(function (item) {
      return {
        attributes: item.attributes,
        geometry: item.geometry,
        layer: layerName,
        geometryType: geometryType
      };
    });
    return features;
  }

  return {
    initProjectClassNameTab: initProjectClassNameTab,
    showNetworkProjects: showNetworkProjects
  };
});

//# sourceMappingURL=projects-compiled.js.map

//# sourceMappingURL=projects-compiled-compiled.js.map

//# sourceMappingURL=projects-compiled-compiled-compiled.js.map