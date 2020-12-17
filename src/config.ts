/**
 * Configuration for the scouting frontend
 *
 * @author Annika
 */

import {readFileSync} from 'fs';

/** Contains and loads configuration information */
export class ConfigLoader {
    path: string;
    [k: string]: any;

    /** constructor */
    constructor(path: string) {
        this.path = path;
        this.load();
    }

    /** loads data from the config file */
    load() {
        const data = JSON.parse(readFileSync(this.path).toString());
        for (const key in data) {
            if (data.hasOwnProperty(key)) this[key] = data[key];
        }
    }
}
