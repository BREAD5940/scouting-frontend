/**
 * Template for IR matches.
 */

import {RapidReact} from 'frc-scouting';
import * as elements from 'typed-html';

import {sanitize} from '../lib';

/** converts a monkey bar state to a string suitable for end users */
function visualizeMonkeyBarState(state: RapidReact.MonkeyBarState) {
    switch (state) {
    case RapidReact.MonkeyBarState.Traversal:
        return 'climbed to the traversal rung';
    case RapidReact.MonkeyBarState.High:
        return 'climbed to the high rung';
    case RapidReact.MonkeyBarState.Mid:
        return 'climbed to the middle rung';
    case RapidReact.MonkeyBarState.Low:
        return 'climbed to the low rung';
    case RapidReact.MonkeyBarState.None:
        return 'attempted to climb, but failed';
    case RapidReact.MonkeyBarState.DidNotAttempt:
        return 'did not attempt to climb';
    }
}

/** creates a match view */
export function generateMatchView(attemptedNumber: number, matches: RapidReact.RapidReactMatch[]) {
    if (!matches.length) return sanitize(<h1>There are no matches numbered {attemptedNumber} in the database.</h1>);
    const htmlParts = [];

    for (const match of matches) {
        const [shots, rungs] = match.pieceTrackers;
        const allianceHTML = match.alliance === 'RED' ?
            <span style="color:Tomato">Red</span> :
            <span style="color:DodgerBlue">Blue</span>;

        const monkeyBarInfo = visualizeMonkeyBarState(rungs.state);
        htmlParts.push(<div>
            <h3>Match {match.number} (Team {match.teamNumber} scouted):</h3>
            <ul>
                <li>Alliance: {allianceHTML}</li>
                <li>Type: {sanitize(match.type)}</li>
                <li>Total points scored: {match.points} <ul>
                    <li>{match.bonusPoints} bonus points</li>
                    <li>{match.pointsFromFouls} points from fouls</li>
                    <li>{shots.totalPoints} points scored from cargo; {shots.totalShotsMade} cargo shots made</li>
                    <li>{rungs.totalPoints} points scored from the monkey bars ({monkeyBarInfo})</li>
                </ul></li>

                {match.borked ? <li><strong>Borked</strong></li> : ``}
                {match.cards.yellow ? <li><strong>Recieved yellow card</strong></li> : ``}
                {match.cards.red ? <li><strong>Recieved red card</strong></li> : ``}
                {match.emergencyStopped ? <li><strong>Emergency stopped</strong></li> : ``}
                {match.fouls.regular ? <li><strong>{match.fouls.regular} normal fouls</strong></li> : ``}
                {match.fouls.technical ? <li><strong>{match.fouls.technical} technical fouls</strong></li> : ``}

                <li>{match.crossedStartLineInAuto ? `Exited` : `Did not exit`} the tarmac during auto</li>
            </ul>
        </div>);
    }

    return htmlParts.join('<hr />');
}
