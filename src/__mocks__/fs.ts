// Mocked filesystem files for tests

const fs = jest.createMockFromModule('fs');

/** filename:file contents */
const files = new Map<string, string>();

files.set('config.json', `{"username":"annika","password":"hunter123"}`);

/** reads a mocked file */
(fs as any).readFileSync = function(path: string) {
    return files.get(path) || '';
};

module.exports = fs;
