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

export const teamViewForm = <html>
      <head>
        <link rel="stylesheet" href="css/ViewTeam.css"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      </head>
      <body>
        <div class="content-container">
          <h1 id="viewteam-title">View info about a team!</h1>
          <form action="/viewteam">
              <div class="label-input-div">
                <label for="team">Team number:</label>
                <input type="text" id="team" name="team" />
              </div>
              <div class="label-input-div">
                <label for="stat">Statistic to view:</label>
                <select id="stat" name="stat">{properties}</select>
              </div>
              <input type="submit" value="View!" />
          </form>
        </div>
        <script> </script>
      </body>
    </html>;

/** displays a team */
export function displayTeam(num: number, stat: string | undefined, team: Team<Match> | null) {
    if (!team) {
        return <html>
          <head>
            <link rel="stylesheet" href="css/TeamNotFound.css"></link>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          </head>
          <body>
            <div class="content-container">
              <div class="image-container">
                <img src="css/images/error.png"></img>
              </div>
              <div class="text-container">
                <div class="text-content-container">
                  <h4>Team Not Found</h4>
                  <p>There is no team numbered {num} in the database</p>
                </div>
              </div>
            </div>
          </body>
        </html>;
    } else {
        let statHTML = '';
        if (stat) {
            try {
                const mean = team.getMean(stat as keyof InfiniteRecharge.InfiniteRechargeMatch);
                statHTML = <div class="stat-container" id="stat-container-1">
                  <p class="stat-label">Mean{`${normalizePropertyName(stat)}: ${mean}`}</p>
                </div>;


            } catch (e) {
                statHTML = <p class="stat">Invalid stat: '{sanitize(stat)}'</p>;
            }
        }

        return <html>
          <head>
            <link rel="stylesheet" href="css/TeamViewPage.css"></link>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          </head>
          <body>
              <div class="content-container">
                <h1 id="teamviewpage-title">Team {num}</h1>
                <ul class="statistics-container">
                  <li>
                    <div class="stat-container" id="stat-container-2">
                      <p class="stat">Mean points: {team.getMean('points')}</p>
                    </div>
                  </li>
                  <li>
                    {statHTML}
                  </li>
                  <div class="clearfix"></div>
                </ul>
                <div class="matches-container">
                  <h4 class="matches-label">Matches:</h4>
                  <ul>{
                      team.matches
                          .map((match) => <li><a href="/viewmatch?match={match.number}"><button>Match {match.number}</button></a></li>)
                          .join('')
                  }</ul>
                </div>
              </div>
              <script> </script>
          </body>
        </html>;
    }
}
