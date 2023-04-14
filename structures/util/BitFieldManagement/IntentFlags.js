const BitField = require('./BitField');

/**
 * Data structure that makes it easy to interact with a flag bitfield. All {@link GuildMember}s have a set of
 * IntentFlags in their guild, and each channel in the guild may also have {@link flagOverwrites} for the member
 * that override their default IntentFlags.
 * @extends {BitField}
 */
class IntentFlags extends BitField {
    /**
     * Bitfield of the packed bits
     * @type {bigint}
     * @name IntentFlags#bitfield
     */

    /**
     * Data that can be resolved to give a flag number. This can be:
     * * A string (see {@link IntentFlags.FLAGS})
     * * A flag number
     * * An instance of IntentFlags
     * * An Array of IntentFlagsResolvable
     * @typedef {string|bigint|IntentFlags|IntentFlagsResolvable[]} IntentFlagsResolvable
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
     * Checks whether the bitfield has a flag, or any of multiple IntentFlags.
     * @param {IntentFlagsResolvable} flag flag(s) to check for
     * @returns {boolean}
     */
    any(flag) {
        return super.any(flag);
    }

    /**
     * Checks whether the bitfield has a flag, or multiple IntentFlags.
     * @param {IntentFlagsResolvable} flag flag(s) to check for
     * @returns {boolean}
     */
    has(flag) {
        return super.has(flag);
    }

    /**
     * Gets an {@link Array} of bitfield names based on the IntentFlags available.
     * @returns {string[]}
     */
    toArray() {
        return super.toArray(false);
    }
}
IntentFlags.FLAGS = {
    GUILDS: 1n << 0n,
    GUILD_MEMBERS: 1n << 1n,
    GUILD_MODERATION: 1n << 2n,
    GUILD_EMOJIS_AND_STICKERS: 1n << 3n,
    GUILD_INTEGRATIONS: 1n << 4n,
    GUILD_WEBHOOKS: 1n << 5n,
    GUILD_INVITES: 1n << 6n,
    GUILD_VOICE_STATES: 1n << 7n,
    GUILD_PRESENCES: 1n << 8n,
    GUILD_MESSAGES: 1n << 9n,
    GUILD_MESSAGE_REACTIONS: 1n << 10n,
    GUILD_MESSAGE_TYPING: 1n << 11n,
    DIRECT_MESSAGES: 1n << 12n,
    DIRECT_MESSAGE_REACTIONS: 1n << 13n,
    DIRECT_MESSAGE_TYPING: 1n << 14n,
    MESSAGE_CONTENT: 1n << 15n,
    GUILD_SCHEDULED_EVENTS: 1n << 16n,
    AUTO_MODERATION_CONFIGURATION: 1n << 20n,
    AUTO_MODERATION_EXECUTION: 1n << 21n,
};

/**
 * Bitfield representing every flag combined
 * @type {bigint}
 */
IntentFlags.ALL = Object.values(IntentFlags.FLAGS).reduce((all, p) => all | p, 0n);

/**
 * Bitfield representing the default IntentFlags for users
 * @type {bigint}
 */
IntentFlags.defaultBit = BigInt(0);

module.exports = IntentFlags;