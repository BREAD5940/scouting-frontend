/**
 * Templates for teams
 */

import {InfiniteRecharge, Match, Team} from 'frc-scouting';
import * as elements from 'typed-html';

import {normalizePropertyName, sanitize} from '../lib';


const dummyMatch = new InfiniteRecharge.InfiniteRechargeMatch(-1, 'dummy', -1, 'RED', {});

const properties = Object.keys(dummyMatch)
    .filter((prop) => typeof dummyMatch[prop as keyof typeof dummyMatch] === 'number')
    .map((prop) => <option value={prop}>{sanitize(normalizePropertyName(prop))}</option>)
    .join('');

export const teamViewForm = <html><body>
    <h1>View info about a team!</h1>
    <form action="/viewteam">
        <label for="team">Team number:</label> <input type="text" id="team" name="team" /><br />
        <label for="stat">Statistic to view:</label>
        <select id="stat" name="stat">
            {properties}
        </select><br />
        <input type="submit" value="View!" />
    </form>
</body></html>;

/** displays a team */
export function displayTeam(num: number, stat: string | undefined, team: Team<Match> | null) {
    if (!team) {
        return <html><body>There is no team numbered {num} in the database</body></html>;
    } else {
        let statHTML = '';
        if (stat) {
            try {
                const mean = team.getMean(stat as keyof InfiniteRecharge.InfiniteRechargeMatch);
                statHTML = <span>
                    Mean {normalizePropertyName(stat)}: {mean}
                </span>;
            } catch (e) {
                statHTML = <span>Invalid stat: '{sanitize(stat)}'</span>;
            }
        }

        return <body>
            <h3>Team {num}</h3>
            Mean points: {team.getMean('points')}
            <br />
            {statHTML}
            <details open="Matches">
                <ul>{
                    team.matches
                        .map((match) => <li><a href="/viewmatch?match={match.number}">Match {match.number}</a></li>)
                        .join('')
                }</ul>
            </details>
        </body>;
    }
}
