/**
 * Tests for the helper library
 */

import {checkEmailValidity, isValidEmail, normalizePropertyName} from '.';

test('normalizePropertyName', () => {
    expect(normalizePropertyName('someLongSnakeCaseName')).toEqual('some long snake case name');
    expect(normalizePropertyName('snakeCase')).toEqual('snake case');
    expect(normalizePropertyName('CamelCase')).toEqual('camel case');
    expect(normalizePropertyName('short')).toEqual('short');
});

describe('email validation', () => {
    test('isValidEmail', () => {
        expect(isValidEmail('no')).toEqual(false);
        expect(isValidEmail('hi@hello')).toEqual(false);
        expect(isValidEmail('hi@hello.com')).toEqual(true);
        expect(isValidEmail('hi@hello.com')).toEqual(true);
    });

    test('checkEmailValidity', () => {
        expect(() => checkEmailValidity('no')).toThrow();
        expect(() => checkEmailValidity('hi@hello')).toThrow();
        expect(() => checkEmailValidity('hi@hello.com')).not.toThrow();
        expect(() => checkEmailValidity('hi@hello.com')).not.toThrow();
    });
});

