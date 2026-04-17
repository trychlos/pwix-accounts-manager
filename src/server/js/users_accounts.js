/*
 * pwix:accounts-manager/src/server/js/users_accounts.js
 *
 * Rationale:
 *  pwix:accounts-manager/src/common/helpers/am-fielddef.js defines 'loginLastConnection' as an AccountsManager extension.
 *  So update it here instead of accounts-core
 *  NB: only manage 'users' collection here
 */

import { Accounts } from 'meteor/accounts-base';
import { AccountsCore } from 'meteor/pwix:accounts-core';
import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

// https://docs.meteor.com/api/accounts.html#AccountsCommon-onLogin
// NB:
// - on HMR, data.type is 'resume'
// - on login with password, data.type is 'password'
// Doesn't do anything while not ready

Accounts.onLogin(( data ) => {
    //logger.debug( 'data', data );
    check( data, Match.ObjectIncluding({ user: Match.ObjectIncluding({ _id: Match.NonEmptyString })}));
    if( AccountsCore.ready()){
        AccountsCore.s.updateByQuery( 'users', { _id: data.user._id }, { loginLastConnection: new Date() }).then(( res ) => {
            logger.info( 'onLogin() userId', data.user._id, 'type', '\''+data.type+'\'', 'res', res );
            /*
            // check 'users' schema
            const ss = Meteor.users.simpleSchema();
            logger.log( 'services', ss.getDefinition('services' ));
            logger.log( 'resume', ss.getDefinition('services.resume' ));
            logger.log( 'loginTokens', ss.getDefinition('services.resume.loginTokens' ));
            logger.log( 'schemaKeys', ss._schemaKeys || Object.keys(ss.schema()));
            */
        });
    }
});
