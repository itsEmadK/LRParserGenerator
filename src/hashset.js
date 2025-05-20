/**
 * items of the set must be hashable(must have a hash() method)
 */
export default class HashSet {
    #map = new Map();
    /**
     *
     * @param {*[]} items
     */

    constructor(items) {
        items.forEach((item) => {
            this.#map.set(item.hash(), item);
        });
    }

    /**
     *
     * @param {*} item
     * @returns {boolean}
     */
    has(item) {
        return !!this.#map.get(item.hash());
    }

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
     * @param {*} item
     */
    delete(item) {
        this.#map.delete(item.hash());
    }

    /**
     *
     * @returns *[]
     */
    values() {
        const valuesSorted = [...this.#map.values()].sort((a, b) =>
            a.hash() < b.hash() ? -1 : 1,
        );
        return valuesSorted;
    }

    /**
     *
     * @param {(*)=>void} callbackFn
     */
    forEach(callbackFn) {
        this.values().forEach((value) => callbackFn(value));
    }
}
