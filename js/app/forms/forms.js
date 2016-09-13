/**
 * Created by udaltsov on 27.10.15.
 */
"use strict";

define([
    //"../../../../Application/"+_currentServer+"/config/config-compiled.js",
    "./js/app/dataAccess/model-compiled.js",
    "./js/app/domain/carto-compiled.js"
  ],
  function (//coreConfig,
            coreModel,
            carto) {

    function showNode(node) {
      $("#" + node).show();
    }

    function hideNode(node) {
      $("#" + node).hide();
    }

    function getNodeName(className) {
      return className;
    }

    function getRoot(className) {
      return className;
    }

    function showWindow(elementName) {
      var panel = $("#" + elementName);
      panel.data("kendoWindow").open();
    }

    function hideWindow(elementName) {
      var panel = $("#" + elementName);
      panel.data("kendoWindow").close();
    }

    function generateTab(rootElement, tabName, text) {
      var element = $("#" + rootElement)[0];
      var href = '#' + tabName + '-Table';
      var tabHtml = "<li><a data-toggle='tab' href='" + href + "'>";
      tabHtml += text;
      tabHtml += "</a></li>";
      element.innerHTML += tabHtml;
    }

    function generateTabContainer(rootElement, className) {
      var element = $("#" + rootElement)[0];
      var containerHtml = "<div class='tab-pane clear-padding active' " +
        "id='" + className + "-Table'>";
      containerHtml += "<div id='" + className + "-List'></div>";
      containerHtml += "</div>";
      element.innerHTML += containerHtml;
    }

    function showNotify(text, notifyState) {
      //noinspection JSUnresolvedFunction
      var popupNotification = $("#notifyDiv").kendoNotification({
        autoHideAfter: 3000,
        appendTo:      "#notifyDiv",
        stacking:      "default"
      }).data("kendoNotification");
      popupNotification.show(text, notifyState);
    }

    function toWindow(elementName, title, options) {
      if (options !== undefined) {
        $("#" + elementName).kendoWindow(options);
      }
      else {
        $("#" + elementName).kendoWindow({
          actions:  ["Minimize", "Maximize", "Close"],
          position: {
            top:        65,
            left:       '10px',
            scrollable: false
          },
          width:    '600px',
          height:   '350px'
        });
        var panel = $("#" + elementName).data("kendoWindow");
        panel.pin();

      }
      panel.title(title);
    }

    function createScheduler(elementName, data) {
      $("#" + elementName).kendoScheduler({
        date:   Date.now(),
        views:  [
          "day",
          "week",
          "timeline",
          "timelineWeek"
        ],
        height: 600,
      });
      var scheduler = $("#" + elementName).data("kendoScheduler");
      scheduler.schema = {
        model: {
          id: "userName"
        }
      };
      for (var i = 0; i < data.length; i++) {
        scheduler.dataSource.add({
          id:    data[i].OBJECTID,
          start: new Date(data[i].sessionTimeStart),
          end:   new Date(data[i].sessionTimeEnd),
          title: data[i].userName
        });
      }
    }

    function createListView(elementName, columns, data) {
      var model = {fields: {}};
      for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        var fieldName = column["field"];
        model.fields[fieldName] = {
          type: 'string'
        }
      }
      //noinspection JSUnresolvedFunction
      $("#" + elementName).kendoGrid({
        dataSource: {
          data:     data,
          schema:   {
            model: model
          },
          pageSize: 20
        },
        columns:    columns,
        selectable: true
      });
    }

    function createTable(elementName, features, className, params) {

      var tableData = features.map(function (item) { return item.attributes; });
      var columns = getTableHeaders(className);
      var model = {id: "OBJECTID", fields: {}};
      for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        var fieldName = column["field"];
        var columnType = getFieldType(fieldName, className);
        model.fields[fieldName] = {
          type: columnType
        };
        if (columnType == "date") {
          model.fields[fieldName].format = "{0: yyyy-MM-dd HH:mm:ss}";
        }
      }
      var data = tableData === undefined ? [] : tableData;
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        for (var field in row) {
          if (model.fields[field].type == "date") {
            var _d = new Date(row[field]);
            data[i][field] = _d.getFullYear() + "/" + (_d.getMonth() + 1) + "/" + _d.getDate() + " "
              + _d.getHours() + ":" + _d.getMinutes() + ":" + _d.getMilliseconds();
          }
        }
      }

      utils
        .getColumnsState(className)
        .then(function (doc) {
          var columnsInfo = doc.data;
          if (columnsInfo) {
            for (var item in columnsInfo) {
              for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                if (column.field == item) {
                  if (columnsInfo[item] == 'hidden') column.hidden = true;
                }
              }
            }
          }
          _prepareTable(elementName, className);
        })
        .catch(function (err) {
          if (err) {
            _prepareTable(elementName, className);
          }
        });

      function _prepareTable(elementName, className) {
        if (coreConfig.tables[className]) {
          var hiddenColumns = coreConfig.tables[className].hiddenColumns;
          if (hiddenColumns) {
            for (var item in hiddenColumns) {
              for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                if (column.field == item) {
                  column.hidden = hiddenColumns[item];
                }
              }
            }
          }
        }

        //noinspection JSUnresolvedFunction
        $("#" + elementName).kendoGrid({
          dataSource: {
            data:     data,
            schema:   {
              id:    "OBJECTID",
              model: model
            },
            pageSize: 10
          },
          columns: columns,
          toolbar:    [
            {name: "excel", text: "Экспорт в *.xls"}
          ],
          save:       function (e) {
            var attributes = e.model;

            db[className]
              .getById(attributes["OBJECTID"])
              .then(function (data) {
                var feature = data.features[0];
                feature.attributes = attributes;
                return db[className].set(feature);
              })
              .then(function (data) {
                console.log(data)
              })
          },
          change:     function (e) {
            var selectedRows = this.select();
            var selectedDataItems = [];
            for (var i = 0; i < selectedRows.length; i++) {
              var dataItem = this.dataItem(selectedRows[i]);
              selectedDataItems.push(dataItem);
            }
            var id = selectedDataItems[0]["OBJECTID"];
            db[className]
              .getById(id)
              .then(function (data) {
                var feature = data.features[0];
                var geometry = feature.geometry;
                switch (geometry.type) {
                  case "point":
                    map.centerAndZoom(geometry, map.getMaxZoom());
                    break;
                  default:
                    map.setExtent(geometry.getExtent(), true);
                    break;
                }
              })
          },
          columnHide: function (e) {
            utils.saveColumnState(className, e.column.field, 'hidden');
          },
          columnShow: function (e) {
            utils.saveColumnState(className, e.column.field, 'visible');
          }
        });

        var grid = $("#" + elementName).data("kendoGrid");
        console.log(grid);
        grid.setOptions(coreConfig.options.table);

        //todo
        (function ($) {
          var originalFilter = kendo.data.DataSource.fn.filter;

          kendo.data.DataSource.fn.filter = function(e){
            if(arguments.length > 0){
              $.event.trigger('afterFilter', [e, $(this)]);
            }

            return originalFilter.apply(this, arguments);
          };
        })(jQuery);
      }
    }

    function hideColumn(elementName, fieldName) {
      var grid = $("#" + elementName).data("kendoGrid");
      grid.hideColumn(fieldName);
    }

    /**
     * Таблица для документов
     * @param elementName
     * @param tableData
     * @param className
     */
    function createDocumentsTable(elementName, tableData, className) {
      var columns = getTableHeaders(className);
      var model = {id: "OBJECTID", fields: {}};
      for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        var fieldName = column["field"];
        var columnType = "string"; //getFieldType(fieldName, layer.object.fields);
        model.fields[fieldName] = {
          type: columnType
        };
        if (columnType == "date") {
          //model.fields[fieldName].format = "{0: yyyy-MM-dd HH:mm:ss}";
        }
      }

      showTable(tableData);

      function showTable(dataSet) {
        //noinspection JSUnresolvedFunction
        $("#" + elementName).kendoGrid({
          columnMenu: false,
          dataSource: {
            data:     dataSet,
            schema:   {
              id:    "OBJECTID",
              model: model
            },
            pageSize: 10
          },
          columns:    columns,
          toolbar:    [
            {name: "excel", text: "Экспорт в *.xls"},
            //{name: "filterFeatureSelection", text: "Только выбранные"},
            //{name: "clearFeatureSelection", text: "Открыть документ"},
            {name: "openDocument", text: "Открыть документ"},
          ],
          /*change: function (e) {

           var selectedRows = this.select();
           var selectedDataItems = [];
           for (var i = 0; i < selectedRows.length; i++) {
           var dataItem = this.dataItem(selectedRows[i]);
           selectedDataItems.push(dataItem);
           }

           var selectionGraphic = new SelectionGraphic({map: layersStoreStatic.mainMap});
           var graphicsLayerName = layer.objectConfig.id + "_graphicsLayer";
           selectionGraphic.removeAllGraphics(graphicsLayerName);

           layerModel
           .getByArray(rowsPropertyToArray(selectedDataItems, "OBJECTID"))
           .then(function (featureSet) {
           var features = layerModel.all(featureSet);
           for (var i = 0; i < features.length; i++) {
           selectionGraphic.addGraphicForGeometry(features[i].geometry, features[i].attributes, graphicsLayerName);
           }
           layersStoreStatic.mainMap.setExtent(carto.getFeaturesExtent(features), true);
           })

           }*/
        });

        var grid = $("#" + elementName).data("kendoGrid");
        grid.setOptions(coreConfig.options.table);

        $(".k-grid-clearFeatureSelection").click(function (e) {
          var selectionGraphic = new SelectionGraphic({map: layersStoreStatic.mainMap});
          var graphicsLayerName = layer.objectConfig.id + "_graphicsLayer";
          selectionGraphic.removeAllGraphics(graphicsLayerName);
        });

        $(".k-grid-openDocument").click(function (e) {
          var row = getTableSelection(elementName);
          window.open(row.pathName, row.name, {
            menubar:    "no",
            toolbar:    "no",
            location:   "no",
            status:     "no",
            resizable:  "yes",
            scrollbars: "yes",
          });
        });

        $(".k-grid-filterFeatureSelection").click(function (e) {

        });
      }
    }

    /**
     * Таблица для gpx/kml
     * @param elementName
     * @param columns
     * @param data
     */
    function createGPXTable(elementName, columns, data) {
      var model = {id: "OBJECTID", fields: {}};
      for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        var fieldName = column["field"];
        model.fields[fieldName] = {
          type: column["type"]
        }
      }
      $("#" + elementName).kendoGrid({
        dataSource: {
          data:     data,
          schema:   {
            id:    "OBJECTID",
            model: model
          },
          pageSize: 10
        },
        columns:    columns,
        toolbar:    ["excel"],
        change:     function (e) {
          var selectedRows = this.select();
          var selectedDataItems = [];
          for (var i = 0; i < selectedRows.length; i++) {
            var dataItem = this.dataItem(selectedRows[i]);
            selectedDataItems.push(dataItem);
          }
          var point = carto.toMercator(selectedDataItems[0]["lon"], selectedDataItems[0]["lat"]);

          map.centerAndZoom(point, map.getMaxZoom());
        }
      });
      //$("#" + elementName).data("kendoGrid").setOptions(coreConfig.options.table);
    }

    function createResultTable(elementName, data, columns) {
      var model = {id: "OBJECTID", fields: {}};
      var tableData = data.map(function (item) { return item.attributes});
      for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        var fieldName = column["field"];
        model.fields[fieldName] = {
          type: column["type"]
        }
      }
      $("#" + elementName).kendoGrid({
        dataSource: {
          data:       tableData,
          schema:     {
            id:    "OBJECTID",
            model: model
          },
          pageSize:   5,
          selectable: true,
        },
        columns:    columns,
        change:     async function (e) {
          var id = getTableSelection(elementName).OBJECTID;
          var className = getTableSelection(elementName).className;
          var action = await db[className].getById(id);
          var feature = action.features[0];
          console.log(feature);
          var extent = carto.getFeatureExtent(feature.geometry);
          console.log(extent);
          map.setExtent(extent, true);
        }
      });
      $("#" + elementName).data("kendoGrid").setOptions(coreConfig.options.table);
    }

    function appendFields(fields, className) {
      var result = fields;
      var geometryType = _getEditorLayer(className).geometryType;
      switch (geometryType) {
        case "esriGeometryPoint":
          if (!hasGeomertyProperty(result, "name", "lat")) {
            result.push({name: "lat", alias: "Широта", type: "esriFieldTypeDouble"});
          }
          if (!hasGeomertyProperty(result, "name", "lon")) {
            result.push({name: "lon", alias: "Долгота", type: "esriFieldTypeDouble"});
          }
          break;
      }

      function hasGeomertyProperty(arr, property, value) {
        for (var i = 0; i < arr.length; i++) if (arr[i][property] == value) return true;
        return false;
      }

      return result;
    }

    function getFieldType(fieldName, className) {
      try {
        var fields = _getStore(className).fields;
        fields = appendFields(fields, className);
        var field = null;
        for (var i = 0; i < fields.length; i++) {
          if (fields[i].name == fieldName) {
            field = fields[i];
            break;
          }
        }
        var result = 'string';
        switch (field.type) {
          case "esriFieldTypeOID":
            result = 'number';
            break;
          case "esriFieldTypeInteger", "esriFieldTypeSmallInteger", "esriFieldTypeSingle", "esriFieldTypeDouble":
            result = 'number';
            break;
          case "esriFieldTypeString", "esriFieldTypeGUID", "esriFieldTypeGlobalID":
            result = 'string';
            break;
          case "esriFieldTypeDate":
            result = 'date';
            break;
          default:
            result = 'string';
            break;
        }
        return result;
      }
      catch (e) {
        return 'string';
      }
    }

    function getTableHeaders(className) {
      var fields = [];
      if (_getStore(className) !== undefined) {
        fields = _getStore(className).fields;
        fields = appendFields(fields, className);
      }

      var tableFields = [];

      for (var i = 0; i < fields.length; i++) {
        tableFields.push({
          field:    fields[i].name,
          title:    getFieldTranslation(fields[i].name),
          sortable: true,
          width:    130,
          editor:   function (container, options) {
            var enums = getSelectListValues(options.field, className);
            if (enums !== undefined) {
              var input = $("<input/>");
              input.attr("name", options.field);
              input.appendTo(container);
              input.kendoComboBox({
                dataSource: enums
              });
            }
            else {
              var input = $("<input type='text'/>");
              input.attr("name", options.field);
              input.appendTo(container);
            }
          }
        })
      }
      return tableFields;
    }

    function getSelectListValues(fieldName, className) {
      if (fieldName == "assetType") return coreConfig.classes[className];
      return getEnum(fieldName, className);
    }

    function loadTableData(elementName, data) {
      var grid = $("#" + elementName).data("kendoGrid");
      var dataSource = new kendo.data.DataSource({
        data: data
      });
      grid.setDataSource(dataSource);
      grid.setOptions(coreConfig.options.table);
    }

    function clearTableData(elementName) {
      return;
      var grid = $("#" + elementName).data("kendoGrid");
      for (var i = 0; i < grid.dataSource.length; i++) {
        var data = grid.dataSource.at(i);
        grid.dataSource.remove(data);
      }
    }

    function removeSelectedRow(elementName) {
      var grid = $("#" + elementName).data("kendoGrid");
      var row = grid.select();
      var data = grid.dataItem(row);
      grid.dataSource.remove(data);
    }

    function getTableSelection(tableName) {
      var grid = $("#" + tableName).data("kendoGrid");
      var row = grid.select();
      var data = grid.dataItem(row);
      return data;
    }

    function getTableRows(tableName) {
      var grid = $("#" + tableName).data("kendoGrid");
      var row = grid.select();
      var data = [];
      for (var i = 0; i < row.length; i++) {
        data.push(grid.dataItem(row[i]));
      }
      return data;
    }

    function removeSelectedRows(elementName) {
      var grid = $("#" + elementName).data("kendoGrid");
      var row = grid.select();
      for (var i = 0; i < row.length; i++) {
        var data = grid.dataItem(row[i]);
        grid.dataSource.remove(data);
      }
    }

    function deleteRowInTable(elementName, id) {
      var grid = $("#" + elementName).data("kendoGrid");
      var data = grid.dataSource.data();
      for (var i = 0; i < data.length; i++) {
        if (data[i]["OBJECTID"] == id) {
          var dataItem = grid.dataSource.at(i);
          grid.dataSource.remove(dataItem);
        }
      }

    }

    function appendRowInTable(elementName, data) {
      var grid = $("#" + elementName).data("kendoGrid");
      grid.dataSource.add(data);
    }

    function getObjectID(tableName) {
      var grid = $("#" + tableName).data("kendoGrid");
      var row = grid.select();
      var data = grid.dataItem(row);
      return data["OBJECTID"];
    }

    function getObjectIDS(tableName) {
      var grid = $("#" + tableName).data("kendoGrid");
      var row = grid.select();
      var result = [];
      for (var i = 0; i < row.length; i++) {
        result.push(grid.dataItem(row[i])["OBJECTID"]);
      }
      return result;
    }

    function TranslitName(text) {
      var map = {
        'a': 'a',
        'б': 'b',
        'в': 'v',
        'г': 'g',
        'д': 'd',
        'е': 'e',
        'ё': 'e',
        'ж': 'zh',
        'з': 'z',
        'и': 'i',
        'й': 'i',
        'к': 'k',
        'л': 'l',
        'м': 'm',
        'н': 'n',
        'о': 'o',
        'п': 'p',
        'р': 'r',
        'с': 's',
        'т': 't',
        'у': 'u',
        'ф': 'f',
        'х': 'kh',
        'ц': 'tc',
        'ч': 'ch',
        'ш': 'sh',
        'щ': 'shch',
        'ъ': '',
        'ы': 'y',
        'ь': '',
        'э': 'e',
        'ю': 'iu',
        'я': 'ia',

        'А': 'A',
        'Б': 'B',
        'В': 'V',
        'Г': 'G',
        'Д': 'D',
        'Е': 'E',
        'Ё': 'E',
        'Ж': 'ZH',
        'З': 'Z',
        'И': 'I',
        'Й': 'I',
        'К': 'K',
        'Л': 'L',
        'М': 'M',
        'Н': 'N',
        'О': 'O',
        'П': 'P',
        'Р': 'R',
        'С': 'S',
        'Т': 'T',
        'У': 'U',
        'Ф': 'F',
        'Х': 'KH',
        'Ц': 'TC',
        'Ч': 'CH',
        'Ш': 'SH',
        'Щ': 'SHCH',
        'Ъ': '',
        'Ы': 'Y',
        'Ь': '',
        'Э': 'E',
        'Ю': 'IU',
        'Я': 'IA'
      };
      var out = '';
      var length = text.length;
      var i, c;
      for (i = 0; i < length; i++) {
        c = text[i];
        out += map[c] === undefined ? c : map[c];
      }
      return out;
    }

    function getDescription(className, feature, params) {
      for (var i = 0; i < coreConfig.editors.length; i++) {
        if (coreConfig.editors[i].id == className) {
          var fields = store.editors[i].fields;
          break;
        }
      }
      if (params) {
        /*if (params.file) {
         fields["file"] = {
         name:  "Файл",
         alias: "attachment",
         type:  "file"
         }
         }*/
      }
      var template;
      template = {
        feature: feature,
        data:    {},
        schema:  {
          properties: {}
        },
        options: {
          form:   {
            attributes: {},
            buttons:    {
              submit: {
                "click": function () {
                  var resultFeature = feature;
                  resultFeature.attributes = this.getValue();
                  resultFeature.attributes["pathName"] = "";
                  hideWindow(getNodeName(className));
                  return db[className].set(resultFeature);
                  /*var regionCode = "";
                   var branchCode = "";
                   var gridAreaCode = "";
                   var nameTranslited = "";
                   db["AdmDistrict"]
                   .getByGeometry({where: "1=1", geometry: resultFeature.geometry})
                   .then(function (data) {
                   console.log(data);
                   var admDistrict = db["AdmDistrict"].first(data);
                   regionCode = admDistrict.attributes["aliasName"];
                   return db["CompanyList"].get({where: "name='" + resultFeature.attributes["branch"] + "'"})
                   })
                   .then(function (data) {
                   console.log(data);
                   var branch = db["CompanyList"].first(data);
                   branchCode = branch.attributes["aliasName"];
                   return db["CompanyList"].get({where: "name='" + resultFeature.attributes["gridArea"] + "'"})
                   })
                   .then(function (data) {
                   console.log(data);
                   var gridArea = db["CompanyList"].first(data);
                   gridAreaCode = gridArea.attributes["aliasName"];
                   nameTranslited = TranslitName(resultFeature.attributes["localName"]);
                   resultFeature.attributes["pathName"] = regionCode + "/" + branchCode + "/" + gridAreaCode + "/" + className + "/" + nameTranslited;
                   return db[className].set(resultFeature);
                   })*/
                  //if (saveFunction !== undefined) saveFunction(resultFeature.attributes).apply()
                },
                title:   "Сохранить",
                styles:  "btn btn-primary"
              }
            }
          },
          fields: {},
        },
        view:    {
          parent: "bootstrap-edit",
          layout: {
            template: getFormTemplate(className),
            bindings: {}
          }
        }
      };
      /**
       * Обработка массива атрибутов и конвертация в представление alpaca
       */
      for (var field in fields) {
        var currentField = _processField(fields[field], feature.attributes, className, params);
        template.data[fields[field].name] = currentField.data;
        template.schema.properties[fields[field].name] = {
          title:    getFieldTranslate(fields[field].name, "ru"),
          type:     currentField.schema.type,
          required: currentField.schema.required,
          enum:     currentField.schema.enum
        };

        template.options.fields[fields[field].name] = {
          readonly:   currentField.options.readonly,
          type:       currentField.options.type,
          dateFormat: currentField.options.dateFormat,
        };

        if (currentField.options.events) template.options.fields[fields[field].name].events = currentField.options.events;
        template.view.layout.bindings[fields[field].name] = currentField.view.layout.bindings[fields[field].name];
      }

      for (var field in fields) {
        if (checkDependencyParameters(fields[field].name) == true) {
          var dependency = getDependency(fields[field].name);
          template.options.fields[dependency.parent].validate = false;
        }
      }

      return template;
    }

    /**
     * возвращает комплексное описания поля
     * @param _field
     * @param attribute
     * @returns {{schema: {type: string, required: boolean}, options: {}, data: {value: *}}}
     * @private
     */
    function _processField(_field, attributes, className, params) {
      var result = {
        schema:  {
          title:    _field.alias,
          type:     'string',
          format:   'string',
          required: false
        },
        options: {
          readonly: false
        },
        data:    attributes[_field.name],
        view:    {
          layout: {
            bindings: {}
          }
        }
      };
      switch (_field.type) {
        case "esriFieldTypeOID":
          result.schema.type = 'number';
          result.options = {type: 'number', readonly: true};
          break;
        case "esriFieldTypeInteger", "esriFieldTypeSmallInteger", "esriFieldTypeSingle", "esriFieldTypeDouble":
          result.schema.type = 'number';
          result.options = {type: 'number', readonly: false};
          break;
        case "esriFieldTypeString", "esriFieldTypeGUID", "esriFieldTypeGlobalID":
          result.schema.type = 'string';
          result.options = {type: 'string', readonly: false};
          break;
        case "esriFieldTypeDate":
          result.schema.type = 'string';
          result.schema.format = 'datetime';
          result.options = {type: 'datetime', readonly: false, dateFormat: 'YYYY/MM/DD hh:mm:ss'};
          var dateValue = attributes[_field.name];
          var correctDate = new Date(dateValue);
          result.data = correctDate.getFullYear() + "/" + (correctDate.getMonth() + 1) + "/" + correctDate.getDate()
            + " " + correctDate.getHours() + ":" + correctDate.getMinutes() + ":" + correctDate.getSeconds();
          break;
        /*
         case "file":
         result.schema.type = 'file';
         result.schema.format = 'uri';
         result.options.type = 'file';
         */
      }

      result.view.layout.bindings[_field.name] = getFormGroup(className, _field);

      //добавление списков
      if (store.dicts[_field.name]) {
        result.schema.enum = getEnum(_field.name, className);
        result.options.type = 'select';
      }

      //добавление по классу
      if (_field.name == "assetType") {
        result.schema.enum = coreConfig.classes[className];
        result.options.type = 'select';
      }

      //скрытие паролей
      switch (_field.name) {
        case "password":
          result.options.type = 'password';
          result.schema.format = 'password';
          break;
      }

      //запрет редактирования поля напряжения для сегментов и ЛЭП
      /*
       if ((className == "ACLineSegment") || (className == "PowerLine") && (_field.name == "nominalVoltage")) {
       result.options.readonly = true;
       }
       */

      //поддержка зависимостей
      if (checkDependencyParameters(_field.name) == true) {
        result.options.events = {
          change: function () {
            var value = this.getValue();
            var parentElement = this.parent.domEl[0].id;
            var control = $("#" + parentElement).alpaca("get");
            var dependency = getDependency(this.name);
            var chieldField = control.childrenByPropertyId[dependency.parent];

            chieldField.schema.enum.length = 0;
            chieldField.refresh();

            var url = "";
            for (var i = 0; i < coreConfig.dicts.length; i++) {
              if (coreConfig.dicts[i].id == _field.name) {
                url = coreConfig.dicts[i].url;
                break;
              }
            }

            utils.getCascade(url, value, "name", dependency.parentKey, dependency.chieldKey)
              .then(function (data) {
                var features = data.features;
                var enumList = featuresPropertyToArray(features, "name");
                var element = $("#" + chieldField.id)[0];
                element.innerHTML = "";
                for (var i = 0; i < enumList.length; i++) {
                  element.innerHTML += "<option>" + enumList[i] + "</option>";
                }
              });
          }
        }
      }

      return result;
    }

    function checkDependencyParameters(dictionaryName) {
      try {
        for (var i = 0; i < coreConfig.dicts.length; i++) {
          if (coreConfig.dicts[i].id == dictionaryName) {
            if (coreConfig.dicts[i].dependency != undefined) {
              return true;
            }
            break;
          }
        }
      }
      catch (e) {
        return false;
      }
    }

    function getDependency(dictionaryName) {
      for (var i = 0; i < coreConfig.dicts.length; i++) {
        if (coreConfig.dicts[i].id == dictionaryName) {
          return coreConfig.dicts[i].dependency;
        }
      }
    }

    function getFormGroup(className, field) {
      try {
        var translation = coreConfig.translation[field.name];
        if (translation["group"] === undefined) {
          return "common";
        } else {
          return translation["group"]
        }
      }
      catch (e) {
        return "common"
      }
    }

    function getFormTemplate(className) {
      return './js/app/forms/templates/' + className + '.html';
    }

    function getEnum(dictionaryName, className) {
      return store.dicts[dictionaryName];
    }

    function getFieldTranslate(fieldName) {
      return coreConfig.translation[fieldName] ? coreConfig.translation[fieldName].alias : fieldName;
    }

    function open(className, feature, params) {
      //noinspection JSUnresolvedFunction
      $("#" + getNodeName(className)).kendoWindow({
        actions:  ["Close"],
        width:    '450px'
      });
      var panel = $("#" + getNodeName(className)).data("kendoWindow");
      //noinspection JSUnresolvedFunction
      panel.pin();
      var titleName = _getConf(className).placeholder;
      var objectName = feature.attributes["name"] == undefined ? feature.attributes["userName"] : feature.attributes["name"]+feature.attributes["Id"];
      panel.title(titleName + " : " + objectName);
      panel.open();
      panel.maximize();

      var featureTemplate = getDescription(className, feature, params);
      var attributesNode = getNodeName(className) + "-Attributes";
      var editorNode = attributesNode + "-AttributesForm";
      try {
        $("#" + editorNode).remove();
      }
      finally {
        $("#" + attributesNode).append("<div id='" + editorNode + "'/>");
        $("#" + editorNode).alpaca(featureTemplate);
      }
    }

    function createDropdown(elementName, data, valueField, textField) {
      $("#" + elementName).kendoDropDownList({
        dataTextField:  textField,
        dataValueField: valueField,
        dataSource:     data,
        index:          0
      });
    }

    function createComboBox(elementName, data, valueField, textField) {
      $("#" + elementName).kendoComboBox({
        dataTextField:  textField,
        dataValueField: valueField,
        placeholder: "Выберите слой",
        dataSource:     data,
        index:          0
      });
    }

    function getDropdownValue(elementName) {
      return $("#" + elementName).data("kendoDropDownList").value();
    }

    function setWindowOptions(elementName, options) {
      var dialog = $("#" + elementName).data("kendoWindow");
      dialog.setOptions(options);
    }

    function getUpload(elementName, saveUrl) {
      var filesContainer = elementName + "-Container";
      $("#" + elementName)[0].innerHTML = "";
      $("#" + elementName)[0].innerHTML += "<input name='files' id='" + filesContainer + "' type='file'/>";
      return new Promise(function (resolve, reject) {
        $("#" + filesContainer).kendoUpload({
          async:        {
            saveUrl:    saveUrl,
            autoUpload: true
          },
          localization: {
            select: "Выберите файл"
          },
          multiple:     false,
          showFileList: false,
          upload:       function (evt) {
            resolve(evt.files);
          }
        });
      })
    }

    return {
      getNodeName:          getNodeName,
      showNode:             showNode,
      hideNode:             hideNode,
      showNotify:           showNotify,
      createScheduler:      createScheduler,
      toWindow:             toWindow,
      hideWindow:           hideWindow,
      showWindow:           showWindow,
      //todo на удаление
      getRoot:              getRoot,
      open:                 open,
      clearTableData:       clearTableData,
      loadTableData:        loadTableData,
      createTable:          createTable,
      getObjectID:          getObjectID,
      getObjectIDS:         getObjectIDS,
      appendRowInTable:     appendRowInTable,
      deleteRowInTable:     deleteRowInTable,
      getTableSelection:    getTableSelection,
      getTableHeaders:      getTableHeaders,
      createListView:       createListView,
      createGPXTable:       createGPXTable,
      removeSelectedRow:    removeSelectedRow,
      hideColumn:           hideColumn,
      createDropdown:       createDropdown,
      getDropdownValue:     getDropdownValue,
      setWindowOptions:     setWindowOptions,
      getTableRows:         getTableRows,
      removeSelectedRows:   removeSelectedRows,
      generateTab:          generateTab,
      generateTabContainer: generateTabContainer,
      getUpload:            getUpload,
      createDocumentsTable: createDocumentsTable,
      createResultTable:    createResultTable,
      createComboBox:       createComboBox
    }

  }
);