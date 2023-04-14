const DataResolver = require('./DateResolver');

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isObject = d => typeof d === 'object' && d !== null;
module.exports.mergeDefault = (def, given) => {
  if (!given) return def;
  for (const key in def) {
    if (!has(given, key) || given[key] === undefined) {
      given[key] = def[key];
    } else if (given[key] === Object(given[key])) {
      given[key] = this.mergeDefault(def[key], given[key]);
    }
  }
  return given;
}

module.exports.createDefaultOptions = () => {
  return {
    connect: false,
    presence: {
      activities: [],
      status: 'online',
      afk: false
    },
    intents: 0,
    ws: {
      large_threshold: 50,
      compress: false,
      properties: {
        $os: process.platform,
        $browser: 'devland.js',
        $device: 'devland.js',
      },
      version: 1,
    },
    messagesLifeTime: null,
    guildsLifeTime: null,
    channelsLifeTime: null,
    usersLifeTime: null,
    threadsLifeTime: null,
    membersLifeTime: null,
    rolesLifeTime: null,
    invitesLifeTime: null,
    presencesLifeTime: null,
    voicesLifeTime: null,
    waitCacheBeforeReady: true,
    shardId: 0,
    shardCount: 0,
    token: null,
  }
}

module.exports.createDefaultShardOptions = () => {
  return {
    totalShards: 'auto',
    respawn: true,
    shardArgs: [],
    token: null,
    autospawn: false,
  }
}

module.exports.makeError = (obj) => {
  const err = new Error(obj.message);
  err.name = obj.name;
  err.stack = obj.stack;
  return err;
}

module.exports.makePlainError = (err) => {
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
}

module.exports.fetchRecommendedShards = async (token, guildsPerShard = 1000) => {
  return new Promise(async (resolve, reject) => {
    if (!token) throw new Error('TOKEN_MISSING');
    const fetch = require('node-fetch')
    fetch(`https://discordapp.com/api/gateway/bot`, {
      method: 'GET',
      headers: { Authorization: `Bot ${token.replace(/^Bot\s*/i, '')}` },
    }).then(async res => {
      if (res.ok) {
        let t = await res.json();
        return resolve(t.shards * (1000 / guildsPerShard))
      }
    }).catch(e => { console.log(e) });
  })
}

module.exports.delayFor = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const EPOCH = 1_420_070_400_000;
let INCREMENT = BigInt(0);
module.exports.getTimestampFrom = (snowflake) => {
  try {
    return Number(BigInt(snowflake) >> 22n) + EPOCH
  } catch (e) { return 0 }
}

const clean = (text) => {
  if (typeof (text) == 'string') return text.replace(/[`@]/g, '$&\u200b');
  else return text;
};

module.exports.cleanMessage = async (content) => {
  const cleaned = clean(content);
  return cleaned;
}

module.exports.basename = (path, ext) => {
  const { parse } = require('node:path')
  const res = parse(path);
  return ext && res.ext.startsWith(ext) ? res.name : res.base.split('?')[0];
}


module.exports.Colors = {
  DEFAULT: 0x000000,
  WHITE: 0xffffff,
  AQUA: 0x1abc9c,
  GREEN: 0x57f287,
  BLUE: 0x3498db,
  YELLOW: 0xfee75c,
  PURPLE: 0x9b59b6,
  LUMINOUS_VIVID_PINK: 0xe91e63,
  FUCHSIA: 0xeb459e,
  GOLD: 0xf1c40f,
  ORANGE: 0xe67e22,
  RED: 0xed4245,
  GREY: 0x95a5a6,
  NAVY: 0x34495e,
  DARK_AQUA: 0x11806a,
  DARK_GREEN: 0x1f8b4c,
  DARK_BLUE: 0x206694,
  DARK_PURPLE: 0x71368a,
  DARK_VIVID_PINK: 0xad1457,
  DARK_GOLD: 0xc27c0e,
  DARK_ORANGE: 0xa84300,
  DARK_RED: 0x992d22,
  DARK_GREY: 0x979c9f,
  DARKER_GREY: 0x7f8c8d,
  LIGHT_GREY: 0xbcc0c0,
  DARK_NAVY: 0x2c3e50,
  BLURPLE: 0x5865f2,
  GREYPLE: 0x99aab5,
  DARK_BUT_NOT_BLACK: 0x2c2f33,
  NOT_QUITE_BLACK: 0x23272a,
};

module.exports.resolveColor = (color) => {
  if (typeof color === 'string') {
    color = color.toUpperCase()
    if (color === 'RANDOM') return Math.floor(Math.random() * (0xffffff + 1));
    if (color === 'DEFAULT') return 0;
    color = this.Colors[color] ?? parseInt(color.replace('#', ''), 16);
  } else if (Array.isArray(color)) {
    color = (color[0] << 16) + (color[1] << 8) + color[2];
  }

  if (color < 0 || color > 0xffffff) throw new RangeError('COLOR_RANGE');
  else if (Number.isNaN(color)) throw new TypeError('COLOR_CONVERT');

  return color;
}

/**
   * Parses emoji info out of a string. The string must be one of:
   * * A UTF-8 emoji (no id)
   * * A URL-encoded UTF-8 emoji (no id)
   * * A Discord custom emoji (`<:name:id>` or `<a:name:id>`)
   * @param {string} text Emoji string to parse
   * @returns {APIEmoji} Object with `animated`, `name`, and `id` properties
   * @private
   */
module.exports.parseEmoji = (text) => {
  if (text.includes('%')) text = decodeURIComponent(text);
  if (!text.includes(':')) return { animated: false, name: text, id: null };
  const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
  return match && { animated: Boolean(match[1]), name: match[2], id: match[3] ?? null };
}

module.exports.lookForFiles = async (files) => {
  if (!files || !Array.isArray(files)) return null
  return await Promise.all(files.map(file => this.resolveFile(file)) ?? [])
}

module.exports.resolveFile = async (fileLike) => {
  let attachment;
  let name;

  const findName = thing => {
    if (typeof thing === 'string') return this.basename(thing)
    if (thing.path) return this.basename(thing.path)
    return 'file.jpg'
  }

  const ownAttachment =
    typeof fileLike === 'string' || fileLike instanceof Buffer || typeof fileLike.pipe === 'function';
  if (ownAttachment) {
    attachment = fileLike;
    name = findName(attachment);
  } else {
    attachment = fileLike.attachment;
    name = fileLike.name ?? findName(attachment);
  }

  const resource = await DataResolver.resolveFile(attachment)
  return { attachment, name, file: resource }
}