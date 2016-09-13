/**
 * Created by lomteva.aa on 26.04.2016.
 */
define(["./js/app/forms/forms-compiled.js",
  './js/app/search/utils-compiled.js'],
  function (forms,
            searchUtils) {
  return {
    links: {
      "map": {
        text: "Карта",
        image: "",
        /**
         * @param data
         * @param data.parentElementName
         * @param data.feature
         * @param data.className
         * @param data.carto
         */
        generate: function (data) {
          "use strict";
          var parentElementName = data.parentElementName;
          var feature = data.feature;
          var className = feature.className;
          var id = feature.attributes.OBJECTID;
          var carto = data.carto;
          var mapDivName = "map-" + className + "-" + id;
          var linkDivName = "link-map-" + className + "-" + id;
          var parentElement = $("#" + parentElementName)[0];
          var linksContainerName = "links-container-" + className + "-" + id;
          var linksContainer = $("#" + linksContainerName)[0];
          linksContainer.innerHTML += "<a class=links id='" + linkDivName + "' href='#'><span class='glyphicon glyphicon-search'></span> Показать на карте</a>";
          parentElement.innerHTML += "<div id='" + mapDivName + "'></div>";
          setTimeout(function () {
            var map = null;
            var status = false;
            bindClick(linkDivName, function () {
              var docsContainerName = "docs-container-" + className + "-" + id;
              forms.hideNode(docsContainerName);
              if (map === null) {
                map = carto.createMap(mapDivName, {
                  basemap: "osm"
                });
                map.on("load", function () {
                  carto.addGraphicToMap(map, feature, undefined, true, 17);
                });

              }
              if (status) {
                forms.hideNode(mapDivName);
              }
              else {
                forms.showNode(mapDivName);
              }
              status = !status;
            })
          }, 50);

        }
      },
      "passport": {
        text: "Паспорт",
        image: "images/search/Ico_pas.png",
        generate: function (data) {
          "use strict";
          var feature = data.feature;
          var className = feature.className;
          var id = feature.attributes.OBJECTID;
          var linksContainerName = "links-container-" + className + "-" + id;
          var linkDivName = "link-passport-" + className + "-" + id;
          var docsContainerName = "docs-container-" + className + "-" + id;
          var linksContainer = $("#" + linksContainerName)[0];
          var image = this.image;
          var text = this.text;
          linksContainer.innerHTML += "<a class=links id='" + linkDivName + "' href='#'><img src='" + image + "'> " + text + "</a>"
          setTimeout(function () {
            var status = false;
            bindClick(linkDivName, async function () {
              var docsContainer = document.getElementById(docsContainerName);
              docsContainer.innerHTML = '';
              var documents = await(searchUtils.getDocuments(className, id,"паспорт"));
              if (documents.length == 0) {
                docsContainer.innerHTML += "Нет прикрепленных паспортов";
              } else {
                var table = document.createElement('table');
                table.setAttribute('class','table table-bordered');
                table.innerHTML += "<thead><tr><th>Наименование</th><th>Тип</th><th>Дата создания</th></tr></thead><tbody></tbody>";
                for (var i = 0; i < documents.length; i++) {
                  if(documents[i]){
                    var docName = documents[i].attributes.name;
                    var docType = documents[i].attributes.docType;
                    var date = documents[i].attributes.createdDateTime;
                    var docDate=moment(date).format("DD.MM.YYYY hh:mm");
                    table.childNodes[1].innerHTML += "<tr><td><a href='http://vm.igit.spb.ru/lenenergo/documents//"+className+"/"+id+"/"+docName+"' target='_blank'>" + docName + "</a></td><td>" + docType + "</td><td>" + docDate + "</td></tr>"
                  }
                }
                docsContainer.appendChild(table)
              }
              if (status) {
                forms.hideNode(docsContainerName);
              }
              else {
                forms.showNode(docsContainerName);
              }
              status = !status;
            })
          }, 100)
        }
      },
      "documents": {
        text: "Документы",
        image: "images/search/ico_doc.png",
        generate: async function (data) {
          "use strict";
          var parentElementName = data.parentElementName;
          var feature = data.feature;
          var className = feature.className;
          var id = feature.attributes.OBJECTID;
          var linksContainerName = "links-container-" + className + "-" + id;
          var linkDivName = "link-documents-" + className + "-" + id;
          var docsContainerName = "docs-container-" + className + "-" + id;
          var linksContainer = $("#" + linksContainerName)[0];
          var image = this.image;
          var text = this.text;
          linksContainer.innerHTML += "<a class=links id='" + linkDivName + "' href='#'><img src='" + image + "'> " + text + "</a>";
          setTimeout(function () {
            var status = false;
            bindClick(linkDivName, async function () {
              var docsContainer = document.getElementById(docsContainerName);
              docsContainer.innerHTML = '';
              var documents = await(searchUtils.getDocuments(className, id));
              if (documents.length == 0) {
                docsContainer.innerHTML += "Нет прикрепленных документов";
              } else {
                var table = document.createElement('table');
                table.setAttribute('class','table table-bordered');
                table.innerHTML += "<thead><tr><th>Наименование</th><th>Тип</th><th>Дата создания</th></tr></thead><tbody></tbody>";
                for (var i = 0; i < documents.length; i++) {
                  var docName = documents[i].attributes.name;
                  var docType = documents[i].attributes.docType;
                  var date = documents[i].attributes.createdDateTime;
                  var docDate=moment(date).format("DD.MM.YYYY hh:mm");
                  table.childNodes[1].innerHTML += "<tr><td><a href='http://vm.igit.spb.ru/lenenergo/documents//"+className+"/"+id+"/"+docName+"' target='_blank'>" + docName + "</a></td><td>" + docType + "</td><td>" + docDate + "</td></tr>"
                }
                docsContainer.appendChild(table)
              }
              if (status) {
                forms.hideNode(docsContainerName);
              }
              else {
                forms.showNode(docsContainerName);
              }
              status = !status;
            })
          }, 100)

        }
      },
      "layout": {
        text: "Схема",
        image: "images/search/ico_lay.png",
        generate: function (data) {
          "use strict";
          var feature = data.feature;
          var className = feature.className;
          var id = feature.attributes.OBJECTID;
          var linksContainerName = "links-container-" + className + "-" + id;
          var linkDivName = "link-layout-" + className + "-" + id;
          var docsContainerName = "docs-container-" + className + "-" + id;
          var linksContainer = $("#" + linksContainerName)[0];
          var image = this.image;
          var text = this.text;
          linksContainer.innerHTML += "<a class=links id='" + linkDivName + "' href='#'><img src='" + image + "'> " + text + "</a>"
          setTimeout(function () {
            var status = false;
            bindClick(linkDivName, async function () {
              var docsContainer = document.getElementById(docsContainerName);
              docsContainer.innerHTML = '';
              var documents = await(searchUtils.getDocuments(className, id,"схема электрических соединений"))
              if (documents.length==0) {
                docsContainer.innerHTML += "Нет прикрепленных схем"
              } else {
                var table = document.createElement('table');
                table.setAttribute('class','table table-bordered');
                table.innerHTML += "<thead><tr><th>Наименование</th><th>Тип</th><th>Дата создания</th></tr></thead><tbody></tbody>";
                for (var i = 0; i < documents.length; i++) {
                  if(documents[i]){
                    var docName = documents[i].attributes.name;
                    var docType = documents[i].attributes.docType;
                    var date = documents[i].attributes.createdDateTime;
                    var docDate=moment(date).format("DD.MM.YYYY hh:mm");
                    table.childNodes[1].innerHTML += "<tr><td><a href='http://vm.igit.spb.ru/lenenergo/documents//"+className+"/"+id+"/"+docName+"' target='_blank'>" + docName + "</a></td><td>" + docType + "</td><td>" + docDate + "</td></tr>"
                  }
                }
                docsContainer.appendChild(table)
              }
              if (status) {
                forms.hideNode(docsContainerName);
              }
              else {
                forms.showNode(docsContainerName);
              }
              status = !status;
            })
          }, 100)        }
      },
      "contacts": {
        text: "Контакты",
        image: "images/search/ico_con.png",
        generate: function (data) {
          "use strict";
          var feature = data.feature;
          var className = feature.className;
          var id = feature.attributes.OBJECTID;
          var linksContainerName = "links-container-" + className + "-" + id;
          var linkDivName = "link-contacts-" + className + "-" + id;
          var linksContainer = $("#" + linksContainerName)[0];
          var image = this.image;
          var text = this.text;
          linksContainer.innerHTML += "<a class=links id='" + linkDivName + "' href='#'><img src='" + image + "'> " + text + "</a>"
        }
      }

    }
  }
});
