/**
 * Authority management tools
 *
 * @author Annika
 */

import { auth } from 'express-openid-connect';
import {readFileSync} from 'fs';

import {AuthenticatedRequest} from './index';

const AUTHORITY_LEVELS = {
    0: 'Unauthenticated',
    10: 'Team Member',
    20: 'Developer',
    100: 'System Administrator',
};

// Source: http://www.emailregex.com/
/* eslint-disable-next-line max-len */
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/** Manages authority */
export class AuthorityManager {
    /** email:authority level map */
    users = new Map<string, keyof typeof AUTHORITY_LEVELS>();

    /** constructor */
    constructor(path: string) {
        try {
            this.loadJSON(JSON.parse(readFileSync(path).toString()));
        } catch (e) {
            console.warn(`Error loading auth: ${e}`);
        }
    }

    /** Loads in parsed JSON data */
    loadJSON(data: {[k: string]: number | string}) {
        for (let [email, authLevel] of Object.entries(data)) {
            if (!EMAIL_REGEX.test(email)) throw new Error(`Bad email address: ${email}`);

            if (typeof authLevel === 'string') {
                for (const [number, name] of Object.entries(AUTHORITY_LEVELS)) {
                    if (name === authLevel) authLevel = parseInt(number);
                }
            }
            if (!(authLevel in AUTHORITY_LEVELS)) throw new Error(`Unknown authority level: ${authLevel}`);

            this.users.set(email, authLevel as keyof typeof AUTHORITY_LEVELS);
        }
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

        if (!email || !EMAIL_REGEX.test(email)) return null;
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
        this.email = email;
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
