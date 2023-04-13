const User = require('./User')
const Client = require('../client/client')
const Guild = require('./Guild')
const ActivityFlags = require('../util/BitFieldManagement/ActivityFlags')

module.exports = class Presence {
    constructor(client, guild, data){
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = guild?.id
        this.user = (data.user instanceof User) ? data.user : new User(client, data.user)
        this.userId = data.user?.id
        this.status = data.status || 'offline'
        this.activities = data.activities || []
        this.client_status = data.client_status || {}
        this.data_is_available = true
        if(this.activities.length > 0) this.activities.map(activity => {
            if(activity.flags) activity.flags = new ActivityFlags(BigInt(activity.flags))
        })
    }
}