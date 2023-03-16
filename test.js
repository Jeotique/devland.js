const Discord = require('./index')
const client = new Discord.Client({
    connect: true,
    token: "OTkzNDk3NDA0MjEwOTU0MzMy.G3bJUt.uGPsjuWpTcHV-zk6la0GXMPsf6bHHjiObVxFS8",
    messagesLifeTime: true,
    guildsLifeTime: 999999,
    guildsLifeTimeResetAfterEvents: true,
    intents: 32767
})
client.on('ready', async () => {
    console.log(client.user.tag)
    client.guilds.map(guild => {
        console.log(guild.name)
    })
})

client.on('message', async message => {
    if (message.content === '+test') {
        console.log('test')
        let button = new Discord.Models.Button({
            label: "coucou",
            customId: "test"
        })
        let row = new Discord.Models.ActionRow(button)
        let embed = new Discord.Models.Embed()
        embed.description = "je suis la desc"
        let msg = await message.channel.send({ content: "Envoyé avec la custom lib", embeds: [embed], components: [row] })
        console.log(msg)
    }
})

//client.on('debug', data => console.log(data))