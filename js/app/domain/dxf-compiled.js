/**
 * Created by udaltsov on 30.06.16.
 */
define(["./js/app/forms/forms-compiled.js", "./js/app/dataAccess/model-compiled.js", "./js/app/domain/http-compiled.js"], function (forms, model, httpUtils) {

  function filterData(features, property, value) {
    var result = [];
    for (var i = 0; i < features.length; i++) {
      if (features[i].attributes[property] === value) {
        var feature = {
          geometry: features[i].geometry,
          attributes: features[i].attributes
        };
        feature.attributes.statusRemarks = value;
        delete feature.attributes.layer;
        result.push(feature);
      }
    }
    return result;
  }

  function loadNetworkProject() {
    "use strict";

    const windowName = "networkProject-container";
    forms.toWindow(windowName, "Импорт проекта присоединения");
    forms.showWindow(windowName);

    var statusRemarks;
    var _features;
    var _powerLines;
    var _substations;
    var _structures;
    var _data;
    var element = $("#networkProject-result");

    forms.getUpload("importProjectDocument", config.documents.saveUrl + "?className=Project" + "&id=" + 0).then(function (data) {
      var filesData = data;
      var fileName = filesData[0].name;
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(fileName);
        }, 1000);
      });
    }).then(function (data) {
      return httpUtils.GET("http://localhost:3000/importDxf/" + data);
    }).then(function (data) {
      console.log(data);
      _data = JSON.parse(data);
      _features = _data.features;
      _powerLines = filterData(_features, "layer", "PowerLine");
      _substations = filterData(_features, "layer", "Substation");
      _structures = filterData(_features, "layer", "Structure");

      statusRemarks = data.statusRemarks;
      return db.PowerLine.del({ where: "statusRemarks='" + statusRemarks + "'" });
    }).then(function () {
      return db.PowerLine.del({ where: "statusRemarks='" + statusRemarks + "'" });
    }).then(function () {
      return db.Structure.del({ where: "statusRemarks='" + statusRemarks + "'" });
    }).then(function () {
      for (let i = 0; i < _substations.length; i++) {
        db.Substation.add(_substations[i]);
      }
      for (let i = 0; i < _structures.length; i++) {
        db.Structure.add(_structures[i]);
      }
      for (let i = 0; i < _powerLines.length; i++) {
        db.PowerLine.add(_powerLines[i]);
      }
    });
  }

  return {
    loadNetworkProject: loadNetworkProject
  };
});

//# sourceMappingURL=dxf-compiled.js.map