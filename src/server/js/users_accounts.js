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
        const acInstance = AccountsCore.getInstance( 'users' );
        check( acInstance, AccountsManager.Account );
        acInstance.collection().updateAsync( { _id: data.user._id }, { $set: { loginLastConnection: new Date() }}).then(( res ) => {
            logger.info( 'onLogin() userId', data.user._id, 'type', '\''+data.type+'\'', 'res', res );
            /*
            // make sure 'lastConnection' is part of the acInstance schema
            logger.debug( 'acInstance c2', acInstance.collection()._c2 );
            logger.debug( 'acInstance simpleSchemas', acInstance.collection()._c2._simpleSchemas );
            logger.debug( 'acInstance simpleSchemas first', acInstance.collection()._c2._simpleSchemas[0] );
            const schema = acInstance.collection()._c2._simpleSchemas[0].schema;
            if( simpleSchema ){
                logger.debug( 'acInstance schema', schema._schema );
                logger.debug( 'acInstance keys', schema._schemakeys );
            }
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
