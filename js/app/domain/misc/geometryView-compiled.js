/**
 * Created by ryazanova.ea on 02.09.2016.
 */
define(["./js/app/domain/carto-compiled.js", "./js/app/forms/forms-compiled.js", "esri/geometry/geometryEngine"], function (carto, forms, geometryEngine) {

    function loadGeometryProperty(data, id) {
        console.log("для меня", data);
        var typeObject = data.geometry.type;
        switch (typeObject) {
            case "point":
                var x = data.geometry.x;
                var y = data.geometry.y;
                document.getElementById(id).innerHTML = "";
                document.getElementById(id).innerHTML = "<div class='buttons-menu'>" + "<div id='Substation-Geometry-geoJson' class='btn btn-success'>" + "<span class='glyphicon glyphicon-save'>" + " .GEOJSON" + "</div>" + "<div id='Substation-Geometry-KML' class='btn btn-primary btnKMLGeometry'>" + "<span class='glyphicon glyphicon-save'>" + " .KML" + "</div>" + "</div>" + "<div class='row'>" + "<div class='col-md-1 styleTextPropertyGeometry'>" + "Тип:" + "</div>" + "<div class='col-md-1'>" + "Точка" + "</div>" + "</div>" + "<div class='row'>" + "<div class ='col-md-5 col-md-push-2'>" + "<h5>" + "Координаты" + "</h5>" + "</div>" + "</div>" + "<div class='row'>" + "<div id ='tableCoords' class='styleTableCoords'>" + "</div>" + "</div>";

                var geoJson = "Substation-Geometry-geoJson";
                bindClick(geoJson, function () {
                    var geometry = carto.featureToGeoJson(data);
                    console.log("123", geometry);
                    var blob = new Blob([JSON.stringify(geometry)], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, "property.json");
                });
                var kml = "Substation-Geometry-KML";
                bindClick(kml, function () {
                    var geometry = carto.featureToGeoJson(data);
                    var kmlFile = tokml(geometry);
                    var blob = new Blob([kmlFile.toString()], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, "google.kml");
                });
                $("#tableCoords").kendoGrid({
                    autoBind: true,
                    columns: [{ field: "x", title: "X" }, { field: "y", title: "Y" }],
                    dataSource: [{ x: x, y: y }],
                    noRecords: {
                        template: "Нет данных"
                    },
                    scrollable: false,
                    resizable: true,
                    sortable: true,
                    filterable: false,
                    toolbar: [{ name: "excel", text: "Экспорт в *.xls" }],
                    excel: {
                        fileName: "Реестр координат " + carto.featureToGeoJson(data).properties.aliasName + ".xlsx"
                    }
                });
                break;
            case "polyline":
                document.getElementById(id).innerHTML = "";
                var datasource_1 = [];
                for (var i = 0; i < data.geometry.paths.length; i++) {
                    for (var j = 0; j < data.geometry.paths[i].length; j++) {
                        var point = carto.getNPointInLineInPath(data.geometry, i, j);
                        datasource_1[j] = {
                            x: point.x.toFixed(5),
                            y: point.y.toFixed(5)
                        };
                    }
                }

                var length = geometryEngine.geodesicLength(data.geometry, 9036);
                document.getElementById(id).innerHTML = "<div class='buttons-menu'>" + "<div id='Substation-Geometry-geoJson' class='btn btn-success'>" + "<span class='glyphicon glyphicon-save'>" + " .GEOJSON" + "</div>" + "<div id='Substation-Geometry-KML' class='btn btn-primary btnKMLGeometry'>" + "<span class='glyphicon glyphicon-save'>" + " .KML" + "</div>" + "</div>" + "<div class='row'>" + "<div class='col-md-3 styleTextPropertyGeometry'>" + "Тип:" + "</div>" + "<div class='col-md-3'>" + "Линия" + "</div>" + "</div>" + "<div class='row'>" + "<div class='col-md-3 styleTextPropertyGeometry'>" + "Длина" + "</div>" + "<div class='col-md-1'>" + length.toFixed(2) + "</div>" + "<div class='col-md-1'>" + "км" + "</div>" + "</div>" + "<div class='row'>" + "<div class ='col-md-5 col-md-push-2'>" + "<h5>" + "Координаты" + "</h5>" + "</div>" + "</div>" + "<div class='row'>" + "<div id ='tableCoords' class='styleTableCoords'>" + "</div>" + "</div>";
                var geoJson = "Substation-Geometry-geoJson";
                bindClick(geoJson, function () {
                    var geometry = carto.featureToGeoJson(data);
                    console.log("123", geometry);
                    var blob = new Blob([JSON.stringify(geometry)], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, "property.json");
                });
                var kml = "Substation-Geometry-KML";
                bindClick(kml, function () {
                    var geometry = carto.featureToGeoJson(data);
                    console.log("название", geometry);
                    var kmlFile = tokml(geometry);
                    var blob = new Blob([kmlFile.toString()], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, "google.kml");
                });
                $("#tableCoords").kendoGrid({
                    autoBind: true,
                    columns: [{ field: "x", title: "X" }, { field: "y", title: "Y" }],
                    dataSource: datasource_1,
                    noRecords: {
                        template: "Нет данных"
                    },
                    scrollable: false,
                    resizable: true,
                    sortable: true,
                    filterable: false,
                    toolbar: [{ name: "excel", text: "Экспорт в *.xls" }],
                    excel: {
                        fileName: "Реестр координат " + carto.featureToGeoJson(data).properties.aliasName + ".xlsx"
                    }
                });
                break;
            case "polygon":
                document.getElementById(id).innerHTML = "<div class='buttons-menu'>" + "<div id='Substation-Geometry-geoJson' class='btn btn-success'>" + "<span class='glyphicon glyphicon-save'>" + " .GEOJSON" + "</div>" + "<div id='Substation-Geometry-KML' class='btn btn-primary btnKMLGeometry'>" + "<span class='glyphicon glyphicon-save'>" + " .KML" + "</div>" + "</div>" + "<div class='row'>" + "<div class='col-md-1'>" + "Тип:" + "</div>" + "<div class='col-md-1'>" + "Площадной объект" + "</div>" + "</div>" + "<div class='row'>" + "<div class ='col-md-1'>" + "Координаты" + "</div>" + "</div>" + "<div class='row'>" + "<div class='col-md-4'>" + "X" + "</div>" + "<div class='col-md-4'>" + "Y" + "</div>" + "</div>" + "<div class='row'>" + "<div class='col-md-4'>" + "" + "</div>" + "<div class='col-md-4'>" + "" + "</div>" + "</div>";
                break;
        }
    }

    return {
        loadGeometryProperty: loadGeometryProperty
    };
});

//# sourceMappingURL=geometryView-compiled.js.map