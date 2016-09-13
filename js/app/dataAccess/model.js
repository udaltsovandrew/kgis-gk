/**
 * Created by udaltsov on 29.10.15.
 */
"use strict";

define([
    "esri/layers/FeatureLayer",
    "esri/tasks/query",
    "esri/graphic",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/SpatialReference",
    "esri/request",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/promise/all"
  ],
  function (FeatureLayer,
            Query,
            Graphic,
            Point,
            Polyline,
            SpatialReference,
            esriRequest,
            declare,
            lang,
            promisesAll) {
    
    function protoFeature() {
      return {
        geometry:   null,
        attributes: {
          _PROTO_INDICATOR: true
        }
      }
    }
    
    var model;
    model = declare(null, {
      url:         "",
      className:   "",
      classAlias:  "",
      usage:       "",
      map:         null,
      constructor: function (config) {
        this.url = config.url;
        this.className = config.className;
        this.classAlias = config.classAlias;
        this.usage = config.usage;
        this.map = config.map;
        
        /**
         *
         * @param parentClassName
         * @param chieldClassName
         * @param parentMRID
         * @param chieldMRID
         * @returns {string}
         */
        this.containerWhere = function (parentClassName, chieldClassName, parentMRID, chieldMRID) {
          var where = "parentClassName='" + parentClassName + "' AND " + "chieldClassName='" + chieldClassName + "'";
          if (parentMRID != null) where += " AND parentMRID=" + parentMRID;
          if (chieldMRID != null) where += " AND chieldMRID=" + chieldMRID;
          return where;
        };
        
        /**
         * обобщенный метод для получения promise для создания объекта в сервисе esri
         * @param data
         * @returns {*}
         */
        this.add = function (data) {
          var attributes = data.attributes;
          var geometry = data.geometry;
          var graphic = new Graphic(geometry, null, attributes, null);
          if ((graphic.geometry === null) || (graphic.attributes === null)) {
            var _geometry = null;
            try {
              switch (data.attributes.geometryType) {
                case "point":
                  if ((data.geometry.x !== undefined) || (data.geometry.y !== undefined)) {
                    _geometry = new Point(data.geometry.x, data.geometry.y, new SpatialReference(102100));
                  }
                  break;
                case "polyline":
                  if (data.geometry.paths !== undefined) {
                    _geometry = new Polyline(new SpatialReference({wkid: 102100}));
                    for (var i = 0; i < data.geometry.paths.length; i++) {
                      _geometry.addPath(data.geometry.paths[i]);
                    }
                  }
              }
            }
            catch (e) {
            }
            
            graphic = new Graphic(_geometry, null, attributes, null);
          }
          var layer = new FeatureLayer(this.url);
          //noinspection JSUnresolvedFunction
          return layer.applyEdits([graphic], [], []).promise;
        };
        
        /**
         *
         * @param data
         * @returns {*}
         */
        this.addArray = function (data) {
          var layer = new FeatureLayer(this.url);
          var graphics = [];
          for (var i = 0; i < data.length; i++) {
            var attributes = data[i].attributes;
            var geometry = data[i].geometry;
            var graphic = new Graphic(geometry, null, attributes, null);
            graphics.push(graphic);
          }
          //noinspection JSUnresolvedFunction
          return layer.applyEdits(graphics, null, null).promise;
        };
        
        /**
         * @comment обобщенный метод для получения promise для чтения объекта в сервисе esri;
         * @comment позволяет выполнить запрос с учетом where (без учета геометрии);
         * @comment возвращает обещание (promise), для получения ответа необходимо использовать конструкцию вида
         * @comment classObject.get({where: "1=1"}).then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param data
         * @param data.where
         * @param data.num
         * @returns {*}
         */
        this.get = function (data) {
          var layer = new FeatureLayer(this.url);
          var query = new Query();
          query.where = data.where;
          if (data.num) query.num = data.num;
          query.returnGeometry = true;
          query.outFields = ['*'];
          /** @namespace data.orderByFields */
          if (data.orderByFields) query.orderByFields = data.orderByFields;
          return layer.queryFeatures(query).promise;
        };
        
        /**
         * @comment обобщенный метод для получения promise для чтения словаря из сервиса esri;
         * @comment позволяет выполнить запрос с учетом where (не возвращает геометрию объекта);
         * @comment возвращает обещание (promise), для получения ответа необходимо использовать конструкцию вида
         * @comment classObject.get({where: "1=1"}).then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param data
         * @param data.where - условие
         * @param fields - возвращаемые поля
         * @returns {*}
         */
        this.getDictionary = function (data, fields) {
          var layer = new FeatureLayer(this.url);
          var query = new Query();
          query.where = data.where === undefined ? "1=1" : data.where;
          query.orderByFields = fields;
          query.returnGeometry = false;
          query.outFields = fields;
          query.returnDistinctValues = true;
          return layer.queryFeatures(query).promise;
        };
        
        /**
         * @comment обобщенный метод для получения promise для выполнения запроса с учетом входящего геометрического фильтра из сервиса esri;
         * @comment позволяет выполнить запрос с учетом where и geometry;
         * @comment возвращает обещание (promise), для получения ответа необходимо использовать конструкцию вида
         * @comment classObject
         * @comment   .getByGeometry({where: "1=1", geometry: feature.geometry})
         * @comment   .then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param data
         * @param data.where
         * @param data.geometry
         * @param data.distance
         * @returns {*}
         */
        this.getByGeometry = function (data) {
          var layer = new FeatureLayer(this.url);
          var query = new Query();
          query.where = data.where;
          if (data.geometry) query.geometry = data.geometry;
          query.returnGeometry = true;
          //экспериментальное значение
          query.distance = 1;
          if (data.distance != undefined) query.distance = data.distance;
          query.outFields = ['*'];
          return layer.queryFeatures(query).promise;
        };
        
        /**
         * обобщенный метод для получения promise для чтения объекта в сервисе esri
         * @param id
         * @returns {*}
         */
        this.getById = function (id) {
          var layer = new FeatureLayer(this.url);
          var query = new Query();
          query.where = "OBJECTID = " + id;
          query.returnGeometry = true;
          query.outFields = ['*'];
          return layer.queryFeatures(query).promise;
        };
        
        /**
         * @comment обобщенный метод для получения promise для выполнения запроса с учетом входящего фильтра из сервиса
         * @comment возвращает обещание (promise), для получения ответа необходимо использовать конструкцию вида
         * @comment classObject
         * @comment   .getByData({where: "1=1"})
         * @comment   .then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param data
         * @param data.where
         * @returns {*}
         */
        this.getByData = function (data) {
          var layer = new FeatureLayer(this.url);
          var query = new Query();
          query.where = "OBJECTID = " + data[0][0]["objectId"];
          query.returnGeometry = true;
          query.outFields = ['*'];
          return layer.queryFeatures(query).promise;
        };
        
        /**
         * @comment обобщенный метод для получения promise для выполнения запроса с учетом входящего фильтра из сервиса
         * @comment возвращает обещание (promise), для получения ответа необходимо использовать конструкцию вида
         * @comment classObject
         * @comment   .getByArray([1, 2, 4, 12, 400, 422])
         * @comment   .then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param data - массив значений OBJECTID
         * @returns {*}
         */
        this.getByArray = function (data) {
          var layer = new FeatureLayer(this.url);
          var query = new Query();
          var where = "OBJECTID = -1";
          if (data.length > 0) {
            where = data.join(" OR OBJECTID = ");
            where = "OBJECTID = " + where;
          }
          query.where = where;
          query.returnGeometry = true;
          query.outFields = ['*'];
          return layer.queryFeatures(query).promise;
        };
        
        /**
         * @comment многопоточный запрос, пока не используется, находится в стадии рассмотрения
         * @param data
         * @param data.candidates
         * @param data.where
         * @returns {*}
         */
        this.getMultiple = function (data) {
          var query = new Query();
          if (data.where !== undefined) query.where = data.where;
          var candidates = data.candidates;
          var queries = [];
          for (var i = 0; i < candidates.length; i++) {
            queries.push(candidates[i].queryFeatures(query));
          }
          return promisesAll(queries).promise;
        };
        
        this.getIds = function (data) {
          var layer = new FeatureLayer(this.url);
          var query = new Query();
          query.where = data.where !== undefined ? data.where : "1=1";
          //noinspection JSUnresolvedFunction
          return layer.queryIds(query).promise;
        };
        
        /**
         * обобщенный метод для получения promise для обновления объекта в сервисе esri
         * @comment classObject
         * @comment   .set(updatedFeature)
         * @comment   .then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param data
         * @returns {*}
         */
        this.set = function (data) {
          var attributes = lang.clone(data.attributes);
          var geometry = lang.clone(data.geometry);
          var graphic = {
            attributes: attributes,
            geometry:   geometry
          };
          graphic = JSON.stringify(graphic);
          var url = this.url + "/updateFeatures";
          return $.post(url, {
            features: "[" + graphic + "]",
            f:        "json"
          }).done();
        };
        
        /**
         * обобщенный метод для получения promise для обновления объекта в сервисе esri
         * @comment classObject
         * @comment   .setArray([feature1, feature2])
         * @comment   .then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param data
         * @returns {*}
         */
        this.setArray = function (data) {
          var result = [];
          for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var attributes = lang.clone(item.attributes);
            var geometry = lang.clone(item.geometry);
            var graphic = {
              attributes: attributes,
              geometry:   geometry
            };
            graphic = JSON.stringify(graphic);
            result.push(graphic);
          }
          result = result.join(",");
          result = "[" + result + "]";
          var url = this.url + "/updateFeatures";
          return $.post(url, {
            features: result,
            f:        "json"
          }).done();
        };
        
        /**
         * обобщенный метод для получения promise для обновления объекта в сервисе esri
         * @comment classObject
         * @comment   .update(updatedFeature)
         * @comment   .then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param data
         * @returns {*}
         */
        this.update = function (data) {
          var attributes = data.attributes;
          var geometry = data.geometry;
          var graphic = new Graphic(geometry, null, attributes, null);
          var layer = new FeatureLayer(this.url);
          //noinspection JSUnresolvedFunction
          return layer.applyEdits(null, [graphic], null).promise;
        };
        
        /**
         * обобщенный метод для приведения геометрии объектов к целевой геометрии
         * @comment classObject
         * @comment   .set(updatedFeature)
         * @comment   .then(function(result) { ОБРАБАТЫВАЕМ ПОЛЕЗНЫЙ РЕЗУЛЬТАТ}, function(error) { ОБРАБАТЫВАЕМ ОШИБКИ })
         * @param features - коллекция входных объектов
         * @param geometry - целевая геометрия
         * @returns {*}
         */
        this.updateFeaturesGeometry = function (features, geometry) {
          for (var i = 0; i < features.length; i++) {
            features[i].geometry = geometry;
          }
          return features;
        };
        
        /**
         * обобщенный метод для получения promise для удаления объекта в сервисе esri
         * @param data
         * @param data.where - условие для отбора удаляемых объектов
         * @returns {*}
         */
        this.del = function (data) {
          return $.post(this.url + "/deleteFeatures", {where: data.where}).promise();
        };
        
        /**
         * обобщенный метод для получения promise для удаления объекта в сервисе esri
         * @param data - коллекция id удаляемых объектов
         * @returns {*}
         */
        this.delByArray = function (data) {
          if ((data == null) || (data === undefined) || (data == [])) {
            return $.post(this.url + "/deleteFeatures", {where: "OBJECTID = -1"}).promise();
          }
          var where = data.join(" OR OBJECTID = ");
          where = "OBJECTID = " + where;
          return $.post(this.url + "/deleteFeatures", {where: where}).promise();
        };
        
        /**
         * обобщенный метод для получения promise для удаления объекта в сервисе esri
         * @param id - OBJECTID удаляемого объекта
         * @returns {*}
         */
        this.delById = function (id) {
          return $.post(this.url + "/deleteFeatures", {where: "OBJECTID = " + id}).promise();
        };
        
        /**
         * обобщенный метод для получения первого объекта после разрешения promise через then(function(data){})
         * @comment className.getByArray([1, 2, 3, 5]).then(function(data) { var firstFeature = className.first(data); })
         * @param data - коллекция id удаляемых объектов
         * @returns {*}
         */
        this.first = function (data) {
          if ((data == null) || (data === undefined)) {
            return protoFeature();
          }
          return data.features[0];
        };
        
        /**
         * обобщенный метод для получения последнего объекта после разрешения promise через then(function(data){})
         * @comment className.getByArray([1, 2, 3, 5]).then(function(data) { var lastFeature = className.last(data); })
         * @param data
         * @returns {*}
         */
        this.last = function (data) {
          if ((data == null) || (data === undefined)) {
            return protoFeature();
          }
          return data.features[features.length - 1];
        };
        
        /**
         * обобщенный метод для получения всех объектов после разрешения promise через then(function(data){})
         * @comment className.getByArray([1, 2, 3, 5]).then(function(data) { var features = className.all(data); })
         * @param data
         * @returns {*}
         */
        this.all = function (data) {
          if ((data == null) || (data === undefined)) {
            return [protoFeature()];
          }
          return data.features;
        };
        
        /**
         * обобщенный метод для получения всех объектов после разрешения promise через then(function(data){})
         * @comment className.getByArray([1, 2, 3, 5]).then(function(data) { var features = className.all(data); })
         * @param data
         * @returns {*}
         */
        this.allByFilter = function (data, fieldName, value) {
          if ((data == null) || (data === undefined)) {
            return [protoFeature()];
          }
          var result = [];
          for (var i = 0; i < data.features.length; i++) {
            if (data.features[i].attributes[fieldName] == value) result.push(data.features[i]);
          }
          return result;
        };
        
        /**
         * Получение идентификатора объекта
         * @param data = feature {attributes, geometry}
         * @returns {*}
         */
        this.key = function (data) {
          return data.attributes["OBJECTID"];
        };
        
        /**
         * Получение идентификатора объекта, если он не равен OBJECTID
         * @param data = feature {attributes, geometry}
         * @param fieldName
         * @returns {*}
         */
        this.keyByField = function (data, fieldName) {
          return data.attributes[fieldName];
        };
        
        this.refresh = function (data) {
        };
        
        /**
         * Возвращает прототип контейнера
         * @param parentMRID
         * @param chieldMRID
         * @param parentClassName
         * @param chieldClassName
         * @param geometry
         * @returns {{geometry: *, attributes: {parentMRID: *, chieldMRID: *, parentClassName: *, chieldClassName: *}}}
         */
        this.containerTemplate = function (parentMRID, chieldMRID, parentClassName, chieldClassName, geometry) {
          return {
            geometry:   geometry,
            attributes: {
              parentMRID:      parentMRID,
              chieldMRID:      chieldMRID,
              parentClassName: parentClassName,
              chieldClassName: chieldClassName
            }
          }
        };
        /**
         * Возвращает информацию по созданным объектам после операции редактирования
         * @param data
         * @returns {*}
         */
        this.getAdds = function (data) {
          return data[0];
        };
        /**
         * Возвращает информацию по обновленным объектам после операции редактирования
         * @param data
         * @returns {*}
         */
        this.getUpdates = function (data) {
          return data[0];
        };
        /**
         * Возвращает информацию по удаленным объектам после операции редактирования
         * @param data
         * @returns {*}
         */
        this.getDeletes = function (data) {
          return data[1];
        }
      }
    });
    
    return model;
  });