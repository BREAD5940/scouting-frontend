# pages
This folder is for TypeScript files describing specific pages.

## Rapid React API
GET `/addmatch` to add a match. Use the following parameters in a querystring:
- `number`: the match number
- `teamnumber`: the number of the team scouted
- `alliance`: `red` for the Red alliance and anything else for the `blue` alliance
- `monkeybarstate`: `traversal`, `high`, `mid`, `low`, `none` (if the robot failed to climb), or `didnotattempt` (if the robot didn't attempt to climb). Anything else is an error.
- `autoshothighmade`: cargo shots into the high goal made in auto
- `autoshothighmissed`: cargo shots into the high goal missed in auto
- `autoshotlowmade`: cargo shots into the low goal made in auto
- `autoshotlowmissed`: cargo shots into the low goal missed in auto
- `teleopshothighmade`: cargo shots into the high goal made in teleop
- `teleopshothighmissed`: cargo shots into the high goal missed in teleop
- `teleopshotlowmade`: cargo shots into the low goal made in teleop
- `teleopshotlowmissed`: cargo shots into the low goal missed in teleop
- [optional] `estopped`: `true` if the robot was emergency stopped
- [optional] `borked`: `true` if the robot was disabled/borked
- [optional] `bonusPoints`: the number of arbitrary bonus points; can be negative
- [optional] `crossedautoline`: `true` if the robot crossed the line in auto
- [optional] `comments`: text comments about the match/robot
- [optional] `defended`: `true` if the robot was being defended
- [optional] `noshow`: `true` if the robot didn't show up to the match
- [optional] `fouls`: the number of regular fouls
- [optional] `techfouls`: the number of technical fouls
- [optional] `yellowcard`: `true` if the robot got a yellow card
- [optional] `redcard`: `true` if the robot got a red card
