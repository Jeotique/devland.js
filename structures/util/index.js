const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isObject = d => typeof d === 'object' && d !== null;
module.exports.mergeDefault = (def, given) => {
  if (!given) return def;
  for (const key in def) {
    if (!has(given, key) || given[key] === undefined) {
      given[key] = def[key];
    } else if (given[key] === Object(given[key])) {
      given[key] = Util.mergeDefault(def[key], given[key]);
    }
  }
  return given;
}

module.exports.createDefaultOptions = () => {
  return {
    connect: false,
    presence: {
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
    token: null,
  }
}

const EPOCH = 1_420_070_400_000;
let INCREMENT = BigInt(0);
module.exports.getTimestampFrom = (snowflake) => {
  return Number(BigInt(snowflake) >> 22n) + EPOCH
}

const clean = (text) => {
  if (typeof(text) == 'string') return text.replace(/[`@]/g, '$&\u200b');
  else return text;
};

module.exports.cleanMessage = async (content) => {
  const cleaned = clean(content);
  return cleaned;
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