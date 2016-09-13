/**
 * Created by lomteva.aa on 06.05.2016.
 */
define([
    './js/app/dataAccess/model-compiled.js',
    '../../../../Application/'+_currentServer+'/config/config.js'],
  function (model,
            config) {

    function getElementFromArray(arr, prop, value) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][prop] === value) return arr[i];
      }
      return {};
    }

    return {
      getDocuments: async function (className, id, documentType) {
        var db = {};
        db["Document"] = new model({
          url: getElementFromArray(config.editors, "id", "Document")["url"],
          className: "Document"
        });
        db["DocumentIdentificationObjectRole"] = new model({
          url: getElementFromArray(config.editors, "id", "DocumentIdentificationObjectRole")["url"],
          className: "DocumentIdentificationObjectRole"
        });
        var where = "parentClassName='" + className + "' AND chieldClassName='Document' AND parentMRID=" + id;
        var data = await (db.DocumentIdentificationObjectRole.get({where: where}));
        var containers = data.features;
        var docIds = containers.map(function (item) {
          return item.attributes.chieldMRID
        });
        data = await (db.Document.getByArray(docIds));
        var documents = data.features;
        documents = documents.map(function (item) {
          if (!documentType) {
            return item;
          }
          else {
            if (item.attributes.docType === documentType) {
              return item;
            }
          }
        });
        return documents;
      }
    }
  });