/**
 * Pages to manage Infinite Recharge matches
 *
 * @author Annika
 */


import type {Response} from 'express';
import type {AuthenticatedRequest} from '../index';

import {InfiniteRecharge} from 'frc-scouting';

/** Views a match */
export function MatchView(req: AuthenticatedRequest, res: Response) {
    if (req.query.match) {
        let html = `<h1>Viewing match ${req.query.match}</h1>`;

        const num = parseInt(req.query.match.toString());
        const match = Backend.getMatchByNumber(num) as InfiniteRecharge.InfiniteRechargeMatch | null;

        if (!match) {
            html += `There is no match numbered ${num} in the database.`;
        } else {
            const allianceHTML = match.alliance === 'RED' ?
                '<span style="color:Tomato">Red</span>' :
                '<span style="color:DodgerBlue">Blue</span>';
            const [powerCells, colorWheel, shield] = match.pieceTrackers;

            html += `<h3>Match ${match.number} (Team ${match.teamNumber} scouted):</h3>`;
            html += `<ul>`;
            html += [
                `Alliance: ${allianceHTML}`,
                `Type: ${match.type}`,
                `Total points scored: ${match.points} <ul>` +
                    `<li>${match.bonusPoints} bonus points</li>` +
                    `<li>${match.pointsFromFouls} from fouls</li>` +
                    `<li>${powerCells.totalPoints} scored from power cells (${powerCells.totalCells} PC scored)</li>` +
                    `<li>${colorWheel.totalPoints} scored from the color wheel (state = ${colorWheel.state})</li>` +
                    `<li>${shield.totalPoints} scored from the shield generator</li>` +
                `</ul>`,
                `${match.rankingPoints} ranking points <ul>` +
                    `<li>${powerCells.rankingPoints} scored from power cells</li>` +
                    `<li>${colorWheel.rankingPoints} scored from the color wheel (state = ${colorWheel.state})</li>` +
                    `<li>${shield.rankingPoints} scored from the shield generator</li>` +
                `</ul>`,

                match.borked ? `<strong>Borked</strong>` : null,
                match.cards.yellow ? `<strong>Recieved yellow card</strong>` : null,
                match.cards.red ? `<strong>Recieved red card</strong>` : null,
                match.emergencyStopped ? `<strong>Emergency stopped</strong>` : null,
                match.fouls.regular ? `<strong>${match.fouls.regular} normal fouls</strong>` : null,
                match.fouls.technical ? `<strong>${match.fouls.technical} technical fouls</strong>` : null,

                `${match.crossedStartLineInAuto ? `Crossed` : `Did not cross`} the start line during auto`,
            ].map((item) => item === null ? `` : `<li>${item}</li>`).join('');
            html += `</ul>`;
        }

        return res.send(html);
    }

    return res.send(
        `<h1>View info about a match!</h1>` +
        `<form action="/viewmatch">` +
            `<label for="match">Match number:</label> <input type="text" id="match" name="match"><br />` +
            `<input type="submit" value="View!">` +
        `</form>`,
    );
}

/** Adds a match */
export function MatchAdd(req: AuthenticatedRequest, res: Response) {
    let html = `<h3>Add a match</h3>` +
    `<form action="/addmatch">` +
        `<label for="number">Match number:</label> <input type="text" id="number" name="number"><br />` +
        `<label for="teamnumber">Team number:</label> <input type="text" id="teamnumber" name="teamnumber"><br />` +

        `<label for="alliance">Alliance</label> <select id="alliance" name="alliance">` +
            `<option value="red">Red</option>` +
            `<option value="blue">Blue</option>` +
        `</select><br />` +

        `<label for="colorwheelstate">Color Wheel</label> <select id="colorwheelstate" name="colorwheelstate">` +
            `<option value="null">Not utilized</option>` +
            `<option value="atcolor">Rotated to a specific color</option>` +
            `<option value="rotated">Rotated a certain number of times</option>` +
        `</select><br />` +

        `Power cells scored in auto: ` +
            `<label for="lowpcauto">Low goal:</label> <input type="text" id="lowpcauto" name="lowpcauto"> ` +
            `<label for="innerpcauto">Inner goal:</label> <input type="text" id="innerpcauto" name="innerpcauto"> ` +
            `<label for="outerpcauto">Outer goal:</label> <input type="text" id="outerpcauto" name="outerpcauto"> ` +
        `<br />` +
        `Power cells scored in teleop: ` +
            `<label for="lowpcteleop">Low goal:</label> <input type="text" id="lowpcteleop" name="lowpcteleop"> ` +
            `<label for="innerpcteleop">Inner goal:</label> ` +
                `<input type="text" id="innerpcteleop" name="innerpcteleop"> ` +
            `<label for="outerpcteleop">Outer goal:</label> ` +
                `<input type="text" id="outerpcteleop" name="outerpcteleop"> ` +
        `<br />` +

        `<label for="hangingbots">Bots hanging from the shield generator:</label> ` +
            `<input type="text" id="hangingbots" name="hangingbots"><br />` +
        `<label for="floorbots">Bots on the floor under the shield generator:</label> ` +
            `<input type="text" id="floorbots" name="floorbots"><br />` +
        `<label for="shieldislevel">Is the Shield Generator level?</label> ` +
            `<input type="checkbox" id="shieldislevel" name="shieldislevel" value="true"><br />` +

        `<input type="submit" value="Add match">` +
    `</form>`;

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
            html += `<br /><h3>Error saving match: ${err}</h3>`;
            return res.send(html);
        }

        html += `<br /><h4>Added a new match (<a href="/viewmatch?match=${req.query.number}">#${req.query.number}</a>)`;
    }

    return res.send(html);
}
