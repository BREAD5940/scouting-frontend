# scouting-frontend
![tests](https://github.com/TheAnnalyst/scouting-frontend/workflows/tests/badge.svg) [![codecov](https://codecov.io/gh/TheAnnalyst/scouting-frontend/branch/main/graph/badge.svg?token=TU8MI3O8GU)](https://codecov.io/gh/TheAnnalyst/scouting-frontend)

A frontend to the [`frc-scouting`](https://github.com/TheAnnalyst/frc-scouting) package.

## Running
First, copy `config-example.json` to `config.json` and edit it to configure the server.
If you are not using an Auth0 tenant of your own (if you didn't understand that, you're not using one :p), you should disable authentication.

Then, run `npm start` (or `npm start -- --no-security` if you disabled authentication) in a shell (Terminal or Command Prompt) to start the server!
If you encounter errors, run `npm install` to install dependencies.


### Disabling authentication
Disabling authentication should ONLY EVER be done in testing environments that are not accessible to the broader internet.
Generally, if you're at home (not on public Wi-Fi) or in any other environment where you're behind a NAT (most modern Wi-Fi routers provide a NAT) and trust the other users on your network, it's okay to do.

To disable authentication, add the following line at the bottom of `config.json`:
```json
    "nosecurity": true
```

You'll also need to specify the --no-security command line flag (i.e. start `scouting-frontend` with `npm start -- --no-security`).


