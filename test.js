const Discord = require('./index')
const client = new Discord.Client({ connect: true, token: 'OTkzNDk3NDA0MjEwOTU0MzMy.G3bJUt.uGPsjuWpTcHV-zk6la0GXMPsf6bHHjiObVxFS8', intents: 131071 })

client.on('ready', async () => {
        console.log(client.user.tag)
        let guilds = await client.fetchGuilds()
        let g = guilds.first()
        console.log(g.name)
})

client.on('messageCreate', message => {
    console.log(message.author)
})

//client.on('debug', data => console.log(data))