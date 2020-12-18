// Mocked filesystem files for tests

import {resolve} from 'path';

const fs = jest.createMockFromModule('fs');

/** filename:file contents */
const files = new Map<string, string>();

files.set(resolve('config.json'), `{"username":"annika","password":"hunter123"}`);
files.set(
    'authority.json',
    /* eslint-disable-next-line max-len */
    `{"annika@example.com":100, "elise@example.com":"Developer", "tobias@example.com":20, "sophie@example.com":"Team Member"}`,
);

/** reads a mocked file */
(fs as any).readFileSync = function(path: string) {
    return files.get(path) || '';
};

module.exports = fs;
