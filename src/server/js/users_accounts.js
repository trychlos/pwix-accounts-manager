/*
 * pwix:accounts-manager/src/server/js/users_accounts.js
 *
 * Rationale:
 *  pwix:accounts-manager/src/common/classes/private/am-class-fielddef.js defines 'lastConnection' as an AccountsManager extension.
 *  So update it here instead of accounts-hub
 *  NB: only manage 'users' collection here
 */

import { Accounts } from 'meteor/accounts-base';
import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { AccountsManager } from 'meteor/pwix:accounts-manager';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

// https://docs.meteor.com/api/accounts.html#AccountsCommon-onLogin
// NB:
// - on HMR, data.type is 'resume'
// - on login with password, data.type is 'password'
// Doesn't do anything while not ready
// Doesn't use the standard AccountsManager.s.updateById() function as we don't care here of permissions

Accounts.onLogin(( data ) => {
    if( AccountsManager.ready()){
        const amInstance = AccountsHub.getInstance( 'users' );
        if( !amInstance || !( amInstance instanceof AccountsManager.amClass )){
            logger.error( 'onLogin() expect amInstance be an instance of AccountsManager.amClass, got', amInstance, 'throwing...' );
            throw new Error( 'Bad argument: amInstance' );
        }
        amInstance.collection().updateAsync( { _id: data.user._id }, { $set: { lastConnection: new Date() }}).then(( res ) => {
            logger.info( 'onLogin() userId', data.user._id, 'type', '\''+data.type+'\'', 'res', res );
        });
    }
});
