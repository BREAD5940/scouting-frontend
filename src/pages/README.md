# pages
This folder is for TypeScript files describing specific pages.

## Rapid React API
GET `/addmatch` to add a match. Use the following parameters in a querystring:
- `number`: the match number
- `teamnumber`: the number of the team scouted
- `alliance`: `red` for the Red alliance and anything else for the `blue` alliance
- `monkeybarstate`: `traversal`, `high`, `mid`, `low`, `none` (if the robot failed to climb), or `didnotattempt` (if the robot didn't attempt to climb). Anything else is an error.
- [optional] `fouls`: the number of regular fouls
- [optional] `techfouls`: the number of technical fouls
- [optional] `yellowcard`: `true` if the robot got a yellow card
- [optional] `redcard`: `true` if the robot got a red card
