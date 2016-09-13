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
define(["./js/app/forms/forms-compiled.js", "./js/app/dataAccess/model-compiled.js", "./js/app/domain/http-compiled.js", "./js/app/domain/dxf.js", "./js/app/domain/generators-compiled.js", "./js/app/domain/carto-compiled.js"], function (forms, model, httpUtils, dxfUtils, generators, carto) {
  let showSituationCenterMessages = (() => {
    var ref = _asyncToGenerator(function* () {
      const windowName = "situationCenter-container";
      const tableName = "Message-List";
      forms.toWindow(windowName, "Сведения САЦ");
      forms.showWindow(windowName);

      bindClick("addMessage", _asyncToGenerator(function* () {
        var protoFeature = generators.Message.default;
        protoFeature.geometry = carto.getGpxPoint();
        protoFeature.attributes.subject = userAccount.userName;
        //protoFeature.attributes.createdDateTime =;
        var data = yield db.Message.add(protoFeature);
        var id = data[0][0].objectId;
        data = yield db.Message.getById(id);
        var feature = context.first(data);
        forms.appendRowInTable(tableName, feature.attributes);
      }));

      bindClick("editMessage", _asyncToGenerator(function* () {
        var objectId = forms.getObjectID(tableName);
        var data = yield db.Message.getById(objectId);
        var feature = context.first(data);
        forms.open("Message", feature);
      }));

      bindClick("deleteMessage", _asyncToGenerator(function* () {
        var ids = forms.getObjectIDS(tableName);
        forms.removeSelectedRows(tableName);
        for (var i = 0; i < ids.length; i++) {
          db.Message.delById(ids[i]);
        }
      }));

      var data = yield db.Message.get({ where: "1=1" });
      var features = context.all(data);
      forms.createTable(tableName, features, "Message");
    });

    return function showSituationCenterMessages() {
      return ref.apply(this, arguments);
    };
  })();

  var context = new model({ url: "", className: "context", map: map });

  return {
    showSituationCenterMessages: showSituationCenterMessages
  };
});

//# sourceMappingURL=sac-compiled.js.map

//# sourceMappingURL=sac-compiled-compiled.js.map

//# sourceMappingURL=sac-compiled-compiled-compiled.js.map