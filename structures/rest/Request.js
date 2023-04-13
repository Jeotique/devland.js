const got = require('custom-got');
const MultiStream = require('multistream');
const URL = require('url')
const FormData = require('form-data')
module.exports = class Request {

    constructor([client, token, endpoint, method, data, options], resolve, reject) {
        /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
        Object.defineProperty(this, 'client', { value: client })
        this.token = token;
        this.endpoint = endpoint;
        this.method = method;
        this.data = data;
        this.options = options;
        this.promise = { resolve, reject }
    }

    _setHeaders() {
        if (this.data && this.data?.reason) {
            return {
                'accept': '*/*',
                'accept-language': 'en-US;q=0.8',
                'accept-encoding': 'gzip, deflate',
                'user_agent': 'Discord Bot (devland.js)',
                'dnt': 1,
                'Authorization': 'Bot ' + this.token,
                'X-Audit-Log-Reason': this.data.reason,
                'use_x_forwarded_for': true,
            }
        } else {
            return {
                'accept': '*/*',
                'accept-language': 'en-US;q=0.8',
                'accept-encoding': 'gzip, deflate',
                'user_agent': 'Discord Bot (devland.js)',
                'dnt': 1,
                'Authorization': 'Bot ' + this.token,
                'use_x_forwarded_for': true,
            }
        }
    }
    build() {
        return new Promise((res) => {
            let callOptions = {}
            callOptions = URL.parse(this.endpoint);
            callOptions.url = this.endpoint
            callOptions.method = this.method.toUpperCase();
            callOptions.headers = this._setHeaders();
            callOptions.retries = 2;
            callOptions.use_x_forwarded_for = true;
            /*console.log(this.data)
            console.log(this.options)
            
            if (!(this.data?.files)) {
                if (this.data) callOptions.body = this.data;
                callOptions.json = true;
                callOptions.headers['content-type'] = 'application/json';
            } else if (this.data?.files.length) {
                if (this.data) callOptions.body = JSON.stringify(this.data);
                callOptions.headers['content-type'] = `multipart/form-data; boundary=----------------------------devland`;
            }*/

            let body;
            if (this.data) {
                if (this.data?.files?.length) {
                    body = new FormData()
                    for (const [index, file] of this.data.files.entries()) {
                        if (file?.file) body.append(file.key ?? `files[${index}]`, file.file, file.name)
                    }
                    delete this.data.files
                    if (typeof this.data !== "undefined" && Object.keys(this.data).length > 0) {
                        body.append('payload_json', JSON.stringify(this.data))
                    }
                    callOptions.headers = Object.assign(callOptions.headers, body.getHeaders())
                    callOptions.body = body
                } else {
                    if (this.data) callOptions.body = this.data;
                    callOptions.json = true;
                    callOptions.headers['content-type'] = 'application/json';
                }
            }
            this.client.emit('debug', '~~~~sending~~~~');
            got(this.endpoint, callOptions).then(result => {
                this.client.emit('debug', '~~~~sent~~~~');
                result.promise = this.promise
                result.req = this
                res(result)
            }).catch((err) => {
                console.log(err)
                this.client.emit('debug', '~~~~error with the request~~~~')
                err.promise = this.promise
                err.req = this
                res(err)
            });
        })
    }
}