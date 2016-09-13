/**
 * Created by udaltsov on 29.06.16.
 */
define(["dojo/request"],  function (request) {
  function getUrl(url) {
    "use strict";
    var action = new Promise(function (resolve, reject) {
      request(url, {
        method: "GET"
      })
        .then(function (data) {
          resolve(data);
        });
    });
    return action;
  }
  function postUrl(url, data) {
    "use strict";
    var action = new Promise(function (resolve, reject) {
      request(url, {
        method: "POST",
        data:   data
      })
      .then(function (data) {
        resolve(data);
      });
    });
    return action;
  }

  return {
    GET: getUrl,
    POST: postUrl
  };
});