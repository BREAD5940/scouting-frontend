/**
 * Template for IR matches.
 */

import {InfiniteRecharge} from 'frc-scouting';
import * as elements from 'typed-html';

import {sanitize} from '../lib';

/** converts a color wheel state to a string suitable for end users */
function visualizeWheelState(state: InfiniteRecharge.ColorWheel['state']) {
    switch (state) {
    case 'SPECIFIC_COLOR':
        return 'set to a specific color';
    case 'ROTATED_X_TIMES':
        return 'rotated a specific number of times';
    case null:
        return 'not utilized';
    }
}

/** creates a match view */
export function generateMatchView(attemptedNumber: number, matches: InfiniteRecharge.InfiniteRechargeMatch[]) {
    if (!matches.length) return sanitize(<h1>There are no matches numbered {attemptedNumber} in the database.</h1>);
    const htmlParts = [];

    for (const match of matches) {
        const [powerCells, colorWheel, shield] = match.pieceTrackers;
        const totalPC = powerCells.totalCells.toString().trim();
        const wheelState = sanitize(visualizeWheelState(colorWheel.state));
        const allianceHTML = match.alliance === 'RED' ?
            <span style="color:Tomato">Red</span> :
            <span style="color:DodgerBlue">Blue</span>;

        htmlParts.push(<div>
            <h3>Match {match.number} (Team {match.teamNumber} scouted):</h3>
            <ul>
                <li>Alliance: {allianceHTML}</li>
                <li>Type: {sanitize(match.type)}</li>
                <li>Total points scored: {match.points} <ul>
                    <li>{match.bonusPoints} bonus points</li>
                    <li>{match.pointsFromFouls} points from fouls</li>
                    <li>{powerCells.totalPoints} points scored from power cells; {totalPC} PC scored</li>
                    <li>{colorWheel.totalPoints} points scored from the color wheel; {wheelState}</li>
                    <li>{shield.totalPoints} points scored from the shield generator</li>
                </ul></li>
                <li>{match.rankingPoints} ranking points <ul>
                    <li>{powerCells.rankingPoints} RP scored from power cells</li>
                    <li>{colorWheel.rankingPoints} RP scored from the color wheel; {wheelState}</li>
                    <li>{shield.rankingPoints} RP scored from the shield generator</li>
                </ul></li>

                {match.borked ? <li><strong>Attempted to climb, but failed</strong></li> : ``}
                {match.cards.yellow ? <li><strong>Recieved yellow card</strong></li> : ``}
                {match.cards.red ? <li><strong>Recieved red card</strong></li> : ``}
                {match.emergencyStopped ? <li><strong>Emergency stopped</strong></li> : ``}
                {match.fouls.regular ? <li><strong>{match.fouls.regular} normal fouls</strong></li> : ``}
                {match.fouls.technical ? <li><strong>{match.fouls.technical} technical fouls</strong></li> : ``}

                <li>{match.crossedStartLineInAuto ? `Crossed` : `Did not cross`} the start line during auto</li>
            </ul>
        </div>);
    }

    return htmlParts.join('<hr />');
}
