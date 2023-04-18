const Client = require('../../client/client')
const { Guild, TextChannel, Message, User, StageChannel } = require('../../models')
module.exports = {
    name: 'stageInstanceDelete',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            client.emit('stageInstanceDelete', data)
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}