/**
 * Authority management tools
 *
 * @author Annika
 */

import {readFileSync} from 'fs';
import type {Response} from 'express';

import {checkEmailValidity, isValidEmail, writeFilePromisified} from './lib';
import {AuthenticatedRequest} from '.';

const AUTHORITY_LEVELS = {
    0: 'Unauthorized',
    10: 'Team Member',
    20: 'Scouter',
    30: 'Developer',
    100: 'System Administrator',
};

/** Manages authority */
export class AuthorityManager {
    path: string;
    /** email:authority level map */
    users = new Map<string, keyof typeof AUTHORITY_LEVELS>();

    /** constructor */
    constructor(path: string) {
        this.path = path;
        try {
            this.loadJSON(JSON.parse(readFileSync(this.path).toString()));
        } catch (e) {
            console.warn(`Error loading auth: ${e}`);
        }
    }

    /** Loads in parsed JSON data */
    loadJSON(data: {[key: string]: number | string}) {
        for (let [email, authLevel] of Object.entries(data)) {
            checkEmailValidity(email);

            if (typeof authLevel === 'string') {
                for (const [number, name] of Object.entries(AUTHORITY_LEVELS)) {
                    if (name === authLevel) authLevel = parseInt(number);
                }
            }
            if (!(authLevel in AUTHORITY_LEVELS)) throw new Error(`Unknown authority level: ${authLevel}`);

            this.setAuth(email, authLevel as keyof typeof AUTHORITY_LEVELS, true);
        }
    }

    /** save authority */
    async saveAuthority() {
        const json = JSON.stringify(Object.fromEntries(this.users));
        await writeFilePromisified(this.path, json);
    }

    /** sets auth */
    async setAuth(email: string, level: keyof typeof AUTHORITY_LEVELS, noFSWrite?: boolean) {
        this.users.set(email, level);
        if (!noFSWrite) await this.saveAuthority();
    }

    /** gets the auth associated with an email */
    getAuth(email: string): keyof typeof AUTHORITY_LEVELS {
        return this.users.get(email) || 0;
    }

    /** Converts email to user */
    emailToUser(email: string) {
        return new User(email, this);
    }

    /** Converts a request to a user */
    requestToUser(request: AuthenticatedRequest): User | null {
        const email = request.oidc?.user?.email;

        if (!email || !isValidEmail(email)) return null;
        return this.emailToUser(email);
    }

    /** converts to user */
    toUser(thing: AuthenticatedRequest | string): User | null {
        return (typeof thing === 'string' ? this.emailToUser(thing) : this.requestToUser(thing));
    }
}

/** Represents a user */
export class User {
    email: string;
    authority: AuthorityManager;

    /** constructor */
    constructor(email: string, authority: AuthorityManager) {
        this.email = email.toLowerCase().replace(/[^a-zA-Z0-9@\.-]/g, '');
        this.authority = authority;
    }

    /** does what it says on the tin */
    atLeast(auth: string | keyof typeof AUTHORITY_LEVELS) {
        if (typeof auth === 'number') {
            return this.authority.getAuth(this.email) >= auth;
        } else {
            // God I hate how Object.entries() makes everything a string
            for (const [number, name] of Object.entries(AUTHORITY_LEVELS)) {
                if (name === auth) {
                    return this.authority.getAuth(this.email) >= (parseInt(number) as keyof typeof AUTHORITY_LEVELS);
                }
            }
            throw new Error(`Invalid auth level: "${auth}"`);
        }
    }

    /** gets auth level as a number */
    get authLevel(): number {
        return this.authority.getAuth(this.email);
    }

    /** gets auth level as a string */
    get authLevelName(): string {
        return AUTHORITY_LEVELS[this.authority.getAuth(this.email)];
    }
}

/** authority info */
export async function AuthorityViewingAPI(req: AuthenticatedRequest, res: Response) {
    if (!req.query.email) {
        return res.send(await Resources.get('ViewAuthority.html'));
    }

    const email = req.query.email === 'me' ? req.oidc?.user?.email || 'none': req.query.email.toString();
    const auth = AuthManager.toUser(email);
    res.send(`${email} has authority ${auth?.authLevelName} (${auth?.authLevel})`);
}

/** authority setting */
export function AuthoritySettingAPI(req: AuthenticatedRequest, res: Response) {
    if (!req.query.email || !req.query.authlevel) {
        return res.send(
            `<h4>Set authority level for an email</h4>` +
            `<form action="/setauthority">` +
                `<label for="email">Email address:</label> <input type="text" id="email" name="email"><br />` +
                `<label for="authlevel">Authority level:</label>` +
                `<select id="authlevel" name="authlevel">` +
                    Object.entries(AUTHORITY_LEVELS)
                        .map(([level, name]) => `<option value="${level}">${name}</option>`)
                        .join('') +
                `</select><br />` +
                `<input type="submit" value="Set authority level">` +
            `</form>`,
        );
    }

    const email = req.query.email.toString();
    const authLevel = parseInt(req.query.authlevel.toString());

    if (!isValidEmail(email)) return res.send(`'${email}' is not a valid email`);
    if (isNaN(authLevel) || !(authLevel in AUTHORITY_LEVELS)) {
        return res.send(`'${authLevel}' is not a valid authority level`);
    }

    AuthManager.setAuth(email, authLevel as keyof typeof AUTHORITY_LEVELS);

    res.send(`${email}'s authority was set to ${AUTHORITY_LEVELS[authLevel as keyof typeof AUTHORITY_LEVELS]}`);
}
