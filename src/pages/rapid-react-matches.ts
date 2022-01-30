/**
 * Pages to manage Rapid React matches
 *
 * @author Annika
 */


import type {Response} from 'express';
import type {AuthenticatedRequest} from '..';

import {RapidReact} from 'frc-scouting';
import {generateMatchView} from '../templates/rr-match';

/** Views a match */
export async function MatchView(req: AuthenticatedRequest, res: Response) {
    if (req.query.match) {
        const num = parseInt(req.query.match.toString());
        try {
            const matches = Backend.getMatchesByNumber(num) as RapidReact.RapidReactMatch[];
            return res.send(generateMatchView(num, matches));
        } catch (e) {
            res.status(500).send(`<h2>Error viewing match. Contact a system administrator for more information.</h2>`);
            console.error(e);
            return;
        }
    }

    return res.send(await Resources.get('ViewMatch.html'));
}

/** Adds a match */
export async function MatchAdd(req: AuthenticatedRequest, res: Response) {
    let message: string | null = null;

    if (req.query.number) {
        let failed: Error | null = null;
        try {
            const matchNumber = parseInt(req.query.number.toString());
            if (isNaN(matchNumber) || matchNumber < 1) {
                throw new Error(`${req.query.number} is not a valid match number`);
            }

            const teamNumber = parseInt(req.query.teamnumber?.toString() || '');
            if (isNaN(matchNumber) || matchNumber < 1) {
                throw new Error(`${req.query.teamnumber} is not a valid team number`);
            }

            const type = `Added via web UI by ${req.oidc?.user?.email} on ${new Date()}`;
            const alliance = req.query.alliance === 'red' ? 'RED' : 'BLUE';

            let climbing: RapidReact.MonkeyBarState;
            switch (req.query.monkeybarstate?.toString()) {
            case 'traversal':
                climbing = RapidReact.MonkeyBarState.Traversal;
                break;
            case 'high':
                climbing = RapidReact.MonkeyBarState.High;
                break;
            case 'mid':
                climbing = RapidReact.MonkeyBarState.Mid;
                break;
            case 'low':
                climbing = RapidReact.MonkeyBarState.Low;
                break;
            case 'none':
                climbing = RapidReact.MonkeyBarState.None;
                break;
            case 'didnotattempt':
                climbing = RapidReact.MonkeyBarState.DidNotAttempt;
                break;
            default:
                throw new Error(`${req.query.monkeybarstate} is not a valid monkey bar state`);
            }

            const fouls = {
                regular: parseInt(req.query.fouls?.toString() || '0') || 0,
                technical: parseInt(req.query.techfouls?.toString() || '0') || 0,
            };

            const cards = {
                yellow: req.query.yellowcard?.toString() === 'true',
                red: req.query.redcard?.toString() === 'true',
            };

            const match = new RapidReact.RapidReactMatch(
                teamNumber,
                type,
                matchNumber,
                alliance, {
                    autoShots: {high: {made: 0, missed: 0}, low: {made: 0, missed: 0}},
                    teleopShots: {high: {made: 0, missed: 0}, low: {made: 0, missed: 0}},
                    climbing: RapidReact.MonkeyBarState.DidNotAttempt,
                    fouls,
                    cards,
                    emergencyStopped: req.query.estopped?.toString() === 'true',
                    borked: req.query.borked?.toString() === 'true',
                    bonusPoints: parseInt(req.query.bonusPoints?.toString() || '0') || 0,
                    crossedStartLineInAuto: req.query.crossedautoline?.toString() === 'true',
                },
            );

            Backend.saveMatch(match);
        } catch (err: any) {
            failed = err;
        }

        if (failed !== null) {
            message = `<h3 id="addmatch-error">Error saving match: ${failed}</h3>`;
        } else {
            message = `<h4 id="addmatch-success">Added a new match `;
            message += `(<a href="/viewmatch?match=${req.query.number}">#${req.query.number}</a>)</h4>`;
        }
    }

    let html = await Resources.get('AddMatch.html');
    if (!html) throw new Error('Could not load AddMatch.html');
    if (message) html = html.replace('<!-- addition message goes here -->', message);
    return res.send(html);
}
