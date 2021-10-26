/**
 * Pages to handle teams
 *
 * @author Annika
 */

import type {Response} from 'express';
import {InfiniteRecharge, Team} from 'frc-scouting';

import {normalizePropertyName} from '../lib';
import type {AuthenticatedRequest} from '..';
import {displayTeam, teamViewForm} from '../templates/team';

/** Views a team */
export function TeamView(req: AuthenticatedRequest, res: Response) {
    if (req.query.team) {
        const num = parseInt(req.query.team.toString());
        const team = Backend.getTeam(num);

        return res.send(displayTeam(num, req.query.stat?.toString(), team));
    }

    return res.send(teamViewForm);
}

/** Adds a team */
export async function TeamAdd(req: AuthenticatedRequest, res: Response) {
    let html = await Resources.get('AddTeam.html');

    if (req.query.number) {
        try {
            const teamNumber = parseInt(req.query.number.toString());
            if (isNaN(teamNumber) || teamNumber < 1) throw new Error(`${req.query.number} is not a valid team number`);

            const matches = (req.query.matches || [])
                .toString()
                .split(',')
                .filter(Boolean)
                .map((num) => {
                    const result = parseInt(num);
                    if (isNaN(result) || result < 1) throw new Error(`${num} is not a valid match number`);

                    const matches = Backend.getMatchesByNumber(result);
                    if (!matches.length) throw new Error(`No data for the match numbered ${result} found.`);

                    return matches.filter((m) => m.teamNumber === teamNumber);
                })
                .flat();

            const team = new Team(teamNumber, ...matches);
            Backend.saveTeam(team);
        } catch (err) {
            html += `<br /><h3>Error saving team: ${err}</h3>`;
            return res.send(html);
        }

        html += `<br /><h4>Added a new team (<a href="/viewteam?number=${req.query.number}">#${req.query.number}</a>)!`;
    }

    return res.send(html);
}
