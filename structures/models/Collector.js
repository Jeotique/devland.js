const Client = require('../client/client')
const { default: Store } = require('../util/Store/Store')
//const { Guild, Message, TextChannel, VoiceChannel, CategoryChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel } = require('./index')
const { EventEmitter } = require('events')
module.exports = class Collector extends EventEmitter {
    constructor(client, guild, message, channel, data = {
        type: 'message',
        time: 15_00,
        count: 1
    }) {
        super();
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.message = message
        this.channel = channel
        this.defaultData = {
            type: "message",
            time: 15_00,
            count: data.type === "await_message" ? 1 : undefined
        }
        this.data = data
        Object.keys(this.defaultData).map(k => {
            if (typeof this.data[k] === "undefined") this.data[k] = this.defaultData[k]
        })
        this.cache = new Store()
        this.ended = false
        if (this.data.type === "message")
            this.client.on('message', message => {
                if (this.ended) return;
                if (this.channel.id !== message.channelId) return;
                if (this.data.filter && typeof this.data.filter === "function") {
                    let array = []
                    array.push(message)
                    array = array.filter(this.data.filter)
                    if (array.length < 1) return
                    else array.map(m => this.cache.set(m.id, m))
                    this.emit("collected", array[0])
                    if (this.cache.size === this.data.count) {
                        this.emit('totalCollected', this.cache)
                        return this.emit('end')
                    }
                } else {
                    this.cache.set(message.id, message)
                    this.emit("collected", message)
                    if (this.cache.size === this.data.count) {
                        this.emit('totalCollected', this.cache)
                        return this.emit('end')
                    }
                }
            })
        else if (this.data.type === "component")
            this.client.on('interaction', interaction => {
                if (this.ended) return;
                if (this.channel && this.channel.id !== interaction.channelId) return;
                if (this.message && this.message.id !== interaction.message?.id) return;
                if (typeof this.data.componentType === "number" && (interaction.data?.component_type !== this.data.componentType) && interaction.type !== this.data.componentType) return;
                if (this.data.filter && typeof this.data.filter === "function") {
                    let array = []
                    array.push(interaction)
                    array = array.filter(this.data.filter)
                    if (array.length < 1) return
                    else array.map(i => this.cache.set(i.id, i))
                    this.emit("collected", array[0])
                    if (this.cache.size === this.data.count) {
                        this.emit('totalCollected', this.cache)
                        return this.emit('end')
                    }
                } else {
                    this.cache.set(interaction.id, interaction)
                    this.emit("collected", interaction)
                    if (this.cache.size === this.data.count) {
                        this.emit('totalCollected', this.cache)
                        return this.emit('end')
                    }
                }
            })
        else if (this.data.type === "await_message")
            this.client.on('message', message => {
                if (this.ended) return;
                if (this.channel.id !== message.channelId) return;
                if (this.data.filter && typeof this.data.filter === "function") {
                    let array = []
                    array.push(message)
                    array = array.filter(this.data.filter)
                    if (array.length < 1) return
                    else array.map(m => this.cache.set(m.id, m))
                    if (this.cache.size === this.data.count) {
                        this.emit('collected', this.cache)
                        return this.emit('end')
                    }
                } else {
                    this.cache.set(message.id, message)
                    if (this.cache.size === this.data.count) {
                        this.emit('collected', this.cache)
                        return this.emit('end')
                    }
                }
            })

        setTimeout(() => {
            this.emit('end')
        }, this.data.time)
    }
}