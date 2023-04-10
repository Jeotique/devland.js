const Guild = require('./Guild')
const Client = require('../client/client')

module.exports = class VoiceState {
    constructor(client,  data){
        Object.defineProperty(this, 'client', { value: client })
        this.guild = data.guild
        this.guildId = data.guild_id
        this.channel = data.channel
        this.channelId = data.channel_id
        this.user = data.user
        this.userId = data.user_id
        this.member = data.member
        this.session_id = data.session_id
        this.deaf = data.deaf
        this.mute = data.mute
        this.self_deaf = data.self_deaf
        this.self_mute = data.self_mute
        this.self_stream = data.self_stream
        this.self_video = data.self_video
        this.suppress = data.suppress
        this.request_to_speak_timestamp = data.request_to_speak_timestamp
    }
}