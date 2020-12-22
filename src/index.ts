/**
 * The main entry point for the scouting frontend.
 *
 * @author Annika
 */

import express from 'express';
import type {Request} from 'express';
import {auth, RequestContext} from 'express-openid-connect';
import {JSONBackend, SQLBackend, InfiniteRecharge, StorageBackend} from 'frc-scouting';

import {ConfigLoader} from './config';
import {AuthorityManager, AuthoritySettingAPI, AuthorityViewingAPI} from './authority';
import {accessGate} from './lib';

import {TeamAdd, TeamView} from './pages/teams';
import {MatchAdd, MatchView} from './pages/infinite-recharge-matches';
import {ResourceManager} from './lib/resources';

export type AuthenticatedRequest = Request & {oidc?: RequestContext & {user?: any & {name?: string, email?: string}}};

const CONFIG_PATH = `${__dirname}/../config.json`;
const AUTHORITY_PATH = `${__dirname}/../authority.json`;
const RESOURCES_PATH = `${__dirname}/../resources`;
const SQLITE_REGEX = /\.(db|sql(ite3?)?)$/;
declare global {
    const AuthManager: AuthorityManager;
    const Backend: StorageBackend;
    const Config: ConfigLoader;
    const Resources: ResourceManager;
}

(global as any).Config = new ConfigLoader(CONFIG_PATH);
(global as any).AuthManager = new AuthorityManager(AUTHORITY_PATH);
(global as any).Resources = new ResourceManager(RESOURCES_PATH);

const requiredConfigSettings = ['storageLocation', 'port'];

if (!Config.nosecurity) {
    // Auth0 configuration
    requiredConfigSettings.push('auth0ClientID', 'auth0ClientSecret', 'auth0Domain', 'sessionSecret');
}

for (const required of requiredConfigSettings) {
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


if (Config.nosecurity) {
    if (!process.argv.includes('--no-security')) {
        throw new Error(
            'Config.nosecurity is truthy, but the --no-security command line flag was not set.\n' +
            '(If you are testing, you probably want to run `npm start -- --no-security`, ' +
            'and if you are in production, you need to remove `"nosecurity"` from `config.json`.)',
        );
    }

    console.warn(`!!!!!!!!!!!!!!!!!!!!!!!!!! WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!`);
    console.warn(`!! You have disabled authentication features.              !!`);
    console.warn(`!! This means that ANYONE with access to your server will  !!`);
    console.warn(`!! be able to modify your data and have full permissions.  !!`);
    console.warn(`!! This is a MAJOR SECURITY RISK; you should take steps to !!`);
    console.warn(`!! ensure that your IP address is only accessible to you.  !!`);
    console.warn(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);

    // stub Auth0 pages
    server.get('/login', (req, res) => res.send('`Config.nosecurity` is enabled; you cannot log in'));
    server.get('/logout', (req, res) => res.send('`Config.nosecurity` is enabled; you cannot log out'));
    server.get('/callback', (req, res) => res.send('`Config.nosecurity` is enabled; you cannot use the callback page'));
} else {
    if (process.argv.includes('--no-security')) {
        console.warn(
            `The --no-security flag was passed, ` +
            `but authentication has been enabled anyway, because Config.nosecurity was not set.`,
        );
    }

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
}

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

// ----- Pages from other files -----
// src/authority.ts
server.get('/getauthority', accessGate('Developer'), AuthorityViewingAPI);
server.get('/setauthority', accessGate('System Administrator'), AuthoritySettingAPI);

// src/page/teams.ts
server.get('/viewteam', accessGate('Team Member'), TeamView);
server.get('/addteam', accessGate('Scouter'), TeamAdd);

// src/page/infinite-recharge-matches.ts
server.get('/viewmatch', accessGate('Team Member'), MatchView);
server.get('/addmatch', accessGate('Scouter'), MatchAdd);
// ----- End pages from other files -----

// All pages are loaded, start the server!
server.listen(Config.port, () => console.log(`Listening on ${Config.domain || 'http://localhost'}:${Config.port}`));
