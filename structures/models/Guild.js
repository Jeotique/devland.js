const Utils = require('../util')
const Client = require('../client/client')
const TextChannel = require('./TextChannel')

module.exports = class Guild {
    /**
     * 
     * @param {Client} client 
     */
    constructor(client, data) {
        this.client = client
        this.id = data.id
        this.name = data.name
        this.icon = data.icon
        this.description = data.description
        this.homeHeader = data.homeHeader
        this.splash = data.splash
        this.discoverySplash = data.discovery_splash
        this.features = data.features
        this.banner = data.banner
        this.ownerId = data.owner_id
        this.region = data.region
        this.verificationLevel = data.verification_level
        this.mfaLevel = data.mfa_level
        this.defaultMessageNotifications = data.default_message_notifications
        this.explicitContentFilterLevel = data.explicit_content_filter
        this.maxMembers = data.max_members
        this.maxStageVideoChannelUsers = data.max_stage_video_channel_users
        this.maxVideoChannelUsers = data.max_stage_video_channel_users
        this.boostLevel = data.premium_tier
        this.boostCount = data.premium_subscription_count
        this.systemChannelFlags = data.system_channel_flags
        this.preferredLocale = data.preferred_locale
        this.boostProgressBar = data.premium_progress_bar_enabled
        this.nsfw = data.nsfw
        this.nsfwLevel = data.nsfw_level
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
    }
    /**
     * @typedef {Object} guildVanityData
     * @property {string|null} code
     * @property {number|null} uses
     */
    /**
     * Fetch and return vanity url data
     * @returns {Promise<guildVanityData>}
     */
    async fetchVanity(){
        return new Promise(async (resolve, reject) => {
            let result = await this.client.rest.get(this.client._ENDPOINTS.SERVERS(this.id)+'/vanity-url').catch(e=>{return reject(e)})
            if(!result) return reject("Can't fetch the vanity data")
            let res = {
                code: result.vanityUrlCode,
                uses: result.vanityUrlUses,
            }
            return resolve(res)
        })
    }
    /**
     * @typedef {Object} utilsChannels
     * @property {TextChannel|null} systemChannel
     * @property {number} afkTimeout
     * @property {TextChannel|null} afkChannel
     * @property {TextChannel|null} widgetChannel
     * @property {boolean} widgetEnabled
     * @property {TextChannel|null} rulesChannel
     * @property {TextChannel|null} safetyChannel
     * @property {TextChannel|null} publicUpdatesChannel
    */
    /**
     * Fetch and returns afk, system, widget, rules, safety, public updates channels
     * @returns {Promise<utilsChannels>}
     */
    async fetchUtilsChannels(){
        return new Promise(async(resolve, reject) => {
            let guildResult = await this.client.rest.get(this.client._ENDPOINTS.SERVERS(this.id)).catch(e=>{return reject(e)})
            if(!guildResult) return reject("Can't fetch the guild")
            let afkChannel = null
            let afkTimeout = guildResult.afk_timeout
            let systemChannel = null
            let widgetChannel = null
            let widgetEnabled = guildResult.widget_enabled
            let rulesChannel = null
            let safetyChannel = null
            let publicUpdatesChannel = null
            if(guildResult.system_channel_id) systemChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.system_channel_id)).catch(e=>reject(e))
            if(guildResult.afk_channel_id) afkChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.afk_channel_id)).catch(e=>reject(e))
            if(guildResult.widget_channel_id) widgetChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.widget_channel_id)).catch(e=>reject(e))
            if(guildResult.rules_channel_id) rulesChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.rules_channel_id)).catch(e=>reject(e))
            if(guildResult.safety_alerts_channel_id) safetyChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.safety_alerts_channel_id)).catch(e=>reject(e))
            if(guildResult.public_updates_channel_id) publicUpdatesChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.public_updates_channel_id)).catch(e=>{reject(e)})
            if(systemChannel) systemChannel = new TextChannel(this.client, this, systemChannel)
            if(afkChannel) afkChannel = new TextChannel(this.client, this, afkChannel)
            if(widgetChannel) widgetChannel = new TextChannel(this.client, this, widgetChannel)
            if(rulesChannel) rulesChannel = new TextChannel(this.client, this, rulesChannel)
            if(safetyChannel) safetyChannel = new TextChannel(this.client, this, safetyChannel)
            if(publicUpdatesChannel) publicUpdatesChannel = new TextChannel(this.client, this, publicUpdatesChannel)
            return resolve({
                systemChannel,
                afkTimeout,
                afkChannel,
                widgetChannel,
                widgetEnabled,
                rulesChannel,
                safetyChannel,
                publicUpdatesChannel
            })
        })
    }
}