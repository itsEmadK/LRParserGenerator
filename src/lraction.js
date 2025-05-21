import HashSet from './hashset';
import LRItem from './lritem';

export default class LRAction {
    /**
     * @type {string}
     */
    #type;

    /**
     * @type {HashSet<LRItem>}
     */
    #originatingItems;

    /**
     *
     * @param {string} type
     * @param {LRItem[]} originatingItems
     */
    constructor(type, originatingItems) {
        this.#type = type;
        this.#originatingItems = new HashSet([...originatingItems]);
    }

    get type() {
        return this.#type;
    }

    /**
     * @returns {HashSet<LRAction>}
     */
    get originatingItems() {
        return new HashSet([...this.#originatingItems.values()]);
    }

    /**
     * @type {Set<string>}
     */
    get inputs() {
        const symbols = new Set();
        this.#originatingItems.forEach((item) => {
            symbols.add(item.getNextSymbol());
        });
        return symbols;
    }

    /**
     * @returns {string}
     */
    hash() {
        let hash = this.#type.charCodeAt(0);
        this.#originatingItems.forEach((item) => {
            hash += item.hash();
        });
        return hash;
    }

    /**
     *
     * @returns {LRAction}
     */
    clone() {
        return new LRAction(this.#type, [...this.#originatingItems.values()]);
    }

    toString() {
        let output = `Type: ${this.#type}, Inputs:{${[...this.inputs.values()]}}\n`;
        output += `Originating Items: ${[...this.#originatingItems.values()]}\n`;
        return output;
    }

    /**
     *
     * @param {LRItem} item
     */
    addOriginatingItem(item) {
        this.#originatingItems.add(item);
    }
}
