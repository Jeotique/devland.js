const User = require('./User')

module.exports = class Ban {
    constructor(client, data) {
        this.reason = data.reason
        this.user = new User(client, data.user)
    }
}