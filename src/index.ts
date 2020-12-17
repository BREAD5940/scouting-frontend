/**
 * The main entry point for the scouting frontend.
 *
 * @author Annika
 */

import {ConfigLoader} from './config';
import {JSONBackend, SQLBackend, InfiniteRecharge, StorageBackend} from 'frc-scouting';

const CONFIG_PATH = `${__dirname}/../config.json`;
const SQLITE_REGEX = /\.(db|sql(ite3?)?)$/;


declare global {
    var Config: ConfigLoader;
    var Backend: StorageBackend;
}

global.Config = new ConfigLoader(CONFIG_PATH);

if (!Config.storageLocation) {
    throw new Error(`You must specify a "storageLocation" in the configuration file (${CONFIG_PATH}).`);
}

if (SQLITE_REGEX.test(Config.storageLocation)) {
    global.Backend = new SQLBackend(new InfiniteRecharge.InfiniteRechargeSQL(Config.storageLocation));
} else { // JSON time
    global.Backend = new JSONBackend(Config.storageLocation, new InfiniteRecharge.InfiniteRechargeJSON());
}
