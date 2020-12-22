/**
 * Pages to handle teams
 *
 * @author Annika
 */

import type {Response} from 'express';
import {InfiniteRecharge, Team} from 'frc-scouting';

import {normalizePropertyName} from '../lib';
import type {AuthenticatedRequest} from '..';

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

            if (req.query.stat) {
                const stat = req.query.stat.toString();
                try {
                    html += `Mean ${normalizePropertyName(stat)}: `;
                    html += team.getMean(stat as keyof InfiniteRecharge.InfiniteRechargeMatch);
                } catch (e) {
                    html += `Invalid stat: '${stat}'`;
                }
                html += `<br />`;
            }

            html += `<details><summary><strong>Matches</strong></summary><ul>`;
            html += team.matches
                .map((match) => `<li><a href="/viewmatch?match=${match.number}">Match ${match.number}</a></li>`)
                .join('');
            html += `</ul></details>`;
        }

        return res.send(html);
    }

    const dummyMatch = new InfiniteRecharge.InfiniteRechargeMatch(-1, 'dummy', -1, 'RED', {});

    return res.send(
        `<h1>View info about a team!</h1>` +
        `<form action="/viewteam">` +
            `<label for="team">Team number:</label> <input type="text" id="team" name="team"><br />` +
            `<label for="stat">Statistic to view:</label> ` +
            `<select id="stat" name="stat">` +
                Object.keys(dummyMatch)
                    .filter((prop) => typeof dummyMatch[prop as keyof typeof dummyMatch] === 'number')
                    .map((prop) => `<option value="${prop}">${normalizePropertyName(prop)}</option>`)
                    .join('') +
            `</select><br />` +
            `<input type="submit" value="View!">` +
        `</form>`,
    );
}

/** Adds a team */
export async function TeamAdd(req: AuthenticatedRequest, res: Response) {
    let html = await Resources.get('AddTeam.html');

    if (req.query.matches !== undefined && req.query.number) {
        try {
            const teamNumber = parseInt(req.query.number.toString());
            if (isNaN(teamNumber) || teamNumber < 1) throw new Error(`${req.query.number} is not a valid team number`);

            const matches = req.query.matches
                .toString()
                .split(',')
                .map((num) => {
                    const result = parseInt(num);
                    if (isNaN(result) || result < 1) throw new Error(`${num} is not a valid match number`);

                    const match = Backend.getMatchByNumber(result);
                    if (!match) throw new Error(`No match numbered ${result} found.`);

                    return match;
                });

            const team = new Team(teamNumber, ...matches);
            Backend.saveTeam(team);
        } catch (err) {
            html += `<br /><h3>Error saving team: ${err}</h3>`;
            return res.send(html);
        }

        html += `<br /><h4>Added a new team (#${req.query.number})`;
    }

    return res.send(html);
}
