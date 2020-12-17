// Mocked filesystem files for tests

import {resolve} from 'path';

const fs = jest.createMockFromModule('fs');

/** filename:file contents */
const files = new Map<string, string>();

files.set(resolve('config.json'), `{"username":"annika","password":"hunter123"}`);

/** reads a mocked file */
(fs as any).readFileSync = function(path: string) {
    return files.get(path) || '';
};

module.exports = fs;
