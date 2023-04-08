const Discord = require('./index')
const client = new Discord.Client({
    connect: true,
    token: "OTkzNDk3NDA0MjEwOTU0MzMy.GoKyNU.pVKI2neNuxtQaw1t0t9xleuZBPP8FgFMkrlx5M",
    messagesLifeTime: 9999999,
    guildsLifeTime: 999999,
    guildsLifeTimeResetAfterEvents: true,
    channelsLifeTime: 9999999,
    channelsLifeTimeResetAfterEvents: true,
    usersLifeTime: 999999999,
    membersLifeTime: 999999,
    rolesLifeTime: 999999,
    intents: 32767,
    presence: {
        status: "dnd"
    }
})
client.on('ready', async () => {
    console.log(client.user.tag)
    let guild = client.guilds.get("974284423979745370")
    console.log(guild.name)
    let member = guild.members.get("1072553881134972970")
    console.log(member.user.tag)
    //guild.createRole({name: "test create lib 2", permissions: new Discord.Permissions(["ADMINISTRATOR"])})
    console.log(member.hasPermissions("ADMINISTRATOR"))
})

client.on('roleCreate', role => {
    console.log(role)
    console.log("rôle créé")
})

client.on('roleUpdate', (old, newr) => {
    console.log(`${old.name} -> ${newr.name}`)
})

client.on('roleDelete', role => {
    console.log(role)
    console.log("rôle supprimé")
})

client.on('guildAuditLogEntryCreate', log => {
    console.log(log)
})

client.on('message', async message => {

    if(message.guild){
        console.log(message)
        console.log("message venant d'un serveur")
    } else {
        console.log(message)
        console.log("message venant d'un salon privé")
    }

    return;
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
            try {
                let row1 = new Discord.ActionRow()
                let select2 = new Discord.StringSelect()
                select2.addOptions({ label: "coucou", value: "ok", emoji: "❤" }, { label: "haha", value: "hehe" })
                select2.customId = "test2"
                row1.addComponents(select2)
                msg.edit({ content: "coucoucou", components: [row, row1] })//.catch(e=>{})
            } catch (err) { console.log(err) }
        }, 2000)
    } else if (message.content === "+rename") {
        message.channel.edit({ name: "nom modifié 2" })//.catch(e=>{})
    } else if (message.content === "+pin") {
        message.pinMessage("test fonction pin")
        setTimeout(() => {
            message.unpinMessage("test fonction unpin")
        }, 2000)
    } else if (message.content === "+editperm") {
        message.channel.edit({
            permission_overwrites: [{
                id: "1003648510643667034",
                type: 0,
                allow: ["VIEW_CHANNEL"]
            }]
        })
    } else if (message.content === "+clone") {
        message.channel.clone()
    } else if (message.content === "+move") {
        message.channel.setPosition(2)
    } else if (message.content === "+clear") {
        message.channel.bulkDelete(5)
    } else if (message.content === "+pinned") {
        message.channel.getPinnedMessages().then(a => console.log(a))
    } else if (message.content === "+cross") {
        message.crosspost()
    } else if (message.content === "+react") {
        await message.react("<a:778729493279014913:1003648670505381950>")
        setTimeout(() => {
            message.unreact("<a:778729493279014913:1003648670505381950>")
        }, 2000)
    } else if (message.content === "+unreact") {
        setTimeout(() => {
            message.unreact("<a:778729493279014913:1003648670505381950>", "484412542530224128")
        }, 6000)
    } else if (message.content === "+reactlist"){
        setTimeout(() => {
            message.getUsersFromReaction("<a:778729493279014913:1003648670505381950>").then(a => console.log(a))
        }, 6000)
    }
})

//client.on('debug', data => console.log(data))