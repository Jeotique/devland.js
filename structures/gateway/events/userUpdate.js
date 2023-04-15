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
        try {
            const data = d.d

            let user = new User(client, data)
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                let oldUser = client.users.get(user.id)
                client.emit('userUpdate', oldUser, user)
                user.cachedAt = Date.now()
                user.expireAt = Date.now() + client.options.usersLifeTime
                client.users.set(user.id, user)
                if (typeof client.options.membersLifeTime === "number" && client.options.membersLifeTime > 0) {
                    client.guilds.map(guild => {
                        if (guild.members.has(user.id)) {
                            let newmember = guild.members.get(user.id)
                            guild.members.delete(user.id)
                            newmember.user = user
                            newmember.cachedAt = Date.now()
                            newmember.expireAt = Date.now() + client.options.membersLifeTime
                            guild.members.set(user.id, newmember)
                        }
                    })
                }
            } else {
                client.emit('userUpdate', { error: "Enable the users cache to get the old user data", id: data.id, data_is_available: false }, user)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}