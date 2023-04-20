/*class APIError {

    constructor(message, res) {
        this.name = "APIError";
        this.error = "APIError";
        this.message = message
        this.method = res.method;
        this.code = res.statusCode;
        this.res = res
        switch(this.code) {
            case 204: this.message = "The server returned no content"; break;
            case 304: this.message = "No action was taken"; break;
            case 400: this.message = "Invalid data provided"; break;
            case 401: this.message = "Authorization missing"; break;
            case 403: this.message = "Missing Permissions"; break;
            case 404: this.message = "Ressource not found, probably deleted"; break;
            case 405: this.message = "Method not allowed, contact the developer"; break;
            case 429: this.message = "Too many requests"; break;
            case 502: this.message = "Gateway unavailable, wait a bit and retry"; break;
            default: this.message = "Server error"; break;
        }
    }

    get(){
        return `${this.name}
Path : ${this.res.path}
Method : ${this.method}
Code : ${this.code}
Message : ${this.message}
Data : ${JSON.stringify(this.res.req.data)}
Options : ${JSON.stringify(this.res.req.options)}`
    }

}*/

class APIError extends Error {
    constructor(message, res) {
        super()
        this.name = "APIError";
        this.error = "APIError";
        this.message = message
        this.method = res.method;
        this.path = res.path;
        this.code = res.statusCode;
        this.data = res.req.data;
        this.options = res.req.options;
        switch(this.code) {
            case 204: this.message = "The server returned no content"; break;
            case 304: this.message = "No action was taken"; break;
            case 400: this.message = "Invalid data provided"; break;
            case 401: this.message = "Authorization missing"; break;
            case 403: this.message = "Missing Permissions"; break;
            case 404: this.message = "Ressource not found, probably deleted or invalid"; break;
            case 405: this.message = "Method not allowed, contact the developer"; break;
            case 429: this.message = "Too many requests"; break;
            case 502: this.message = "Gateway unavailable, wait a bit and retry"; break;
            default: this.message = "Server error"; break;
        }
    }
}

module.exports = APIError;