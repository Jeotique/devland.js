const Client = require('../../client/client')
const { Guild, TextChannel, Message, User, StageChannel } = require('../../models')
module.exports = {
    name: 'presenceUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d

        client.emit('presenceUpdate', data)
    }
}