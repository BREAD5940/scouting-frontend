/**
 * The main entry point for the scouting frontend.
 *
 * @author Annika
 */

import express from 'express';
import type {Request} from 'express';
import {auth, RequestContext} from 'express-openid-connect';

import {ConfigLoader} from './config';
import {JSONBackend, SQLBackend, InfiniteRecharge, StorageBackend} from 'frc-scouting';

export type AuthenticatedRequest = Request & {oidc?: RequestContext & {user?: any & {name?: string}}};

const CONFIG_PATH = `${__dirname}/../config.json`;
const SQLITE_REGEX = /\.(db|sql(ite3?)?)$/;
declare global {
    var Config: ConfigLoader;
    var Backend: StorageBackend;
}

global.Config = new ConfigLoader(CONFIG_PATH);

for (
    const required of ['storageLocation', 'port', 'auth0ClientID', 'auth0ClientSecret', 'auth0Domain', 'sessionSecret']
) {
    if (!Config[required]) {
        throw new Error(`You must specify "${required}" in the configuration file (${Config.path}).`);
    }
}

if (SQLITE_REGEX.test(Config.storageLocation)) {
    global.Backend = new SQLBackend(new InfiniteRecharge.InfiniteRechargeSQL(Config.storageLocation));
} else { // JSON time
    global.Backend = new JSONBackend(Config.storageLocation, new InfiniteRecharge.InfiniteRechargeJSON());
}

const server = express();

server.use(auth({
    secret: Config.sessionSecret,
    authRequired: false,
    auth0Logout: true,
    baseURL: `${Config.domain || 'http://localhost'}:${Config.port}`,
    clientID: Config.auth0ClientID,
    clientSecret: Config.auth0ClientSecret,
    enableTelemetry: false,
    issuerBaseURL: Config.auth0Domain,
}));

// views
// idk

server.get('/', async (req: AuthenticatedRequest, res) => {
    let html = `Hello! This is the FRC Team ${Config.teamNumber || 5940} scouting website.`;

    if (req.oidc?.isAuthenticated && req.oidc.user) {
        html += `<p>You are logged in as ${(req.oidc.user as any).name || 'an unknown user'}.</p>`;
    } else {
        html += `<p>You will need to <a href="/login">log in</a> to use this service.</p>`;
    }

    res.send(html);
});

server.listen(Config.port, () => console.log(`Listening on http://localhost:${Config.port}`));
