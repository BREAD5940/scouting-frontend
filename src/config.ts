/**
 * Configuration for the scouting frontend
 *
 * @author Annika
 */

import {resolve} from 'path';
import {readFileSync, copyFileSync} from 'fs';

/** Contains and loads configuration information */
export class ConfigLoader {
    path: string;
    [key: string]: any;

    /** constructor */
    constructor(path: string) {
        this.path = resolve(path);
        this.load();
    }

    /** loads data from the config file */
    load() {
        let contents;
        try {
            contents = readFileSync(this.path).toString();
        } catch (err: any) {
            if (err.code !== 'ENOENT') throw err;
            console.warn(`The configuration file ${this.path} does not exist.`);
            console.warn(`Creating it by copying config-example.json...`);

            copyFileSync(this.path.replace(/[^\\/]*?\.json$/g, 'config-example.json'), this.path);
            contents = readFileSync(this.path).toString();
        }

        const data = JSON.parse(contents);
        for (const key in data) {
            if (data.hasOwnProperty(key)) this[key] = data[key];
        }
    }
}
