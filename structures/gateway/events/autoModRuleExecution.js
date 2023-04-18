const Client = require('../../client/client')
const { Guild, User, AutoModRule } = require('../../models')
module.exports = {
    name: 'autoModRuleExecution',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            client.emit('autoModRuleExecution', data)
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}