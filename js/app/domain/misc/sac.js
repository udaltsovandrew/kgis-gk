/**
 * Created by lomteva.aa on 23.08.2016.
 */
define([
  "./js/app/forms/forms-compiled.js",
  "./js/app/dataAccess/model-compiled.js",
  "./js/app/domain/http-compiled.js",
  "./js/app/domain/dxf.js",
  "./js/app/domain/generators-compiled.js",
  "./js/app/domain/carto-compiled.js"
], function (forms,
             model,
             httpUtils,
             dxfUtils,
             generators,
             carto) {

  var context = new model({url: "", className: "context", map: map});

  async function showSituationCenterMessages() {
    const windowName = "situationCenter-container";
    const tableName = "Message-List";
    forms.toWindow(windowName, "Сведения САЦ");
    forms.showWindow(windowName);



    bindClick("addMessage", async function () {
      var protoFeature = generators.Message.default;
      protoFeature.geometry = carto.getGpxPoint();
      protoFeature.attributes.subject = userAccount.userName;
      //protoFeature.attributes.createdDateTime =;
      var data = await (db.Message.add(protoFeature));
      var id = data[0][0].objectId;
      data = await (db.Message.getById(id));
      var feature = context.first(data);
      forms.appendRowInTable(tableName, feature.attributes)
    });

    bindClick("editMessage", async function () {
      var objectId = forms.getObjectID(tableName);
      var data = await (db.Message.getById(objectId));
      var feature = context.first(data);
      forms.open("Message", feature);
    });

    bindClick("deleteMessage", async function () {
      var ids = forms.getObjectIDS(tableName);
      forms.removeSelectedRows(tableName);
      for (var i = 0; i < ids.length; i++) {
        db.Message.delById(ids[i]);
      }
    });

    var data = await (db.Message.get({where: "1=1"}));
    var features = context.all(data);
    forms.createTable(tableName, features, "Message");
  }

  return {
    showSituationCenterMessages: showSituationCenterMessages
  }
});
