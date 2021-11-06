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
