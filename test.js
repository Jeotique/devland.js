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
        let select = new Discord.MentionableSelect()
        select.customId = "test"
        select.placeholder = "Coucou user select"
        let row = new Discord.ActionRow(select)
        let embed = new Discord.Embed()
        embed.description = "je suis la desc"
        let msg = await message.channel.send({ content: "Envoyé avec la custom lib", embeds: [embed], components: [row] })
        setTimeout(() => {
            try{
            let row1 = new Discord.ActionRow()
            let select2 = new Discord.StringSelect()
            select2.addOptions({label: "coucou", value: "ok", emoji: "❤"}, {label: "haha", value: "hehe"})
            select2.customId = "test2"
            row1.addComponents(select2)
            msg.edit({content: "coucoucou", components: [row, row1]})//.catch(e=>{})
            }catch(err){console.log(err)}
        }, 2000)
    }
})

//client.on('debug', data => console.log(data))