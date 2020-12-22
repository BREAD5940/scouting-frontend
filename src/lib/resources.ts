/** Resource management helpers */

import {resolve} from 'path';
import {readFilePromisified} from '.';

type CachedResource = {content: string, age: number};

const CACHE_EXPIRY_TIME = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Manages resources from the resources/ directory, such as HTML/CSS files.
 */
export class ResourceManager {
    /** filename:resource Map */
    private cache = new Map<string, CachedResource>();
    path: string;

    /** constructor */
    constructor(path: string) {
        this.path = resolve(path);
    }

    /** gets a resource */
    async get(name: string): Promise<string | null> {
        const cached = this.cache.get(name);
        if (!cached || (Date.now() - cached.age) > CACHE_EXPIRY_TIME) {
            try {
                const content = (await readFilePromisified(resolve(this.path, name))).toString();
                this.cache.set(name, {content, age: Date.now()});
                return content;
            } catch (e) {
                return null;
            }
        } else {
            return cached.content;
        }
    }

    /** flushes the cache */
    flushCache() {
        this.cache.clear();
    }
}
