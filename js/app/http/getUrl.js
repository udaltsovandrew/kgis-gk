/**
 * Created by aleshkovskii.av on 28.06.2016.
 */
define(["dojo/request"], function (request) {

    function getUrl(url){
        return new Promise(function(resolve){
            request(url, {})
                .then(function(data){
                    resolve(data);
                })
        })
    }

    return {
        getUrl: getUrl
    };
    
}); 