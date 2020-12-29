/**
 * Template for IR matches.
 */

import {InfiniteRecharge} from 'frc-scouting';
import * as elements from 'typed-html';
import sanitizeHTML from 'sanitize-html';

/** creates a match view */
export function generateMatchView(attemptedNumber: number, match: InfiniteRecharge.InfiniteRechargeMatch | null) {
    if (!match) return sanitizeHTML(<h1>There is no match numbered {attemptedNumber} in the database.</h1>);

    const [powerCells, colorWheel, shield] = match.pieceTrackers;
    const totalPC = powerCells.totalCells.toString().trim();
    const wheelState = sanitizeHTML(colorWheel.state || 'not utilized');
    const allianceHTML = match.alliance === 'RED' ?
        <span style="color:Tomato">Red</span> :
        <span style="color:DodgerBlue">Blue</span>;

    return <div>
        <h3>Match {match.number} (Team {match.teamNumber} scouted):</h3>
        <ul>
            <li>Alliance: {allianceHTML}</li>
            <li>Type: {sanitizeHTML(match.type)}</li>
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

            {match.borked ? <li><strong>Borked</strong></li> : ``}
            {match.cards.yellow ? <li><strong>Recieved yellow card</strong></li> : ``}
            {match.cards.red ? <li><strong>Recieved red card</strong></li> : ``}
            {match.emergencyStopped ? <li><strong>Emergency stopped</strong></li> : ``}
            {match.fouls.regular ? <li><strong>{match.fouls.regular} normal fouls</strong></li> : ``}
            {match.fouls.technical ? <li><strong>{match.fouls.technical} technical fouls</strong></li> : ``}

            <li>{match.crossedStartLineInAuto ? `Crossed` : `Did not cross`} the start line during auto</li>
        </ul>
    </div>;
}
