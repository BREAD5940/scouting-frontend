/**
 * General library/helper functions
 *
 * @author Annika
 */

import type {NextFunction, Response} from 'express';
import type {AuthenticatedRequest} from '../index';

import * as fs from 'fs';

// Source: http://www.emailregex.com/
/* eslint-disable-next-line max-len */
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const NORMALIZE_REGEX = /([A-Z])/g;

/** Middleware to gate access to a certain auth level */
export function accessGate(authLevel: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!AuthManager.toUser(req)?.atLeast(authLevel)) {
            return res.send(
                `<h3>Access denied - you must be logged into an account with at least ${authLevel} authority.</h3>` +
                `<a href="/login">Log in</a> | <a href="/">Back to homepage</a>`,
            );
        }
        next();
    };
}

/**
 * Turns a snakeCase or CamelCase variable name into something for non-programmers.
 */
export function normalizePropertyName(name: string) {
    return name.replace(
        NORMALIZE_REGEX,
        (match, uppercase) => match.replace(uppercase, ` ${uppercase.toLowerCase()}`),
    ).trim();
}

/**
 * @returns {boolean} true if the email is valid, else false
 */
export function isValidEmail(email: string) {
    return !!EMAIL_REGEX.test(email);
}

/** Throws an error if an email is invalid */
export function checkEmailValidity(email: string) {
    if (!isValidEmail(email)) {
        throw new Error(`Invalid E-mail address: '${email}'`);
    }
}

/** async file writing */
export async function writeFilePromisified(path: string, data: string) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/** async file reading */
export async function readFilePromisified(path: string) {
    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/** async readdir */
export async function readdirPromisified(path: string) {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(path, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}
