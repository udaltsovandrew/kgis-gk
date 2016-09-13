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
 * Created by lomteva.aa on 01.04.2016.
 */
function search() {
  require(['./js/app/dataAccess/model-compiled.js', './js/app/search/config.js', './js/app/search/plugins-compiled.js', './js/app/domain/carto-compiled.js'], function (model, config, plugins, carto) {
    let doSearch = (() => {
      var ref = _asyncToGenerator(function* () {
        var mapCollection = {};
        currentPageNumber = 0;

        var inputValue = document.getElementById("searchInput").value;
        /**
         * Создание моделей для доступа к БД (сервисам)
         */
        var db = initDB({});
        /**
         * Массив источников поиска (вспомогательная переменная - ["Substation", "PowerLine", ..., "Class4"]
         */
        var classes = config.sources.map(function (item) {
          return item.id;
        });
        /**
         * Массив асинхронных запросов к источникам с характерными для каждого источника запросами
         */
        var requests = classes.map((() => {
          var ref = _asyncToGenerator(function* (item) {
            var fields = getElementFromArray(config.sources, "id", item)["fields"];
            var where = fields.join(" LIKE '%" + inputValue + "%' OR ") + " LIKE '%" + inputValue + "%'";
            return yield db[item].get({ where: where, num: getElementFromArray(config.sources, "id", item)["num"] });
          });

          return function (_x) {
            return ref.apply(this, arguments);
          };
        })());

        /**
         * Обещание подождать пока все запросы не придут
         * @type {Promise}
         */
        var results = [];
        try {
          results = yield Promise.all(requests);
        } catch (e) {
          results = [];
        }

        /**
         * Массив для складывания результатов
         * @type {Array}
         */
        var features = [];
        for (var i = 0; i < classes.length; i++) {
          for (var j = 0; j < results[i].features.length; j++) {
            var feature = results[i].features[j];
            feature.className = classes[i];
            features.push(feature);
          }
        }
        /**
         * Магичекие действия с длинами массивов и размерами страниц
         * @type {Number}
         */
        if (features.length == 0) {
          var searchResults = document.getElementById("search-results");
          var pagerContainer = document.getElementById("pager-container");
          searchResults.innerHTML = "Ничего не найдено";
          clearContent(pagerContainer);
        } else {
          var searchResults = document.getElementById("search-results");
          clearContent(searchResults);
          var numberFeatures = features.length;
          var featuresPerPage = 10;
          var numberPages = Math.ceil(numberFeatures / featuresPerPage);

          lists = splitForLists(features, featuresPerPage);
          createPager(numberPages, 5);
          setContent(lists[0]);
        }
      });

      return function doSearch() {
        return ref.apply(this, arguments);
      };
    })();

    var lists = [];
    var currentPageNumber = 0;
    var firstPage = 0;
    var lastPage = 0;
    var searchButton = document.getElementById('searchButton');
    searchButton.onclick = doSearch;
    var searchInput = document.getElementById("searchInput");
    searchInput.onkeypress = keyPress;

    function splitForLists(features, featuresPerPage) {
      var i = 0;
      var n = features.length;
      var lists = [];
      while (i < n) {
        lists.push(features.slice(i, i += featuresPerPage));
      }

      return lists;
    }

    function keyPress(e) {
      var searchButton = document.getElementById('searchButton');
      if (e.keyCode === 13) {
        doSearch();
        return false;
      }
    };

    ;

    function initDB(database) {
      for (var i = 0; i < config.sources.length; i++) {
        database[config.sources[i].id] = new model({
          className: config.sources[i].id,
          url: config.sources[i].url
        });
      }
      return database;
    }

    function getElementFromArray(arr, prop, value) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][prop] === value) return arr[i];
      }
      return {};
    }

    function createPager(numberPages, maxNumberPages) {
      var pagerContainer = document.getElementById("pager-container");
      pagerContainer.innerHTML = "";
      var pager = document.createElement('nav');
      var pagerButtons = document.createElement('ul');
      pagerButtons.setAttribute('class', 'pagination sm');
      pagerButtons.innerHTML += "<li id='page-previous' class=''><a href='#'>Предыдущая</a></li>";
      for (var i = 0; i < numberPages; i++) {
        if (i < maxNumberPages) {
          pagerButtons.innerHTML += "<li id='page-" + i + "'><a href='#'>" + (i + 1) + "</a></li>";
        } else {
          pagerButtons.innerHTML += "<li style='display:none' id='page-" + i + "'><a href='#'>" + (i + 1) + "</a></li>";
        }
      }
      pagerButtons.innerHTML += "<li id='page-next' class=''><a href='#'>Следующая</a></li>";
      pager.appendChild(pagerButtons);
      pagerContainer.appendChild(pager);
      var activePage = document.getElementById("page-0");
      activePage.setAttribute('class', 'active');
      var searchResults = document.getElementById("search-results");
      var previousButton = document.getElementById("page-previous");
      var nextButton = document.getElementById("page-next");
      if (currentPageNumber === numberPages - 1) {
        nextButton.setAttribute('class', 'disabled');
      }
      if (currentPageNumber === 0) {
        previousButton.setAttribute('class', 'disabled');
      }

      lastPage = maxNumberPages - 1;

      bindClick("page-next", function () {
        "use strict";

        currentPageNumber++;
        if (currentPageNumber >= numberPages - 1) {
          currentPageNumber = numberPages - 1;
        }
        clearContent(searchResults);
        setContent(lists[currentPageNumber]);
        if (currentPageNumber === lastPage) {
          lastPage = lastPage + 2;
          firstPage = firstPage + 2;
          if (lastPage > numberPages - 1) {
            var difference = lastPage - (numberPages - 1);
            lastPage = lastPage - difference;
            firstPage = firstPage - difference;
          }
          changePager(firstPage, lastPage, numberPages);
        }

        setActivePage(currentPageNumber, numberPages);
        previousButton.removeAttribute('class');
        if (currentPageNumber === numberPages - 1) {
          nextButton.setAttribute('class', 'disabled');
        } else {
          nextButton.removeAttribute('class');
        }
      });
      bindClick("page-previous", function () {
        "use strict";

        currentPageNumber--;
        if (currentPageNumber === -1) {
          currentPageNumber = 0;
        }
        clearContent(searchResults);
        setContent(lists[currentPageNumber]);
        if (currentPageNumber === firstPage) {
          lastPage = lastPage - 2;
          firstPage = firstPage - 2;
          if (firstPage < 0) {
            lastPage = lastPage - firstPage;
            firstPage = 0;
          }
          changePager(firstPage, lastPage, numberPages);
        }
        setActivePage(currentPageNumber, numberPages);
        nextButton.removeAttribute('class');
        if (currentPageNumber === 0) {
          previousButton.setAttribute('class', 'disabled');
        } else {
          previousButton.removeAttribute('class');
        }
      });
      for (let i = 0; i < numberPages; i++) {
        bindClick("page-" + i, function () {
          clearContent(searchResults);
          setContent(lists[i]);
          currentPageNumber = i;
          if (currentPageNumber === firstPage) {
            lastPage = lastPage - 2;
            firstPage = firstPage - 2;
            if (firstPage < 0) {
              lastPage = lastPage - firstPage;
              firstPage = 0;
            }
            changePager(firstPage, lastPage, numberPages);
          }
          if (currentPageNumber === lastPage) {
            lastPage = lastPage + 2;
            firstPage = firstPage + 2;
            if (lastPage > numberPages - 1) {
              var difference = lastPage - (numberPages - 1);
              lastPage = lastPage - difference;
              firstPage = firstPage - difference;
            }
            changePager(firstPage, lastPage, numberPages);
          }
          setActivePage(currentPageNumber, numberPages);
          if (currentPageNumber === numberPages - 1) {
            nextButton.setAttribute('class', 'disabled');
          } else {
            nextButton.removeAttribute('class');
          }
          if (currentPageNumber === 0) {
            previousButton.setAttribute('class', 'disabled');
          } else {
            previousButton.removeAttribute('class');
          }
        });
      }
    }

    function setContent(list) {
      for (var i = 0; i < list.length; i++) {
        var feature = list[i];
        var className = list[i].className;
        var content = createDIV(className, feature);
        var searchResults = document.getElementById("search-results");
        searchResults.innerHTML += content;
        var links = getElementFromArray(config.sources, "id", className)["links"];
        links.forEach(function (item) {
          "use strict";

          var plugin = plugins.links[item];
          plugin.generate({
            parentElementName: className + "-" + feature.attributes.OBJECTID,
            feature: feature,
            className: className,
            carto: carto
          });
        });
      }
    }

    function createDIV(className, feature) {
      var configElement = getElementFromArray(config.sources, "id", className);
      var div = configElement.divTemplate(feature);
      return div;
    }

    function clearContent(div) {
      div.innerHTML = "";
    }

    function setActivePage(currentPageNumber, numberPages) {
      for (let i = 0; i < numberPages; i++) {
        var pageNumber = "page-" + i;
        var page = document.getElementById(pageNumber);
        if (page.hasAttribute('class')) {
          page.removeAttribute('class');
        }
      }
      var activePage = document.getElementById("page-" + currentPageNumber);
      activePage.setAttribute('class', 'active');
    }
    function changePager(firstPage, lastPage, numberPages) {
      for (var i = 0; i < numberPages; i++) {
        var pageNumber = "page-" + i;
        var page = document.getElementById(pageNumber);
        if (firstPage <= i <= lastPage) {
          if (page.hasAttribute('style')) {
            page.removeAttribute('style');
          }
        }
        if (i < firstPage || i > lastPage) {
          page.setAttribute('style', 'display:none');
        }
      }
    }
  });
}

//# sourceMappingURL=index-compiled.js.map

//# sourceMappingURL=index-compiled-compiled.js.map