const BitField = require('./BitField');

/**
 * Data structure that makes it easy to interact with a flag bitfield. All {@link GuildMember}s have a set of
 * MessageFlags in their guild, and each channel in the guild may also have {@link flagOverwrites} for the member
 * that override their default MessageFlags.
 * @extends {BitField}
 */
class MessageFlags extends BitField {
    /**
     * Bitfield of the packed bits
     * @type {bigint}
     * @name MessageFlags#bitfield
     */

    /**
     * Data that can be resolved to give a flag number. This can be:
     * * A string (see {@link MessageFlags.FLAGS})
     * * A flag number
     * * An instance of MessageFlags
     * * An Array of MessageFlagsResolvable
     * @typedef {string|bigint|MessageFlags|MessageFlagsResolvable[]} MessageFlagsResolvable
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
     * Checks whether the bitfield has a flag, or any of multiple MessageFlags.
     * @param {MessageFlagsResolvable} flag flag(s) to check for
     * @returns {boolean}
     */
    any(flag) {
        return super.any(flag);
    }

    /**
     * Checks whether the bitfield has a flag, or multiple MessageFlags.
     * @param {MessageFlagsResolvable} flag flag(s) to check for
     * @returns {boolean}
     */
    has(flag) {
        return super.has(flag);
    }

    /**
     * Gets an {@link Array} of bitfield names based on the MessageFlags available.
     * @returns {string[]}
     */
    toArray() {
        return super.toArray(false);
    }
}
MessageFlags.FLAGS = {
    CROSSPOSTED: 1n << 0n,
    IS_CROSSPOST: 1n << 1n,
    SUPPRESS_EMBEDS: 1n << 2n,
    SOURCE_MESSAGE_DELETED: 1n << 3n,
    URGENT: 1n << 4n,
    HAS_THREAD: 1n << 5n,
    EPHEMERAL: 1n << 6n,
    LOADING: 1n << 7n,
    FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: 1n << 8n,
    SUPPRESS_NOTIFICATIONS: 1n << 12n
};

/**
 * Bitfield representing every flag combined
 * @type {bigint}
 */
MessageFlags.ALL = Object.values(MessageFlags.FLAGS).reduce((all, p) => all | p, 0n);

/**
 * Bitfield representing the default MessageFlags for users
 * @type {bigint}
 */
MessageFlags.defaultBit = BigInt(0);

module.exports = MessageFlags;