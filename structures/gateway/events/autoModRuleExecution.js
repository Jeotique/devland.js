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
        const data = d.d

        client.emit('autoModRuleExecution', data)
    } 
}