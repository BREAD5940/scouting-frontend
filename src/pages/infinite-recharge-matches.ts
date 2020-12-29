/**
 * Pages to manage Infinite Recharge matches
 *
 * @author Annika
 */


import type {Response} from 'express';
import type {AuthenticatedRequest} from '..';

import {InfiniteRecharge} from 'frc-scouting';
import {generateMatchView} from '../templates/ir-match';

/** Views a match */
export async function MatchView(req: AuthenticatedRequest, res: Response) {
    if (req.query.match) {
        const num = parseInt(req.query.match.toString());
        const match = Backend.getMatchByNumber(num) as InfiniteRecharge.InfiniteRechargeMatch | null;

        return res.send(generateMatchView(num, match));
    }

    return res.send(await Resources.get('ViewMatch.html'));
}

/** Adds a match */
export async function MatchAdd(req: AuthenticatedRequest, res: Response) {
    if (req.query.number) {
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

            let colorWheelState: 'ROTATED_X_TIMES' | 'SPECIFIC_COLOR' | null;
            switch (req.query.colorwheelstate?.toString()) {
            case 'rotated':
                colorWheelState = 'ROTATED_X_TIMES';
                break;
            case 'atcolor':
                colorWheelState = 'SPECIFIC_COLOR';
                break;
            default:
                colorWheelState = null;
            }

            const colorWheel = new InfiniteRecharge.ColorWheel(colorWheelState);
            const powerCells =new InfiniteRecharge.PowerCellTracker({
                LOW: {
                    auto: parseInt(req.query.lowpcauto?.toString() || ''),
                    teleop: parseInt(req.query.lowpcteleop?.toString() || ''),
                },
                INNER: {
                    auto: parseInt(req.query.innerpcauto?.toString() || ''),
                    teleop: parseInt(req.query.innerpcteleop?.toString() || ''),
                },
                OUTER: {
                    auto: parseInt(req.query.outerpcauto?.toString() || ''),
                    teleop: parseInt(req.query.outerpcteleop?.toString() || ''),
                },
            }, colorWheel.state !== null);

            // Maybe make PowerCellTracker constructor throw an error on NaN rather than validating here?
            for (const {auto, teleop} of Object.values(powerCells.results)) {
                if (isNaN(auto) || isNaN(teleop)) throw new Error(`Malformed data for power cells`);
            }

            const hanging = parseInt(req.query.hangingbots?.toString() || '');
            const floor = parseInt(req.query.floorbots?.toString() || '');
            const isLevel = req.query.shieldislevel?.toString() === 'true';

            if (![0, 1, 2, 3].includes(hanging)) throw new Error(`Bad number of hanging bots`);
            if (![0, 1, 2, 3].includes(hanging)) throw new Error(`Bad number of floor bots`);

            const shieldGenerator = new InfiniteRecharge.ShieldGenerator(
                hanging as 0 | 1 | 2 | 3,
                floor as 0 | 1 | 2 | 3,
                isLevel,
            );

            const match = new InfiniteRecharge.InfiniteRechargeMatch(
                teamNumber,
                type,
                matchNumber,
                alliance,
                {powerCells, colorWheel, shieldGenerator},
            );

            Backend.saveMatch(match);
        } catch (err) {
            return res.send(`<br /><h3>Error saving match: ${err}</h3>`);
        }

        return res.send(
            `<h4>Added a new match (<a href="/viewmatch?match=${req.query.number}">#${req.query.number}</a>)`,
        );
    }

    return res.send(await Resources.get('AddMatch.html'));
}
