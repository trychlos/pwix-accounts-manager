/*
 * pwix:accounts-manager/src/server/js/users_accounts.js
 *
 * Rationale:
 *  pwix:accounts-manager/src/common/classes/private/am-class-fielddef.js defines 'lastConnection' as an AccountsManager extension.
 *  So update it here instead of accounts-hub
 *  NB: only manage 'users' collection here
 */

const assert = require( 'assert' ).strict;

import { Accounts } from 'meteor/accounts-base';
import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

// https://docs.meteor.com/api/accounts.html#AccountsCommon-onLogin
// NB:
// - on HMR, data.type is 'resume'
// - on login with password, data.type is 'password'
// Doesn't use the standard AccountsManager.s.updateById() function as we don't care here of permissions

Accounts.onLogin(( data ) => {
    const amInstance = AccountsHub.getInstance( 'users' );
    assert.ok( amInstance instanceof AccountsManager.amClass, 'pwix:accounts-manager onLogin() expect an amClass instance, got', amInstance );
    amInstance.collection().updateAsync( { _id: data.user._id }, { $set: { lastConnection: Date.now() }}).then(( res ) => {
        logger.debug( 'onLogin() user', data.user, 'type', '\''+data.type+'\'', 'res', res );
    });
});
