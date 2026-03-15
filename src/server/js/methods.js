/*
 * pwix:accounts-manager/src/server/js/methods.js
 */

import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

Meteor.methods({
    // remove an account
    async 'pwix.AccountsManager.m.removeById'( instanceName, id ){
        try {
            return await AccountsManager.s.removeById( instanceName, id, this.userId );
        } catch( e ){
            logger.warning( 'pwix.AccountsManager.m.removeById()', e );
            return null;
        }
    },

    // update the user account
    async 'pwix.AccountsManager.m.updateAccount'( instanceName, item, origItem ){
        try {
            return await AccountsManager.s.updateAccount( instanceName, item, this.userId, origItem );
        } catch( e ){
            logger.warning( 'pwix.AccountsManager.m.updateAccount()', e );
            return null;
        }
    },

    // set attribute(s) on an account
    async 'pwix.AccountsManager.m.updateById'( instanceName, id, modifier ){
        try {
            return await AccountsManager.s.updateById( instanceName, id, this.userId, modifier );
        } catch( e ){
            logger.warning( 'pwix.AccountsManager.m.updateById()', e );
            return null;
        }
    }
});
