define(
  [
    "./js/app/domain/carto-compiled.js"
  ],
  function (carto) {
    "use strict";
    function exportMap(paperSize, imageFormat) {
      
      for (var i = 0; i < store.editors.length; i++) {
        var graphics = store.editors[i].graphics;
        var id = store.editors[i].id;
        var renderer = undefined;
        try {
          renderer = carto.getUniqueRenderer(config.renderers[id]["default"]);
        }
        catch (e) {
          
        }
        for (var j = 0; j < graphics.length; j++) {
          var graphic = graphics[j];
          if (renderer) {
            var symbol = renderer.getSymbol(graphic);
            var _graphic = carto.createGraphic({
              geometry:   graphic.geometry,
              symbol:     symbol,
              attributes: graphic.attributes
            });
            map.graphics.add(_graphic);
          }
          
        }
      }
      
      carto
        .exportMap({url: config.print.url, paperSize: paperSize, imageFormat: imageFormat})
        .then(
          function (result) {
            forms.showWindow("print-result");
            document.getElementById("print-result-image").setAttribute("src", result.url);
          },
          function (err) {
            console.log(err);
          }
        );
    }
    
    return {
      exportMap: exportMap
    }
  });