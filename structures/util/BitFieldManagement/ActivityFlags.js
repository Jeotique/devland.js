const BitField = require('./BitField');

/**
 * Data structure that makes it easy to interact with a flag bitfield. All {@link GuildMember}s have a set of
 * ActivityFlags in their guild, and each channel in the guild may also have {@link flagOverwrites} for the member
 * that override their default ActivityFlags.
 * @extends {BitField}
 */
class ActivityFlags extends BitField {
  /**
   * Bitfield of the packed bits
   * @type {bigint}
   * @name ActivityFlags#bitfield
   */

  /**
   * Data that can be resolved to give a flag number. This can be:
   * * A string (see {@link ActivityFlags.FLAGS})
   * * A flag number
   * * An instance of ActivityFlags
   * * An Array of ActivityFlagsResolvable
   * @typedef {string|bigint|ActivityFlags|ActivityFlagsResolvable[]} ActivityFlagsResolvable
   */

  /**
   * Gets all given bits that are missing from the bitfield.
   * @param {BitFieldResolvable} bits Bit(s) to check for
   * @returns {string[]}
   */
  missing(bits) {
    return super.missing(bits);
  }

  /**
   * Checks whether the bitfield has a flag, or any of multiple ActivityFlags.
   * @param {ActivityFlagsResolvable} flag flag(s) to check for
   * @returns {boolean}
   */
  any(flag) {
    return super.any(flag);
  }

  /**
   * Checks whether the bitfield has a flag, or multiple ActivityFlags.
   * @param {ActivityFlagsResolvable} flag flag(s) to check for
   * @returns {boolean}
   */
  has(flag) {
    return super.has(flag);
  }

  /**
   * Gets an {@link Array} of bitfield names based on the ActivityFlags available.
   * @returns {string[]}
   */
  toArray() {
    return super.toArray(false);
  }
}
ActivityFlags.FLAGS = {
  INSTANCE: 1n << 0n,
  JOIN: 1n << 1n,
  SPECTATE: 1n << 2n,
  JOIN_REQUEST: 1n << 3n,
  SYNC: 1n << 4n,
  PLAY: 1n << 5n,
  PARTY_PRIVACY_FRIENDS: 1n << 6n,
  PARTY_PRIVACY_VOICE_CHANNEL: 1n << 7n,
  EMBEDDED: 1n << 8n
};

/**
 * Bitfield representing every flag combined
 * @type {bigint}
 */
ActivityFlags.ALL = Object.values(ActivityFlags.FLAGS).reduce((all, p) => all | p, 0n);

/**
 * Bitfield representing the default ActivityFlags for users
 * @type {bigint}
 */
ActivityFlags.defaultBit = BigInt(0);

module.exports = ActivityFlags;