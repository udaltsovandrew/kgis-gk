/**
 * Created by udaltsov on 11.12.15.
 */
"use strict";
define([
        "esri/geometry/Extent",
        "esri/geometry/Point",
        "esri/geometry/Polygon",
        "esri/geometry/Polyline",
        "esri/SpatialReference",
        "esri/Color",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/renderers/UniqueValueRenderer",
        "esri/renderers/ScaleDependentRenderer",
        "esri/graphic",
        "esri/geometry/geometryEngine",
        "esri/geometry/webMercatorUtils",
        "esri/tasks/PrintTask",
        "esri/tasks/PrintParameters",
        "esri/tasks/PrintTemplate",
        "esri/map"
    ],
    function (Extent,
              Point,
              Polygon,
              Polyline,
              SpatialReference,
              Color,
              SimpleMarkerSymbol,
              PictureMarkerSymbol,
              SimpleLineSymbol,
              SimpleFillSymbol,
              UniqueValueRenderer,
              ScaleDependentRenderer,
              Graphic,
              geometryEngine,
              webMercatorUtils,
              PrintTask,
              PrintParameters,
              PrintTemplate,
              Map) {

        function addGraphic(feature, symbol) {
            var currentSymbol = symbol;
            if (currentSymbol === undefined) {
                currentSymbol = getDefaultSumbol(feature.geometry);
            }
            var graphic = new Graphic(feature.geometry, currentSymbol, null, null);
            map.graphics.add(graphic);
        }

        function addGraphicToMap(mapObject, feature, symbol, center, zoom) {
            var currentSymbol = symbol;
            if (currentSymbol === undefined) {
                currentSymbol = getDefaultSumbol(feature.geometry);
            }
            var graphic = new Graphic(feature.geometry, currentSymbol, null, null);
            mapObject.graphics.add(graphic);
            if ((center) && (zoom)) {
                mapObject.centerAndZoom(getCenterFromExtent(getFeatureExtent(feature.geometry)), zoom);
            }
        }

        function getDefaultSumbol(geometry) {
            var symbol = null;
            switch (geometry.type) {
                case 'point':
                    symbol = new PictureMarkerSymbol('images/marker.png', 20, 20).setOffset(0, 10);
                    break;
                case 'polyline':
                    symbol = new SimpleLineSymbol();
                    break;
                case 'polygon':
                    symbol = new SimpleFillSymbol();
                    break;
            }
            return symbol;
        }

        function addGpxGraphic(feature) {
            addGraphic(feature, getDefaultSymbol("point"));
        }

        function getDefaultSymbol(geometryType) {
            switch (geometryType) {
                case "point":
                    var symbol = new PictureMarkerSymbol('images/marker.png', 20, 20).setOffset(0, 10);
                    return symbol;
                    break;
            }
        }

        function deleteGpxPoints() {
            map.graphics.clear();
        }

        function getUniqueRenderer(info, scale) {
            var size;

            if (scale == undefined) {
                size = Math.pow(map.getZoom(), 1.35) / (2.3 * map.getMaxZoom());
            }

            var defaultSymbol = new PictureMarkerSymbol("images/renderers/" + info.defaultSymbol.url, info.defaultSymbol.height * size, info.defaultSymbol.width * size);
            if ((info.defaultSymbol.xoffset !== undefined) && (info.defaultSymbol.yoffset !== undefined)) {
                defaultSymbol.setOffset(info.defaultSymbol.xoffset, info.defaultSymbol.yoffset);
            }
            var renderer = new UniqueValueRenderer(defaultSymbol, info.attributeField, info.attributeField2, info.attributeField3, '!');
            var values = info.values;
            for (var i = 0; i < values.length; i++) {
                var valueSymbol = new PictureMarkerSymbol("images/renderers/" + values[i].symbol.url, values[i].symbol.height * size, values[i].symbol.width * size);
                if ((values[i].symbol.xoffset !== undefined) && (values[i].symbol.yoffset !== undefined)) {
                    valueSymbol.setOffset(values[i].symbol.xoffset, values[i].symbol.yoffset);
                }
                renderer.addValue({
                    description: values[i].label,
                    symbol: valueSymbol,
                    label: values[i].label,
                    value: values[i].value
                })
            }
            return renderer;
        }

        function getScaleDenepndedRendererInfo(info) {
            var rendererInfo = {};
            rendererInfo.renderer = getUniqueRenderer(info);
            rendererInfo.minScale = info.minScale;
            rendererInfo.maxScale = info.maxScale;
            return rendererInfo;
        }

        function getScaledDependedRenderer(renderers) {
            var renderer = new ScaleDependentRenderer();
            for (var i = 0; i < renderers.length; i++) {
                renderer.addRendererInfo(renderers[i]);
            }
            return renderer;
        }

        function getFirstPointInLine(polyline) {
            return polyline.getPoint(0, 0);
        };

        function getLastPointInLine(polyline) {
            var point = polyline.getPoint(0, polyline.paths[0].length - 1);
            return point;
        };

        function getNPointInLine(polyline, n) {
            return getNPointInLineInPath(polyline, 0, n);
        }

        function getNPointInLineInPath(polyline, pathNumber, pointNumber) {
            var point = polyline.getPoint(pathNumber, pointNumber);
            return point;
        }

        function sumLineGeometry(data) {
            var geometry = new Polyline(new SpatialReference({wkid: 102100}));
            var features = data;
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                for (var j = 0; j < feature.geometry.paths.length; j++) {
                    geometry.addPath(feature.geometry.paths[j])
                }
            }
            return geometry;
        };

        function getCenter(extent) {
            var x = (extent.xmin + extent.xmax) / 2;
            var y = (extent.ymin + extent.ymax) / 2;
            return new Point(x, y, new SpatialReference({wkid: 102100}));
        };

        function getFeatureExtent(geometry) {
            var bbox;
            switch (geometry.type) {
                case "point":
                    bbox = geometryEngine.buffer(geometry, 10, 9001, true);
                    bbox = bbox.getExtent();
                    break;
                case "polyline":
                    bbox = geometry.getExtent();
                    break;
                case "polygon":
                    break;
                    bbox = geometry.getExtent();
            }
            return bbox;
        }

        function updateLineByPoint(lineGeom, oldPoint, newPoint) {
            //noinspection JSUnresolvedFunction
            var vertex = geometryEngine.nearestVertex(lineGeom, oldPoint);
            var index = vertex.vertexIndex;
            lineGeom.setPoint(0, index, newPoint);
            return lineGeom;
        };

        function toMercator(x, y) {
            var point = new Point(x, y, new SpatialReference({wkid: 3857}));
            return webMercatorUtils.geographicToWebMercator(point);
        }

        function toWgs84(point) {
            var result = webMercatorUtils.webMercatorToGeographic(point);
            return result;
        }

        function refreshLayer(id) {
            var layer = _getEditorLayer(id);
            layer.refresh();
        }

        function addGpxGraphicsToMap(features) {
            var mapFeatures = features;
            for (var i = 0; i < mapFeatures.length; i++) {
                mapFeatures[i].geometry = toMercator(mapFeatures[i].geometry.x, mapFeatures[i].geometry.y);
            }
            for (var i = 0; i < features.length; i++) {
                addGpxGraphic(mapFeatures[i]);
            }
        }

        function parseGeoJSON(geoJson) {
            var result = [];
            for (var i = 0; i < geoJson.features.length; i++) {
                if (geoJson.features[i].geometry.type == 'Point') result.push(geoJsonToFeature(geoJson.features[i]));
            }
            return result;
        }

        function geoJsonToFeature(geoJson) {
            var feature = {};
            feature.geometry = {
                "x": geoJson.geometry.coordinates[0],
                "y": geoJson.geometry.coordinates[1]
            };
            feature.attributes = {
                name: geoJson.properties.name,
                desc: geoJson.properties.desc,
                sym: geoJson.properties.sym,
                time: geoJson.properties.time,
                lat: feature.geometry.y,
                lon: feature.geometry.x
            };

            return feature;
        }

        function getGeometryProps(geometry) {
            try {
                switch (geometry.type) {
                    case "point":
                        var point = toWgs84(geometry);
                        return {lon: point.x, lat: point.y}
                }
            }
            catch (e) {
                return null;
            }
        }

        function getGpxPoint() {
            return map.extent.getCenter();
        }

        function getCenterFromExtent(data) {
            var extent = new Extent(data.xmin, data.ymin, data.xmax, data.ymax, data.spatialReference);
            return extent.getCenter();
        }

        function exportMap(data) {
            var printTask = new PrintTask(data.url, {async: true});
            var params = new PrintParameters();
            params.map = map;
            params.extraParameters = {};
            params.template = new PrintTemplate();
            params.template.format = data.imageFormat;
            params.template.layout = data.paperSize;

            return printTask.execute(params);
        }

        function createGraphic(data) {
            return new Graphic(data.geometry, data.symbol, data.attributes, null);
        }

        function pointsToPolyline(points) {
            var geometry = new Polyline(points[0].spatialReference);
            geometry.addPath(points);
            return geometry;
        }

        function featureToGeoJson(feature) {
            var geometry = Terraformer.ArcGIS.parse(webMercatorUtils.webMercatorToGeographic(feature.geometry), {
                idAttribute: "OBJECTID"
            });
            return {
                type: "Feature",
                properties: feature.attributes,
                geometry: geometry
            }
        }

        function exportFeaturesToKML(elementName, className) {
            var grid = $("#" + elementName).data("kendoGrid");
            var dataSource = grid.dataSource;
            var ids = dataSource._data.map(function (item) {
                return item.OBJECTID
            });
            return db[className].getByArray(ids)
                .then(function (featureSet) {
                    var data = featureSet.features;
                    var geoJsonFeatures = data.map(function (item) {
                        return featureToGeoJson(item);
                    })
                    var geoJsonObject = {
                        type: "FeatureCollection",
                        features: geoJsonFeatures
                    };
                    var kml = tokml(geoJsonObject);
                    var blob = new Blob([kml.toString()], {type: "text/plain;charset=utf-8"});
                    saveAs(blob, "google.kml");
                })
        }

        function createMap(divElement, params) {
            var map = new Map(divElement, params);
            return map;
        }

        return {
            addGraphic: addGraphic,
            addGpxGraphic: addGpxGraphic,
            deleteGpxPoints: deleteGpxPoints,
            getUniqueRenderer: getUniqueRenderer,
            getFirstPointInLine: getFirstPointInLine,
            getLastPointInLine: getLastPointInLine,
            getNPointInLine: getNPointInLine,
            sumLineGeometry: sumLineGeometry,
            getCenter: getCenter,
            updateLineByPoint: updateLineByPoint,
            toMercator: toMercator,
            toWgs84: toWgs84,
            refreshLayer: refreshLayer,
            addGpxGraphicsToMap: addGpxGraphicsToMap,
            parseGeoJSON: parseGeoJSON,
            geoJsonToFeature: geoJsonToFeature,
            getGeometryProps: getGeometryProps,
            getScaledDependedRenderer: getScaledDependedRenderer,
            getScaleDenepndedRendererInfo: getScaleDenepndedRendererInfo,
            getGpxPoint: getGpxPoint,
            getCenterFromExtent: getCenterFromExtent,
            exportMap: exportMap,
            createGraphic: createGraphic,
            pointsToPolyline: pointsToPolyline,
            featureToGeoJson: featureToGeoJson,
            exportFeaturesToKML: exportFeaturesToKML,
            getFeatureExtent: getFeatureExtent,
            createMap: createMap,
            addGraphicToMap: addGraphicToMap,
            getNPointInLineInPath: getNPointInLineInPath
        };
    });