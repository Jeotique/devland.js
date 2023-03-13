const Client = require('../client/client')
const Request = require('./Request')
const APIError = require('./APIError')
module.exports = class RESTHandler {
    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        Object.defineProperty(this, "client", {value: client, writable: false})

        this.handling = false

        this._ratelimits = []
    }

    queueRequest(token, endpoint, method, data, options){
        return new Promise((resolve, reject) => {
            this._ratelimits.push(new Request([this.client, token, endpoint, method, data, options], resolve, reject))
            this.handle()
        })
    }

    executeRequest(req) {
        this.handling = true;
        return new Promise((resolve, reject) => {
            if(!req) return;
            req.build().then(res => {
                if (res.ok || res.complete) {
                    res.promise.resolve(res.body);
                    return resolve();
                } else {
                  //  console.log(res)
                    //console.log(res.headers["retry_after"])
                    if (res.status === 429 || res.statusCode === 429) {
                        this._ratelimits.unshift(res.req);
                        setTimeout(() => resolve(), res.headers["retry_after"]*1000);
                        return;
                    }
                    if(res.status === 200 || res.statusCode === 200) return res.promise.resolve(res?.body)
                    let errorMessage = new APIError(null, null, req.method, res.statusCode, null, null).get()
                    throw new Error(errorMessage)
                }
            });
        });
    }

    handle() {
        if(this._ratelimits.length === 0) return
        this.executeRequest(this._ratelimits.shift()).then(() => {
            this.handling = false;
            this.handle();
        });
    }

    /**
     * Requests a discord endpoint.
     * @param {string} endpoint The endpoint to request
     * @param {string} method The method example get
     * @param {object} data The provided request data.
     * @param {object} [options={}] The optional options object.
     * @returns {Promise<any>}
     */
     request(endpoint, method, data, options = {}) {
        return this.queueRequest(this.client.token, endpoint, method, data, options);
    }

    /**
     * Sends a GET request to discord.
     * @param {string} endpoint The endpoint to GET from.
     * @returns {Promise<any>}
     */
    get(endpoint, body) {
        return this.request(endpoint, "get", body ? body : null);
    }

    /**
     * Sends a GET request but with the given query.
     * @param {string} endpoint The endpoint to GET from.
     * @param {string} query The given query.
     * @returns {Promise<any>}
     */
    getQuery(endpoint, query) {
        return this.request(endpoint, "get", null, query);
    }

    /**
     * Sends a POST request to discord.
     * @param {string} endpoint The endpoint to POST to.
     * @param {object} body The post body.
     * @param {object} options The post options.
     * @returns {Promise<any>}
     */
    post(endpoint, body, options = {}) {
        return this.request(endpoint, "post", body, options);
    }

    /**
     * Sends a PUT request to discord.
     * @param {string} endpoint The endpoint to POST to.
     * @param {object} body The post body.
     * @param {object} options The put options.
     * @returns {Promise<any>}
     */
    put(endpoint, body, options = {}) {
        return this.request(endpoint, "put", body, options);
    }

    /**
     * Sends a PATCH request to discord.
     * @param {string} endpoint The endpoint to POST to.
     * @param {object} body The post body.
     * @param {object} options The patch options.
     * @returns {Promise<any>}
     */
    patch(endpoint, body, options = {}) {
        return this.request(endpoint, "patch", body, options);
    }

    /**
     * Sends a DELETE request to discord.
     * @param {string} endpoint The endpoint to POST to.
     * @param {object} options The patch options.
     * @returns {Promise<any>}
     */
    delete(endpoint, options = {}) {
        return this.request(endpoint, "delete", null, options);
    }
}