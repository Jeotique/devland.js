const BitField = require('./BitField');

/**
 * Data structure that makes it easy to interact with a flag bitfield. All {@link GuildMember}s have a set of
 * UserFlags in their guild, and each channel in the guild may also have {@link flagOverwrites} for the member
 * that override their default UserFlags.
 * @extends {BitField}
 */
class UserFlags extends BitField {
    /**
     * Bitfield of the packed bits
     * @type {bigint}
     * @name UserFlags#bitfield
     */

    /**
     * Data that can be resolved to give a flag number. This can be:
     * * A string (see {@link UserFlags.FLAGS})
     * * A flag number
     * * An instance of UserFlags
     * * An Array of UserFlagsResolvable
     * @typedef {string|bigint|UserFlags|UserFlagsResolvable[]} UserFlagsResolvable
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
     * Checks whether the bitfield has a flag, or any of multiple UserFlags.
     * @param {UserFlagsResolvable} flag flag(s) to check for
     * @returns {boolean}
     */
    any(flag) {
        return super.any(flag);
    }

    /**
     * Checks whether the bitfield has a flag, or multiple UserFlags.
     * @param {UserFlagsResolvable} flag flag(s) to check for
     * @returns {boolean}
     */
    has(flag) {
        return super.has(flag);
    }

    /**
     * Gets an {@link Array} of bitfield names based on the UserFlags available.
     * @returns {string[]}
     */
    toArray() {
        return super.toArray(false);
    }
}
UserFlags.FLAGS = {
    STAFF: 1n << 0n,
    PARTNER: 1n << 1n,
    HYPESQUAD: 1n << 2n,
    BUG_HUNTER_LEVEL_1: 1n << 3n,
    HYPESQUAD_BRAVEY: 1n << 6n,
    HYPESQUAD_BRILLANCE: 1n << 7n,
    HYPESQUAD_BALANCE: 1n << 8n,
    EARLY_SUPPORTER: 1n << 9n,
    TEAM_PSEUDO_USER: 1n << 10n,
    BUG_HUNTER_LEVEL_2: 1n << 14n,
    VERIFIED_BOT: 1n << 16n,
    VERIFIED_DEVELOPER: 1n << 17n,
    CERTIFIED_MODERATOR: 1n << 18n,
    BOT_HTTP_INTERACTIONS: 1n << 19n,
    ACTIVE_DEVELOPER: 1n << 22n,
};

/**
 * Bitfield representing every flag combined
 * @type {bigint}
 */
UserFlags.ALL = Object.values(UserFlags.FLAGS).reduce((all, p) => all | p, 0n);

/**
 * Bitfield representing the default UserFlags for users
 * @type {bigint}
 */
UserFlags.defaultBit = BigInt(0);

module.exports = UserFlags;