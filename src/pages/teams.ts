/**
 * Pages to handle teams
 *
 * @author Annika
 */

import type {Response} from 'express';
import type {AuthenticatedRequest} from '../index';

/** Views a team */
export function TeamView(req: AuthenticatedRequest, res: Response) {
    if (req.query.team) {
        let html = `<h1>Viewing team ${req.query.team}</h1>`;

        const num = parseInt(req.query.team.toString());
        const team = Backend.getTeam(num);

        if (!team) {
            html += `There is no team numbered ${num} in the database.`;
        } else {
            html += `<h3>Team ${num}:</h3>`;
            html += `Mean points: ${team.getMean('points')}`;
            html += `<br />`;
            html += `<details><summary><h5>Matches</h5></summary><ul>`;
            html += team.matches
                .map((match) => `<li><a href="/viewmatch?number=${match.number}">Match ${match.number}</a></li>`)
                .join('');
            html += `</ul></details>`;
        }

        return res.send(html);
    }

    return res.send(
        `<h1>View info about a team!</h1>` +
        `<form action="/viewteam">` +
            `<label for="team">Team number:</label> <input type="text" id="team" name="team"><br />` +
            `<input type="submit" value="View!">` +
        `</form>`,
    );
}
