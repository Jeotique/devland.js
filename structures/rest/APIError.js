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
        switch (this.code) {
            case 204: this.message = "The server returned no content"; break;
            case 304: this.message = "No action was taken"; break;
            case 400: this.message = "Invalid data provided"; break;
            case 401: this.message = "Authorization missing"; break;
            case 403: this.message = "Missing Permissions"; break;
            case 404: {
                if (this.path.includes("/interactions/"))
                    this.message = "Unknow interaction, probably deleted or invalid"
                else if (this.path.includes("/pins"))
                    this.message = "Unknow pin, probably unpined or invalid"
                else if (this.path.includes("/reactions"))
                    this.message = "Unknow reaction, probably removed or invalid"
                else if (this.path.includes("messages/"))
                    this.message = "Unknow message, probably deleted or invalid"
                else if (this.path.includes("channels/"))
                    this.message = "Unknow channel, probably deleted or invalid"
                else if (this.path.includes("/users"))
                    this.message = "Unknow user, probably invalid"
                else if (this.path.includes("/webhooks"))
                    this.message = "Unknow webhook, probably deleted or invalid"
                else if (this.path.includes("/emojis"))
                    this.message = "Unknow emoji, probably deleted or invalid"
                else if (this.path.includes("/commands"))
                    this.message = "Unknow command, probably deleted or invalid"
                else if (this.path.includes("/invites"))
                    this.message = "Unknow invite, problably deleted or invalid"
                else if (this.path.includes("/auto-moderations/"))
                    this.message = "Unknow auto-mod rule, probably deleted or invalid"
                else if (this.path.includes("scheduled-events"))
                    this.message = "Unknow event, probably deleted or invalid"
                else if (this.path.includes("/integrations"))
                    this.message = "Unknow integration, probably deleted or invalid"
                else if (this.path.includes("/members"))
                    this.message = "Unknow member, probably deleted or invalid"
                else if (this.path.includes("/roles"))
                    this.message = "Unknow role, probably deleted or invalid"
                else if (this.path.includes("/bans"))
                    this.message = "Unknow ban, probably revoked or invalid"
                else if (this.path.includes("/guilds"))
                    this.message = "Unknow guild, probably invalid"
                else
                    this.message = "Ressource not found, probably deleted or invalid"
            } break;
            case 405: this.message = "Method not allowed, contact the developer"; break;
            case 429: this.message = "Too many requests"; break;
            case 502: this.message = "Gateway unavailable, wait a bit and retry"; break;
            default: this.message = "Server error"; break;
        }
    }
}

module.exports = APIError;