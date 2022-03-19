/**
 * The main entry point for the scouting frontend.
 *
 * @author Annika
 */

import express from 'express';
import type {Request} from 'express';
import {auth, RequestContext} from 'express-openid-connect';
import {existsSync} from 'fs';
import {sep as pathSeparator, join as joinPath} from 'path';
import {SQLBackend, RapidReact, StorageBackend} from 'frc-scouting';
import {google} from 'googleapis';

import {ConfigLoader} from './config';
import {AuthorityManager, AuthoritySettingAPI, AuthorityViewingAPI} from './authority';
import {accessGate, mkdirPromisified} from './lib';

import {TeamView} from './pages/teams';
import {MatchAdd, MatchView} from './pages/rapid-react-matches';
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

const authorization = new google.auth.GoogleAuth({
    keyFile: __dirname + '/key.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const googleSheets = google.sheets({
    version: 'v4',
    auth: authorization,
});

const storageHooks = {
    onSaveMatch(match: RapidReact.RapidReactMatch) {
        if (!Config.spreadsheetID) {
            console.warn(`Config.spreadsheetID unspecified; cannot log match ${match.number} to Google Sheets`);
            return;
        }

        let monkeyBarState;
        switch (match.pieceTrackers[1].state) {
        case RapidReact.MonkeyBarState.DidNotAttempt:
            monkeyBarState = 'Did not attempt';
            break;
        case RapidReact.MonkeyBarState.None:
            monkeyBarState = 'Attempted to climb but failed';
            break;
        case RapidReact.MonkeyBarState.Low:
            monkeyBarState = 'Reached the low rung';
            break;
        case RapidReact.MonkeyBarState.Mid:
            monkeyBarState = 'Reached the mid rung';
            break;
        case RapidReact.MonkeyBarState.High:
            monkeyBarState = 'Reached the high rung';
            break;
        case RapidReact.MonkeyBarState.Traversal:
            monkeyBarState = 'Reached the traversal rung';
            break;
        default:
            monkeyBarState = 'Unknown monkey bar state';
            break;
        }

        let cards = 'None';
        if (match.cards.red && match.cards.yellow) {
            cards = 'Both';
        } else if (match.cards.red) {
            cards = 'Red';
        } else if (match.cards.yellow) {
            cards = 'Yellow';
        }

        const row = [
            match.teamNumber,
            match.alliance,
            match.type,
            match.number,
            match.points,
            match.rankingPoints,
            match.pieceTrackers[1].totalPoints,
            monkeyBarState,
            match.pieceTrackers[0].totalPoints,
            match.pieceTrackers[0].totalShotsMade,
            match.pieceTrackers[0].auto.high.made,
            match.pieceTrackers[0].auto.high.missed,
            match.pieceTrackers[0].auto.low.made,
            match.pieceTrackers[0].auto.low.missed,
            match.pieceTrackers[0].teleop.high.missed,
            match.pieceTrackers[0].teleop.high.made,
            match.pieceTrackers[0].teleop.low.missed,
            match.pieceTrackers[0].teleop.low.made,
            match.fouls.regular,
            match.fouls.technical,
            cards,
            match.emergencyStopped ? 'Yes' : 'No',
            match.borked ? 'Yes' : 'No',
            match.crossedStartLineInAuto ? 'Yes' : 'No',
            match.bonusPoints,
        ];

        (async () => {
            try {
                await googleSheets.spreadsheets.values.append({
                    spreadsheetId: Config.spreadsheetID,
                    range: 'Sheet1!A:Y',
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [row],
                    },
                });
            } catch (e) {
                console.error(`Error saving match to Google Sheets: `, e);
            }
        })();
    },
};

if (SQLITE_REGEX.test(Config.storageLocation)) {
    (global as any).Backend = new SQLBackend(storageHooks);

    const storagePathParts = Config.storageLocation.split(pathSeparator);
    storagePathParts.pop(); // remove DB file
    const storageDir = storagePathParts.join(pathSeparator);

    if (!existsSync(storageDir)) {
        console.log(`The given storage directory doesn't exist, creating it...`);
        mkdirPromisified(storageDir).then(() => {
            (Backend as SQLBackend).registerPlan(new RapidReact.RapidReactSQL(Config.storageLocation));
            console.log(`Storage plan initialized!`);
        });
    } else {
        (Backend as SQLBackend).registerPlan(new RapidReact.RapidReactSQL(Config.storageLocation));
        console.log(`Storage plan initialized!`);
    }
} else { // JSON time
    throw new Error(
        `Rapid React matches cannot currently be stored as JSON. ` +
        `Please specify a path to a SQLite database in Config.storageLocation.`,
    );
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
        baseURL: `${Config.domain || 'http://localhost'}:${Config.exposedPort || Config.port}`,
        clientID: Config.auth0ClientID,
        clientSecret: Config.auth0ClientSecret,
        enableTelemetry: false,
        issuerBaseURL: Config.auth0Domain,
    }));
}

server.get('/', async (req: AuthenticatedRequest, res) => {
    let html = ``;

    if (Config.nosecurity || (req.oidc?.isAuthenticated() && req.oidc.user)) {
        const user = Config.nosecurity ? 'a developer' : ((req.oidc!.user as any).name || 'an unknown user');
        html += `<html>
        <head>
          <title>Home</title>
          <link rel="stylesheet" href="css/home.css">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body><div class="logged-in-content">
          <div class="text-group">
            Hello! This is the FRC Team ${Config.teamNumber || 5940} scouting website.
            <p>You are logged in as ${user}.
            <a href="/logout">Log out</a></p>
          </div>
          <ul class="buttons">
              <li><a href="/addmatch"><div class="button">Add Match</div></a></li>
              <li><a href="/viewteam"><div class="button">View Team</div></a></li>
              <li><a href="/viewmatch"><div class="button">View Match</div></a></li>
         </ul>
         </div></body>
       </html>`;
    } else {
        html += `
        <html>
          <head>
            <title>Home</title>
            <link rel="stylesheet" href="css/home.css">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body><div class="logged-out-content">
            <div class="text-group">
              Hello! This is the FRC Team ${Config.teamNumber || 5940} scouting website.
              <p>You will need to <a href="/login">log in</a> to use this service.</p>
            </div>
        </div></body>
      </html>`;
    }

    res.send(html);
});

// ----- Pages from other files -----
// src/authority.ts
server.get('/getauthority', accessGate('Developer'), AuthorityViewingAPI);
server.get('/setauthority', accessGate('System Administrator'), AuthoritySettingAPI);

// src/page/teams.ts
server.get('/viewteam', accessGate('Team Member'), TeamView);

// src/page/rapid-react-matches.ts
server.get('/viewmatch', accessGate('Team Member'), MatchView);
server.get('/addmatch', accessGate('Scouter'), MatchAdd);
// ----- End pages from other files -----

// Serve static CSS resources
server.use('/css', express.static(joinPath(Resources.path, 'css')));

// All pages are loaded, start the server!
server.listen(Config.port, () => console.log(`Listening on ${Config.domain || 'http://localhost'}:${Config.port}`));
