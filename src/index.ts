/**
 * The main entry point for the scouting frontend.
 *
 * @author Annika
 */

import {ConfigLoader} from './config';

const CONFIG_PATH = `${__dirname}/../config.json`;

declare global {
    var Config: ConfigLoader;
}

global.Config = new ConfigLoader(CONFIG_PATH);
