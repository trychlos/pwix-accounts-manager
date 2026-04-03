/*
 * pwix:accounts-manager/src/server/js/methods.js
 */

import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

Meteor.methods({
    // insert a new account
    async 'pwix.AccountsManager.m.insertAccount'( instanceName, item ){
        check( instanceName, Match.NonEmptyString );
        check( item, Object );
        return await AccountsManager.s.insertAccount( instanceName, item, this.userId );
    },

    // remove an account
    async 'pwix.AccountsManager.m.removeById'( instanceName, id ){
        check( instanceName, Match.NonEmptyString );
        check( id, Match.NonEmptyString );
        return await AccountsManager.s.removeById( instanceName, id, this.userId );
    },

    // update the user account
    async 'pwix.AccountsManager.m.updateAccount'( instanceName, item, origItem ){
        check( instanceName, Match.NonEmptyString );
        check( item, Object );
        return await AccountsManager.s.updateAccount( instanceName, item, this.userId, origItem );
    },

    // set attribute(s) on an account
    async 'pwix.AccountsManager.m.updateById'( instanceName, id, modifier ){
        check( instanceName, Match.NonEmptyString );
        check( id, Match.NonEmptyString );
        return await AccountsManager.s.updateById( instanceName, id, this.userId, modifier );
    }
});
