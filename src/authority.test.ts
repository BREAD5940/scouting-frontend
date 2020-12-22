/**
 * Tests for the authority manager
 */

jest.mock('fs');
import {AuthorityManager} from './authority';

describe('Authority management', () => {
    const authManager = new AuthorityManager('authority.json');

    it('should properly load ranks from both numbers and names', () => {
        expect(authManager.getAuth('annika@example.com')).toEqual(100);
        expect(authManager.getAuth('elise@example.com')).toEqual(30);
        expect(authManager.getAuth('tobias@example.com')).toEqual(20);
        expect(authManager.getAuth('sophie@example.com')).toEqual(10);

        expect(authManager.getAuth('random@example.com')).toEqual(0);
        expect(authManager.getAuth('random@gmail.com')).toEqual(0);
    });

    it('should use User objects to correctly get names of authority levels', () => {
        expect(authManager.toUser('annika@example.com')?.authLevelName).toEqual('System Administrator');
        expect(authManager.toUser('elise@example.com')?.authLevelName).toEqual('Developer');
        expect(authManager.toUser('tobias@example.com')?.authLevelName).toEqual('Scouter');
        expect(authManager.toUser('sophie@example.com')?.authLevelName).toEqual('Team Member');

        expect(authManager.toUser('random@example.com')?.authLevelName).toEqual('Unauthorized');
        expect(authManager.toUser('random@gmail.com')?.authLevelName).toEqual('Unauthorized');
    });

    describe('User#atLeast', () => {
        expect(authManager.toUser('annika@example.com')!.atLeast('System Administrator')).toBeTruthy();
        expect(authManager.toUser('annika@example.com')!.atLeast('Developer')).toBeTruthy();
        expect(authManager.toUser('annika@example.com')!.atLeast('Scouter')).toBeTruthy();
        expect(authManager.toUser('annika@example.com')!.atLeast('Team Member')).toBeTruthy();
        expect(authManager.toUser('annika@example.com')!.atLeast('Unauthorized')).toBeTruthy();

        expect(authManager.toUser('elise@example.com')!.atLeast('System Administrator')).toBeFalsy();
        expect(authManager.toUser('elise@example.com')!.atLeast('Developer')).toBeTruthy();
        expect(authManager.toUser('elise@example.com')!.atLeast('Scouter')).toBeTruthy();
        expect(authManager.toUser('elise@example.com')!.atLeast('Team Member')).toBeTruthy();
        expect(authManager.toUser('elise@example.com')!.atLeast('Unauthorized')).toBeTruthy();

        expect(authManager.toUser('sophie@example.com')!.atLeast('System Administrator')).toBeFalsy();
        expect(authManager.toUser('sophie@example.com')!.atLeast('Developer')).toBeFalsy();
        expect(authManager.toUser('sophie@example.com')!.atLeast('Scouter')).toBeFalsy();
        expect(authManager.toUser('sophie@example.com')!.atLeast('Team Member')).toBeTruthy();
        expect(authManager.toUser('sophie@example.com')!.atLeast('Unauthorized')).toBeTruthy();


        expect(authManager.toUser('tobias@example.com')!.atLeast('System Administrator')).toBeFalsy();
        expect(authManager.toUser('tobias@example.com')!.atLeast('Developer')).toBeFalsy();
        expect(authManager.toUser('tobias@example.com')!.atLeast('Scouter')).toBeTruthy();
        expect(authManager.toUser('tobias@example.com')!.atLeast('Team Member')).toBeTruthy();
        expect(authManager.toUser('tobias@example.com')!.atLeast('Unauthorized')).toBeTruthy();

        expect(authManager.toUser('random@example.com')!.atLeast('System Administrator')).toBeFalsy();
        expect(authManager.toUser('random@example.com')!.atLeast('Developer')).toBeFalsy();
        expect(authManager.toUser('random@example.com')!.atLeast('Scouter')).toBeFalsy();
        expect(authManager.toUser('random@example.com')!.atLeast('Team Member')).toBeFalsy();
        expect(authManager.toUser('random@example.com')!.atLeast('Unauthorized')).toBeTruthy();
    });
});
