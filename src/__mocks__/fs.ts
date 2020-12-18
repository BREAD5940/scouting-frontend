// Mocked filesystem files for tests

import {resolve} from 'path';

const fs = jest.createMockFromModule('fs');

/** filename:file contents */
const files = new Map<string, string>();

files.set(resolve('config.json'), `{"username":"annika","password":"hunter123"}`);
files.set(
    'authority.json',
    `{"annika@example.com":100, "elise@example.com":"Developer", "sophie@example.com":"Team Member"}`,
);

/** reads a mocked file */
(fs as any).readFileSync = function(path: string) {
    return files.get(path) || '';
};

module.exports = fs;
