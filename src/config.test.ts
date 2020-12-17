/**
 * Tests for Configuration
 */

import {ConfigLoader} from './config';

jest.mock('fs');

it('should contain mocked properties', () => {
    const config = new ConfigLoader('config.json');

    expect(config.username).toEqual('annika');
    expect(config.password).toEqual('hunter123');
});
