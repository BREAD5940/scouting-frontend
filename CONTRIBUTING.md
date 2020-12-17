# Contributing to `scouting-backend`
The scouting-backend project welcomes contributions from the open-source community, as well as the BREAD 5940 FRC team.

However, I do have certain guidelines that all contributions must follow before they are merged (integrated into the main branch, and eventually into the NPM package).

## Code
`scouting-backend` strives to keep its codebase **readable**, **modular**, and **robust**. What does this mean in practice?
Many of our coding standards are enforced **by running `npm test`**; you should do this before making a pull request (and GitHub's built-in CI will do it for you if you forget!).

Some examples of readability, modularity, and robustness that you should know about are below.

### Readability
- `frc-scouting` follows the Google style guide for TypeScript (just like most other projects associated with Team 5940).
- Lines should be wrapped at 120 characters.
- Error messages should make sense.
- JSDoc comments should be used; documentation is automatically generated and placed in the `docs/` folder by Annika's publishing script.
- Regular comments are also a good idea if the code does not speak for itself.

### Modularity
- We follow the DRY (don't repeat yourself) principle. If you are repeating code, it should probably be refactored into a function, abstract class, or superclass.
- Since there is a new FRC competition ~~every~~ most years, **year/game-specific code should be minimized**.
- You should follow the basic tenets of object-oriented programming; interfaces, (sometimes abstract) classes, and methods are all highly encouraged.

### Robustness
- All code is to be written in TypeScript.
- Stronger, more limited, and more descriptive types are preferred; `'RED' | 'BLUE'` > `0 | 1` > `string`.
- Semicolons and strict equality (`===` and `!==`) are to be used.
- Unit tests, written in TypeScript with the Jest framework, are encouraged.

## Procedures
If you want to make a change, you should first create a fork of the repository, and then push your changes to a branch.
Once you have made your changes, run `npm test` to ensure that code style and unit tests pass.
Then, you can open a new pull request. All pull requests are code reviewed, and when the reviewer(s) are confident that your code is up to quality (we're friendly and it's a lot less scary than you'd think :)), your pull request will be merged into the main branch.

If you have any questions or concerns at all, please don't hesitate to reach out to Annika (Discord: `Annika#1562`, GitHub: [@TheAnnalyst](https://github.com/TheAnnalyst)).
Members of FRC team 5940's programming subteam can also ask their questions in our programmer Discord server