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
 * Created by lomteva.aa on 06.05.2016.
 */
define(['./js/app/dataAccess/model-compiled.js', '../../../../Application/' + _currentServer + '/config/config.js'], function (model, config) {

  function getElementFromArray(arr, prop, value) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][prop] === value) return arr[i];
    }
    return {};
  }

  return {
    getDocuments: (() => {
      var ref = _asyncToGenerator(function* (className, id, documentType) {
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
        var data = yield db.DocumentIdentificationObjectRole.get({ where: where });
        var containers = data.features;
        var docIds = containers.map(function (item) {
          return item.attributes.chieldMRID;
        });
        data = yield db.Document.getByArray(docIds);
        var documents = data.features;
        documents = documents.map(function (item) {
          if (!documentType) {
            return item;
          } else {
            if (item.attributes.docType === documentType) {
              return item;
            }
          }
        });
        return documents;
      });

      return function getDocuments(_x, _x2, _x3) {
        return ref.apply(this, arguments);
      };
    })()
  };
});

//# sourceMappingURL=utils-compiled.js.map

//# sourceMappingURL=utils-compiled-compiled.js.map