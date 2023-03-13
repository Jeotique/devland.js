export interface StoreConstructor {
    new (): Store<unknown, unknown>;
    new <K, V>(entries?: ReadonlyArray<readonly [K, V]> | null): Store<K, V>;
    new <K, V>(iterable: Iterable<readonly [K, V]>): Store<K, V>;
    readonly prototype: Store<unknown, unknown>;
    readonly [Symbol.species]: StoreConstructor;
}
/**
 * A Map with additional utility methods. This is used throughout discord.js rather than Arrays for anything that has
 * an ID, for significantly improved performance and ease-of-use.
 * @extends {Map}
 * @property {number} size - The amount of elements in this Store.
 */
export declare class Store<K, V> extends Map<K, V> {
    static readonly default: typeof Store;
    ['constructor']: StoreConstructor;
    /**
     * Identical to [Map.get()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get).
     * Gets an element with the specified key, and returns its value, or `undefined` if the element does not exist.
     * @param {*} key - The key to get from this Store
     * @returns {* | undefined}
     */
    get(key: K): V | undefined;
    /**
     * Identical to [Map.set()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set).
     * Sets a new element in the Store with the specified key and value.
     * @param {*} key - The key of the element to add
     * @param {*} value - The value of the element to add
     * @returns {Store}
     */
    set(key: K, value: V): this;
    /**
     * Identical to [Map.has()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has).
     * Checks if an element exists in the Store.
     * @param {*} key - The key of the element to check for
     * @returns {boolean} `true` if the element exists, `false` if it does not exist.
     */
    has(key: K): boolean;
    /**
     * Identical to [Map.delete()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete).
     * Deletes an element from the Store.
     * @param {*} key - The key to delete from the Store
     * @returns {boolean} `true` if the element was removed, `false` if the element does not exist.
     */
    delete(key: K): boolean;
    /**
     * Identical to [Map.clear()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear).
     * Removes all elements from the Store.
     * @returns {undefined}
     */
    clear(): void;
    /**
     * Checks if all of the elements exist in the Store.
     * @param {...*} keys - The keys of the elements to check for
     * @returns {boolean} `true` if all of the elements exist, `false` if at least one does not exist.
     */
    hasAll(...keys: K[]): boolean;
    /**
     * Checks if any of the elements exist in the Store.
     * @param {...*} keys - The keys of the elements to check for
     * @returns {boolean} `true` if any of the elements exist, `false` if none exist.
     */
    hasAny(...keys: K[]): boolean;
    /**
     * Obtains the first value(s) in this Store.
     * @param {number} [amount] Amount of values to obtain from the beginning
     * @returns {*|Array<*>} A single value if no amount is provided or an array of values, starting from the end if
     * amount is negative
     */
    first(): V | undefined;
    first(amount: number): V[];
    /**
     * Obtains the first key(s) in this Store.
     * @param {number} [amount] Amount of keys to obtain from the beginning
     * @returns {*|Array<*>} A single key if no amount is provided or an array of keys, starting from the end if
     * amount is negative
     */
    firstKey(): K | undefined;
    firstKey(amount: number): K[];
    /**
     * Obtains the last value(s) in this Store.
     * @param {number} [amount] Amount of values to obtain from the end
     * @returns {*|Array<*>} A single value if no amount is provided or an array of values, starting from the start if
     * amount is negative
     */
    last(): V | undefined;
    last(amount: number): V[];
    /**
     * Obtains the last key(s) in this Store.
     * @param {number} [amount] Amount of keys to obtain from the end
     * @returns {*|Array<*>} A single key if no amount is provided or an array of keys, starting from the start if
     * amount is negative
     */
    lastKey(): K | undefined;
    lastKey(amount: number): K[];
    /**
     * Obtains unique random value(s) from this Store.
     * @param {number} [amount] Amount of values to obtain randomly
     * @returns {*|Array<*>} A single value if no amount is provided or an array of values
     */
    random(): V;
    random(amount: number): V[];
    /**
     * Obtains unique random key(s) from this Store.
     * @param {number} [amount] Amount of keys to obtain randomly
     * @returns {*|Array<*>} A single key if no amount is provided or an array
     */
    randomKey(): K;
    randomKey(amount: number): K[];
    /**
     * Searches for a single item where the given function returns a truthy value. This behaves like
     * [Array.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find).
     * <warn>All Stores used in Discord.js are mapped using their `id` property, and if you want to find by id you
     * should use the `get` method. See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get) for details.</warn>
     * @param {Function} fn The function to test with (should return boolean)
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {*}
     * @example Store.find(user => user.username === 'Bob');
     */
    find<V2 extends V>(fn: (value: V, key: K, Store: this) => value is V2): V2 | undefined;
    find(fn: (value: V, key: K, Store: this) => boolean): V | undefined;
    find<This, V2 extends V>(fn: (this: This, value: V, key: K, Store: this) => value is V2, thisArg: This): V2 | undefined;
    find<This>(fn: (this: This, value: V, key: K, Store: this) => boolean, thisArg: This): V | undefined;
    /**
     * Searches for the key of a single item where the given function returns a truthy value. This behaves like
     * [Array.findIndex()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex),
     * but returns the key rather than the positional index.
     * @param {Function} fn The function to test with (should return boolean)
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {*}
     * @example Store.findKey(user => user.username === 'Bob');
     */
    findKey<K2 extends K>(fn: (value: V, key: K, Store: this) => key is K2): K2 | undefined;
    findKey(fn: (value: V, key: K, Store: this) => boolean): K | undefined;
    findKey<This, K2 extends K>(fn: (this: This, value: V, key: K, Store: this) => key is K2, thisArg: This): K2 | undefined;
    findKey<This>(fn: (this: This, value: V, key: K, Store: this) => boolean, thisArg: This): K | undefined;
    /**
     * Removes items that satisfy the provided filter function.
     * @param {Function} fn Function used to test (should return a boolean)
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {number} The number of removed entries
     */
    sweep(fn: (value: V, key: K, Store: this) => boolean): number;
    sweep<T>(fn: (this: T, value: V, key: K, Store: this) => boolean, thisArg: T): number;
    /**
     * Identical to
     * [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
     * but returns a Store instead of an Array.
     * @param {Function} fn The function to test with (should return boolean)
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {Store}
     * @example Store.filter(user => user.username === 'Bob');
     */
    filter<K2 extends K>(fn: (value: V, key: K, Store: this) => key is K2): Store<K2, V>;
    filter<V2 extends V>(fn: (value: V, key: K, Store: this) => value is V2): Store<K, V2>;
    filter(fn: (value: V, key: K, Store: this) => boolean): Store<K, V>;
    filter<This, K2 extends K>(fn: (this: This, value: V, key: K, Store: this) => key is K2, thisArg: This): Store<K2, V>;
    filter<This, V2 extends V>(fn: (this: This, value: V, key: K, Store: this) => value is V2, thisArg: This): Store<K, V2>;
    filter<This>(fn: (this: This, value: V, key: K, Store: this) => boolean, thisArg: This): Store<K, V>;
    /**
     * Partitions the Store into two Stores where the first Store
     * contains the items that passed and the second contains the items that failed.
     * @param {Function} fn Function used to test (should return a boolean)
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {Store[]}
     * @example const [big, small] = Store.partition(guild => guild.memberCount > 250);
     */
    partition<K2 extends K>(fn: (value: V, key: K, Store: this) => key is K2): [Store<K2, V>, Store<Exclude<K, K2>, V>];
    partition<V2 extends V>(fn: (value: V, key: K, Store: this) => value is V2): [Store<K, V2>, Store<K, Exclude<V, V2>>];
    partition(fn: (value: V, key: K, Store: this) => boolean): [Store<K, V>, Store<K, V>];
    partition<This, K2 extends K>(fn: (this: This, value: V, key: K, Store: this) => key is K2, thisArg: This): [Store<K2, V>, Store<Exclude<K, K2>, V>];
    partition<This, V2 extends V>(fn: (this: This, value: V, key: K, Store: this) => value is V2, thisArg: This): [Store<K, V2>, Store<K, Exclude<V, V2>>];
    partition<This>(fn: (this: This, value: V, key: K, Store: this) => boolean, thisArg: This): [Store<K, V>, Store<K, V>];
    /**
     * Maps each item into a Store, then joins the results into a single Store. Identical in behavior to
     * [Array.flatMap()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap).
     * @param {Function} fn Function that produces a new oneforall.Store()
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {Store}
     * @example Store.flatMap(guild => guild.members.cache);
     */
    flatMap<T>(fn: (value: V, key: K, Store: this) => Store<K, T>): Store<K, T>;
    flatMap<T, This>(fn: (this: This, value: V, key: K, Store: this) => Store<K, T>, thisArg: This): Store<K, T>;
    /**
     * Maps each item to another value into an array. Identical in behavior to
     * [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
     * @param {Function} fn Function that produces an element of the new array, taking three arguments
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {Array}
     * @example Store.map(user => user.tag);
     */
    map<T>(fn: (value: V, key: K, Store: this) => T): T[];
    map<This, T>(fn: (this: This, value: V, key: K, Store: this) => T, thisArg: This): T[];
    /**
     * Maps each item to another value into a Store. Identical in behavior to
     * [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
     * @param {Function} fn Function that produces an element of the new oneforall.Store(), taking three arguments
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {Store}
     * @example Store.mapValues(user => user.tag);
     */
    mapValues<T>(fn: (value: V, key: K, Store: this) => T): Store<K, T>;
    mapValues<This, T>(fn: (this: This, value: V, key: K, Store: this) => T, thisArg: This): Store<K, T>;
    /**
     * Checks if there exists an item that passes a test. Identical in behavior to
     * [Array.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some).
     * @param {Function} fn Function used to test (should return a boolean)
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {boolean}
     * @example Store.some(user => user.discriminator === '0000');
     */
    some(fn: (value: V, key: K, Store: this) => boolean): boolean;
    some<T>(fn: (this: T, value: V, key: K, Store: this) => boolean, thisArg: T): boolean;
    /**
     * Checks if all items passes a test. Identical in behavior to
     * [Array.every()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every).
     * @param {Function} fn Function used to test (should return a boolean)
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {boolean}
     * @example Store.every(user => !user.bot);
     */
    every<K2 extends K>(fn: (value: V, key: K, Store: this) => key is K2): this is Store<K2, V>;
    every<V2 extends V>(fn: (value: V, key: K, Store: this) => value is V2): this is Store<K, V2>;
    every(fn: (value: V, key: K, Store: this) => boolean): boolean;
    every<This, K2 extends K>(fn: (this: This, value: V, key: K, Store: this) => key is K2, thisArg: This): this is Store<K2, V>;
    every<This, V2 extends V>(fn: (this: This, value: V, key: K, Store: this) => value is V2, thisArg: This): this is Store<K, V2>;
    every<This>(fn: (this: This, value: V, key: K, Store: this) => boolean, thisArg: This): boolean;
    /**
     * Applies a function to produce a single value. Identical in behavior to
     * [Array.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).
     * @param {Function} fn Function used to reduce, taking four arguments; `accumulator`, `currentValue`, `currentKey`,
     * and `Store`
     * @param {*} [initialValue] Starting value for the accumulator
     * @returns {*}
     * @example Store.reduce((acc, guild) => acc + guild.memberCount, 0);
     */
    reduce<T>(fn: (accumulator: T, value: V, key: K, Store: this) => T, initialValue?: T): T;
    /**
     * Identical to
     * [Map.forEach()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach),
     * but returns the Store instead of undefined.
     * @param {Function} fn Function to execute for each element
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {Store}
     * @example
     * Store
     *  .each(user => console.log(user.username))
     *  .filter(user => user.bot)
     *  .each(user => console.log(user.username));
     */
    each(fn: (value: V, key: K, Store: this) => void): this;
    each<T>(fn: (this: T, value: V, key: K, Store: this) => void, thisArg: T): this;
    /**
     * Runs a function on the Store and returns the Store.
     * @param {Function} fn Function to execute
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {Store}
     * @example
     * Store
     *  .tap(coll => console.log(coll.size))
     *  .filter(user => user.bot)
     *  .tap(coll => console.log(coll.size))
     */
    tap(fn: (Store: this) => void): this;
    tap<T>(fn: (this: T, Store: this) => void, thisArg: T): this;
    /**
     * Creates an identical shallow copy of this Store.
     * @returns {Store}
     * @example const newColl = someColl.clone();
     */
    clone(): Store<K, V>;
    /**
     * Combines this Store with others into a new oneforall.Store(). None of the source Stores are modified.
     * @param {...Store} Stores Stores to merge
     * @returns {Store}
     * @example const newColl = someColl.concat(someOtherColl, anotherColl, ohBoyAColl);
     */
    concat(...Stores: Store<K, V>[]): Store<K, V>;
    /**
     * Checks if this Store shares identical items with another.
     * This is different to checking for equality using equal-signs, because
     * the Stores may be different objects, but contain the same data.
     * @param {Store} Store Store to compare with
     * @returns {boolean} Whether the Stores have identical contents
     */
    equals(Store: Store<K, V>): boolean;
    /**
     * The sort method sorts the items of a Store in place and returns it.
     * The sort is not necessarily stable in Node 10 or older.
     * The default sort order is according to string Unicode code points.
     * @param {Function} [compareFunction] Specifies a function that defines the sort order.
     * If omitted, the Store is sorted according to each character's Unicode code point value,
     * according to the string conversion of each element.
     * @returns {Store}
     * @example Store.sort((userA, userB) => userA.createdTimestamp - userB.createdTimestamp);
     */
    sort(compareFunction?: Comparator<K, V>): this;
    /**
     * The intersect method returns a new structure containing items where the keys are present in both original structures.
     * @param {Store} other The other Store to filter against
     * @returns {Store}
     */
    intersect(other: Store<K, V>): Store<K, V>;
    /**
     * The difference method returns a new structure containing items where the key is present in one of the original structures but not the other.
     * @param {Store} other The other Store to filter against
     * @returns {Store}
     */
    difference(other: Store<K, V>): Store<K, V>;
    /**
     * The sorted method sorts the items of a Store and returns it.
     * The sort is not necessarily stable in Node 10 or older.
     * The default sort order is according to string Unicode code points.
     * @param {Function} [compareFunction] Specifies a function that defines the sort order.
     * If omitted, the Store is sorted according to each character's Unicode code point value,
     * according to the string conversion of each element.
     * @returns {Store}
     * @example Store.sorted((userA, userB) => userA.createdTimestamp - userB.createdTimestamp);
     */
    sorted(compareFunction?: Comparator<K, V>): Store<K, V>;
    toJSON(): V[];
    private static defaultSort;
}
export declare type Comparator<K, V> = (firstValue: V, secondValue: V, firstKey: K, secondKey: K) => number;
export default Store;