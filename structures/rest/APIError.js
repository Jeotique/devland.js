class APIError {

    constructor(message, endpoint, method, code, data, options) {
        this.name = "APIError";
        this.error = "APIError";
        this.method = method;
        this.code = code;
        switch(this.code) {
            case 204: this.message = "The server returned no content"; break;
            case 304: this.message = "No action was taken"; break;
            case 400: this.message = "Bad request, the server can't understand"; break;
            case 401: this.message = "Authorization missing, contact the support"; break;
            case 403: this.message = "Missing Permissions"; break;
            case 404: this.message = "Ressource not found"; break;
            case 405: this.message = "Method not allowed, contact the support"; break;
            case 429: this.message = "Too many requests"; break;
            case 502: this.message = "Gateway unavailable, wait a bit and retry"; break;
            default: this.message = "Server error"; break;
        }
    }

    get(){
        return `${this.name}
Method : ${this.method}
Code : ${this.code}
Message : ${this.message}`
    }

}

module.exports = APIError;