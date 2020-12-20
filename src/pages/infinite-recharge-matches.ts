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
    if (req.query.number) {
        let html = `<h1>Viewing match ${req.query.number}</h1>`;

        const num = parseInt(req.query.number.toString());
        const match = Backend.getMatchByNumber(num) as InfiniteRecharge.InfiniteRechargeMatch;

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
