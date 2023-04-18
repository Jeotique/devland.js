const Client = require('../client/client')
const Request = require('./Request')
const APIError = require('./APIError')
module.exports = class RESTHandler {
    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        Object.defineProperty(this, "client", { value: client, writable: false })

        this.handling = false

        this._ratelimits = []
    }

    queueRequest(token, endpoint, method, data, options) {
        return new Promise((resolve, reject) => {
            this._ratelimits.push(new Request([this.client, token, endpoint, method, data, options], resolve, reject))
            this.handle()
        })
    }

    executeRequest(req) {
        this.handling = true;
        return new Promise((resolve, reject) => {
            if (!req) return;
            req.build().then(res => {
                if (res.ok || res.complete) {
                    try {
                        res.promise.resolve(JSON.parse(res.body))
                    } catch (err) {
                        try {
                            let test = JSON.stringify(res.body)
                            res.promise.resolve(JSON.parse(test))
                        } catch (errr) { res.promise.resolve(res.body) }
                    }
                    return resolve();
                } else {
                    if (res.status === 429 || res.statusCode === 429) {
                        this._ratelimits.unshift(res.req);
                        setTimeout(() => resolve(), (res.headers["retry_after"] || res.headers["Retry-After"] || res.headers['retry-after'])*1000);
                        try {
                            this.client.emit('rateLimit',
                                `Rate limit hit
                        Message : ${res?.body?.message || res.headers["message"]}
                        Global : ${res?.body?.global || res.headers["global"]}
                        Method : ${req.method}
                        Path : ${req.endpoint}
                        Retry in : ${res.headers["retry_after"]||res.headers["Retry-After"]||res.headers['retry-after']}s
                        Code : ${res.status||res.statusCode}
                        x-ratelimit-limit : ${res.headers['x-ratelimit-limit']}
                        x-ratelimit-remaining : ${res.headers['x-ratelimit-remaining']}
                        x-ratelimit-reset : ${res.headers['x-ratelimit-reset']}ms
                        x-ratelimit-reset-after : ${res.headers['x-ratelimit-reset-after']}s
                        x-ratelimit-scope : ${res.headers['x-ratelimit-scope']}`)
                        } catch (err) { }
                        return;
                    }
                    if (res.status === 200 || res.statusCode === 200) {
                        try {
                            res.promise.resolve(JSON.parse(res?.body))
                        } catch (err) {
                            try {
                                let test = JSON.stringify(res?.body)
                                res.promise.resolve(JSON.parse(test))
                            } catch (errr) { res.promise.resolve(res?.body) }
                        }
                    } else {
                        let errorMessage = new APIError(null, null, req.method, res.statusCode, null, null).get()
                        res.promise.reject(new Error(errorMessage))
                    }
                }
            });
        });
    }

    handle() {
        if (this._ratelimits.length === 0) return
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