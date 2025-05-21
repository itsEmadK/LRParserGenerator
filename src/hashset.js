/**
 * A custom hash-based set implementation.
 * Items of the set must implement a `hash()` method that returns a string.
 *
 * @template T
 */
export default class HashSet {
    /**
     * @type {Map<string,{index:number,item:T}>}
     */
    #map = new Map();

    /**
     * @type {number}
     */
    #index = 0;

    /**
     * @type {(T)=>string}
     */
    #hashFn;

    /**
     *
     * @param {T[]} items
     * @param {(T)=>string} hashFn
     */
    constructor(items, hashFn) {
        if (hashFn) {
            this.#hashFn = hashFn;
        }
        if (items) {
            items.forEach((item) => {
                this.#map.set(this.#hashFn ? this.#hashFn(item) : item.hash(), {
                    index: this.#index++,
                    item,
                });
            });
        }
    }

    /**
     *
     * @param {T} item
     * @returns {boolean}
     */
    has(item) {
        return this.#map.has(this.#hashFn ? this.#hashFn(item) : item.hash());
    }

    /**
     *
     * @param {T} item
     */
    add(item) {
        if (!this.has(item)) {
            this.#map.set(this.#hashFn ? this.#hashFn(item) : item.hash(), {
                index: this.#index++,
                item,
            });
        }
    }

    clear() {
        this.#map.clear();
    }

    /**
     *
     * @param {T} item
     */
    delete(item) {
        this.#map.delete(this.#hashFn ? this.#hashFn(item) : item.hash());
    }

    /**
     *
     * @returns {T[]} values
     */
    values() {
        const valuesSorted = [...this.#map.values()]
            .sort((a, b) => (a.index < b.index ? -1 : 1))
            .map(({ _, item }) => item);
        return valuesSorted;
    }

    /**
     *
     * @param {(item:T,index:number)=>void} callbackFn
     */
    forEach(callbackFn) {
        this.values().forEach((value, index) => callbackFn(value, index));
    }

    get size() {
        return this.#map.size;
    }
}
