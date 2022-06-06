
const Response = require("../models/response.model");

class WSRouter {
    URI_DELIMITER = "/";
    PARAM_DELIMITER = ":";
    
    #endpointMap = {
        "get": {},
        "post": {},
        "put": {},
        "delete": {}
    };

    constructor() {}

    getEndpoints() { return this.#endpointMap; }

    get(uri, callback) {
        this.setEndpoint("get", uri, callback);
    }
    
    post(uri, callback) {
        this.setEndpoint("post", uri, callback);
    }

    put(uri, callback) {
        this.setEndpoint("put", uri, callback);
    }

    delete(uri, callback) {
        this.setEndpoint("delete", uri, callback);
    } 

    setEndpoint(method, uri, callback) {
        var uriArray = uri.split(this.URI_DELIMITER);
        var filteredUriArray = uriArray.filter(function(value, index, array) {
            return value != "" && value != null;
        });
        var pointer = this.#endpointMap[method];
        for(var idx=0; idx<filteredUriArray.length; idx++) {
            if(pointer[filteredUriArray[idx]] == null) {
                pointer[filteredUriArray[idx]] = {};
            }
            pointer = pointer[filteredUriArray[idx]];
        }
        pointer["_callback"] = callback;
    }

    use(path, router) {
        // Split path (/api/ to something like ["", "api"])
        var pathArray = path.split(this.URI_DELIMITER);
        // Remove empty or null values from the path array so ["api"] is left
        var filteredPathArray = pathArray.filter(function(value, index, array) {
            return value != "" && value != null;
        });
        // Get sub-router paths
        var requestTypes = router.getEndpoints();
        for(let type in requestTypes) {
            // Point to current router type root (point to "get" method URIs for example)
            let pointer = this.#endpointMap[type];
            // Go over all path elements and add them to the map;
            // The results should be something like 
            // this.#endpointMap["get"]["api"]
            for(let idx=0; idx<filteredPathArray.length; idx++) {
                if(pointer[filteredPathArray[idx]] == null) {
                    pointer[filteredPathArray[idx]] = {};
                }
                pointer = pointer[filteredPathArray[idx]];
            }
            // Add sub-router to the current type and path
            // ex. requestTypes["get"] = { "v1": { "book": { "paramsNameList": [], "callback": function } } }
            // will result in this.#endpointMap["get"] = { "api": { "v1": { "book": { "paramsNameList": [], "callback": function } } } }
            for(let endpoint in requestTypes[type]) {
                pointer[endpoint] = requestTypes[type][endpoint];
            }
        }
    }

    async execute(request, socket) {
        try {
            var req = JSON.parse(request.toString());
            var uri = req.path;
            var type = req.type.toLowerCase();
            var resObj = new Response(type, uri, socket);
            // Split path
            var pathArray = uri.split(this.URI_DELIMITER);
            // Remove empty or null values from the path array
            var filteredPathArray = pathArray.filter(function(value, index, array) {
                return value != "" && value != null;
            });
            try {
                // Get callback and url parameters
                var pointerData = this.#helperFunction(this.#endpointMap[type], filteredPathArray, 0);
                // After reaching the end of the path we check if we have a callback for it.
                if(typeof pointerData.pointer._callback === 'function') {
                    var reqObj = {
                        "oroginal": req,
                        "params": pointerData.params,
                    };
                    await pointerData.pointer._callback(reqObj, resObj);
                    return;
                }
                throw Error();
            } catch(err) {
                resObj.send("Not found, sorry!", 404);
            }
        } catch(err) {
            var res = new Response(null, null, socket);
            res.send(request.toString, 400);
        }
    }

    // This function recursively finds the best suitable match for the URI
    #helperFunction(pointer, path, idx) {
        if(path[idx] == null) {
            return null;
        }
        if(pointer[path[idx]] != null) {
            if(path.length-1 == idx) {
                return { "pointer": pointer[path[idx]], "params": {} };
            }
            return this.#helperFunction(pointer[path[idx]], path, idx+1);
        }
        for(let prop in pointer) {
            if(prop[0] == this.PARAM_DELIMITER) {
                if(path.length-1 == idx) {
                    var params = {};
                    params[prop.slice(1)] = path[idx];
                    return { "pointer": pointer[prop], "params": params };
                }
                let newPointer = this.#helperFunction(pointer[prop], path, idx+1);
                if(newPointer != null) {
                    newPointer.params[prop.slice(1)] = path[idx];
                    return newPointer;
                }
            }
        }
        return null;
    }
}

module.exports = WSRouter;