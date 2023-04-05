const Client = require('../../client/client')
const { Guild, TextChannel, Message, User } = require('../../models')
module.exports = {
    name: 'userUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d

        let user = new User(client, data)
        if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
            let oldUser = client.users.get(user.id)
            client.emit('userUpdate', oldUser, user)
            user.cachedAt = Date.now()
            user.expireAt = Date.now() + client.options.usersLifeTime
            client.users.set(user.id, user)
        } else {
            client.emit('userUpdate', { error: "Enable the users cache to get the old user data", id: data.id, data_is_available: false }, user)
        }
    }
}