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
import {accessGate, AuthorityManager, AuthoritySettingAPI, AuthorityViewingAPI} from './authority';

import {TeamView} from './pages/teams';

export type AuthenticatedRequest = Request & {oidc?: RequestContext & {user?: any & {name?: string, email?: string}}};

const CONFIG_PATH = `${__dirname}/../config.json`;
const AUTHORITY_PATH = `${__dirname}/../authority.json`;
const SQLITE_REGEX = /\.(db|sql(ite3?)?)$/;
declare global {
    const Config: ConfigLoader;
    const Backend: StorageBackend;
    const AuthManager: AuthorityManager;
}

(global as any).Config = new ConfigLoader(CONFIG_PATH);
(global as any).AuthManager = new AuthorityManager(AUTHORITY_PATH);

for (
    const required of ['storageLocation', 'port', 'auth0ClientID', 'auth0ClientSecret', 'auth0Domain', 'sessionSecret']
) {
    if (!Config[required]) {
        throw new Error(`You must specify "${required}" in the configuration file (${Config.path}).`);
    }
}

if (SQLITE_REGEX.test(Config.storageLocation)) {
    (global as any).Backend = new SQLBackend(new InfiniteRecharge.InfiniteRechargeSQL(Config.storageLocation));
} else { // JSON time
    (global as any).Backend = new JSONBackend(Config.storageLocation, new InfiniteRecharge.InfiniteRechargeJSON());
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

server.get('/', async (req: AuthenticatedRequest, res) => {
    let html = `Hello! This is the FRC Team ${Config.teamNumber || 5940} scouting website.`;

    if (req.oidc?.isAuthenticated && req.oidc.user) {
        html += `<p>You are logged in as ${(req.oidc.user as any).name || 'an unknown user'}. `;
        html += `<a href="/logout">Log out</a></p>`;
    } else {
        html += `<p>You will need to <a href="/login">log in</a> to use this service.</p>`;
    }

    res.send(html);
});

server.get('/getauthority', accessGate('Developer'), AuthorityViewingAPI);
server.get('/setauthority', accessGate('System Administrator'), AuthoritySettingAPI);

server.get('/viewteam', accessGate('Team Member'), TeamView);

server.listen(Config.port, () => console.log(`Listening on http://localhost:${Config.port}`));
