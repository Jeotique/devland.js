const Client = require('../../client/client')
const { Guild, TextChannel, Message, User, StageChannel } = require('../../models')
module.exports = {
    name: 'stageInstanceUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d

        client.emit('stageInstanceUpdate', data)
    }
}