/**
 * A custom hash-based set implementation.
 * Items of the set must implement a `hash()` method that returns a string.
 *
 * @template T
 */
export default class HashSet {
    /**
     * @type {Map<string,Set<T>>}
     */
    #map = new Map();

    /**
     *
     * @param {T[]} items
     */
    constructor(items) {
        if (items) {
            items.forEach((item) => {
                this.#map.set(item.hash(), item);
            });
        }
    }

    /**
     *
     * @param {T} item
     * @returns {boolean}
     */
    has(item) {
        return !!this.#map.get(item.hash());
    }

    /**
     *
     * @param {T} item
     */
    add(item) {
        if (!this.has(item)) {
            this.#map.set(item.hash(), item);
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
        this.#map.delete(item.hash());
    }

    /**
     *
     * @returns {T[]} values
     */
    values() {
        const valuesSorted = [...this.#map.values()].sort((a, b) =>
            a.hash() < b.hash() ? -1 : 1,
        );
        return valuesSorted;
    }

    /**
     *
     * @param {(item:T)=>void} callbackFn
     */
    forEach(callbackFn) {
        this.values().forEach((value) => callbackFn(value));
    }

    get size() {
        return this.#map.size;
    }
}
