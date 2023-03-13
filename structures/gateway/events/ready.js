const Client = require('../../client/client')
const Models = require('../../models')
module.exports = {
    name: 'ready',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async(client, d) => {
        const data = d.d

        data.user.tag = data.user.username + '#' + data.user.discriminator
        client.user = new Models.ClientUser(client, data.user)
        client.sessionID = data.session_id
        for(const [obj] in data.guilds){
            client.guildsIds.push(data.guilds[obj].id)
        }
        setTimeout(()=>{
            client.ready = true
            /**
             * @event client#ready
             * @param {Client} client
             */
            client.emit('ready', client)
        }, 1500)
    }
}