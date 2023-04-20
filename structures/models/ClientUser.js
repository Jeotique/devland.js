const Client = require('../client/client')
const UserFlags = require('../util/BitFieldManagement/UserFlags')
const DataResolver = require('../util/DateResolver')

module.exports = class ClientUser {
  constructor(client, data = {}) {
    /**
     * @private
     */
    /**
 * The client that instantiated this
 * @name Base#client
 * @type {Client}
 * @readonly
 */
    Object.defineProperty(this, 'client', { value: client })
    /**
     * @type {boolean}
     */
    this.verified = data.verified
    /**
     * @type {string}
     */
    this.username = data.username
    /**
     * @type {boolean}
     */
    this.mfa_enabled = data.mfa_enabled
    /**
     * @type {string}
     */
    this.id = data.id
    /**
     * @type {number}
     */
    this.flags = new UserFlags(BigInt(data.flags ?? 0))
    /**
     * @type {string}
     */
    this.email = data.email
    /**
     * @type {string}
     */
    this.discriminator = data.discriminator
    /**
     * @type {boolean}
     */
    this.bot = data.bot
    /**
     * @type {string}
     */
    this.avatar = data.avatar
    /**
     * @type {string}
     */
    this.tag = data.tag

    if (this.avatar) {
      this.avatar = `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}${this.avatar.startsWith('a_') ? '.gif' : '.png'}?size=512`
    }
  }

  toString() {
    return `<@${this.id}>`
  }

  setPresence(presence) {
    if (typeof presence !== "object") throw new TypeError("The presence data must be a object")
    let packed = this._parse(presence)
    this._patch(packed)
    this.client.ws.sendWS(3, packed)
    this.client.options.presence = packed
  }

  setName(name) {
    return new Promise(async (resolve, reject) => {
      if (typeof name !== "string") return reject(new TypeError("Invalid name"))
      this.client.rest.patch(this.client._ENDPOINTS.ME, {
        username: name
      }).then(res => {
        let newClientUser = new ClientUser(this.client, res)
        resolve(newClientUser)
        Object.keys(newClientUser).map(k => this[k] = newClientUser[k])
      }).catch(e => {
        return reject(e)
      })
    })
  }

  setAvatar(avatar) {
    return new Promise(async (resolve, reject) => {
      if (typeof avatar === "undefined") return reject(new TypeError("You need to provid me a avatar"))
      avatar = await DataResolver.resolveImage(avatar)
      this.client.rest.patch(this.client._ENDPOINTS.ME, {
        avatar: avatar
      }).then(res => {
        let newClientUser = new ClientUser(this.client, res)
        resolve(newClientUser)
        Object.keys(newClientUser).map(k => this[k] = newClientUser[k])
      }).catch(e => {
        return reject(e)
      })
    })
  }

  /**
 * Parses presence data into a packet ready to be sent to Discord
 * @param {PresenceData} presence The data to parse
 * @returns {APIPresence}
 * @private
 */
  _parse({ status, since, afk, activities }) {
    const data = {
      activities: [],
      afk: typeof afk === 'boolean' ? afk : false,
      since: typeof since === 'number' && !Number.isNaN(since) ? since : null,
      status: status ?? this.status,
    };
    if (activities?.length) {
      for (const [i, activity] of activities.entries()) {
        if (typeof activity.name !== 'string') {
          throw new Error(`activities[${i}].name`, 'string');
        }
        activity.type ??= 0;

        data.activities.push({
          type: activity.type,
          name: activity.name,
          url: activity.url,
        });
      }
    } else if (!activities && (status || afk || since) && this.activities.length) {
      data.activities.push(
        ...this.activities.map(a => ({
          name: a.name,
          type: a.type,
          url: a.url ?? undefined,
        })),
      );
    }

    return data;
  }

  _patch(data) {
    if ('status' in data) {
      /**
       * The status of this presence
       * @type {PresenceStatus}
       */
      this.status = data.status;
    } else {
      this.status ??= 'offline';
    }

    if ('activities' in data) {
      /**
       * The activities of this presence
       * @type {Activity[]}
       */
      this.activities = data.activities;
    } else {
      this.activities ??= [];
    }

    if ('client_status' in data) {
      /**
       * The devices this presence is on
       * @type {?Object}
       * @property {?ClientPresenceStatus} web The current presence in the web application
       * @property {?ClientPresenceStatus} mobile The current presence in the mobile application
       * @property {?ClientPresenceStatus} desktop The current presence in the desktop application
       */
      this.clientStatus = data.client_status;
    } else {
      this.clientStatus ??= null;
    }

    return this;
  }

}