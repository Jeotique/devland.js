const BitField = require('./BitField');

/**
 * Data structure that makes it easy to interact with a flag bitfield. All {@link GuildMember}s have a set of
 * MemberFlags in their guild, and each channel in the guild may also have {@link flagOverwrites} for the member
 * that override their default MemberFlags.
 * @extends {BitField}
 */
class MemberFlags extends BitField {
    /**
     * Bitfield of the packed bits
     * @type {bigint}
     * @name MemberFlags#bitfield
     */

    /**
     * Data that can be resolved to give a flag number. This can be:
     * * A string (see {@link MemberFlags.FLAGS})
     * * A flag number
     * * An instance of MemberFlags
     * * An Array of MemberFlagsResolvable
     * @typedef {string|bigint|MemberFlags|MemberFlagsResolvable[]} MemberFlagsResolvable
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
     * Checks whether the bitfield has a flag, or any of multiple MemberFlags.
     * @param {MemberFlagsResolvable} flag flag(s) to check for
     * @returns {boolean}
     */
    any(flag) {
        return super.any(flag);
    }

    /**
     * Checks whether the bitfield has a flag, or multiple MemberFlags.
     * @param {MemberFlagsResolvable} flag flag(s) to check for
     * @returns {boolean}
     */
    has(flag) {
        return super.has(flag);
    }

    /**
     * Gets an {@link Array} of bitfield names based on the MemberFlags available.
     * @returns {string[]}
     */
    toArray() {
        return super.toArray(false);
    }
}
MemberFlags.FLAGS = {
    DID_REJOIN: 1n << 0n,
    COMPLETED_ONBOARDING: 1n << 1n,
    BYPASSES_VERIFICATION: 1n << 2n,
    STARTED_ONBOARDING: 1n << 3n
};

/**
 * Bitfield representing every flag combined
 * @type {bigint}
 */
MemberFlags.ALL = Object.values(MemberFlags.FLAGS).reduce((all, p) => all | p, 0n);

/**
 * Bitfield representing the default MemberFlags for users
 * @type {bigint}
 */
MemberFlags.defaultBit = BigInt(0);

module.exports = MemberFlags;