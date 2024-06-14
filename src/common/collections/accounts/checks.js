/*
 * pwix:accounts-manager/src/common/collections/accounts/checks.js
 */

import validator from 'email-validator';

import { pwixI18n } from 'meteor/pwix:i18n';
import { Roles } from 'meteor/pwix:roles';
import { TM } from 'meteor/pwix:typed-message';

AccountsManager.checks = {};

AccountsManager.checks.canDelete = async function( userId ){
    return await Roles.userIsInRoles( userId, AccountsManager._conf.roles.delete );
};

// fields check
//  - value: mandatory, the value to be tested
//  - item: optional, if set the target item, i.e. the item to be updated with this value
//  - index: the index of the current record in an array (for example the index of an email address in the emails array)
//  - update: unless false, let the item be updated with the value if no TypedMessage is emitted
// returns a TypedMessage, or an array of TypedMessage, or null

AccountsManager.checks.check_email_address = async function( args ){
    if( args.update !== false ){
        args.item = args.item || {};
        args.item.emails = args.item.emails || [];
        args.item.emails[args.index] = args.item.emails[args.index] || {};
        args.item.emails[args.index].address = value;
    }
    if( !value ){
        return new TM.TypedMessage({
            type: TM.MessageType.C.ERROR,
            message: pwixI18n.label( I18N, 'check.email_unset' )
        });
    }
    if( !validator.validate( value )){
        return new TM.TypedMessage({
            type: TM.MessageType.C.ERROR,
            message: pwixI18n.label( I18N, 'check.email_invalid' )
        });
    }
    return AccountsTools.byEmail( value )
        .then(( user ) => {
            let ok = false;
            if( user ){
                // we have found a user
                ok = user._id === args.item._id;
            } else {
                ok = true;
            }
            return ok ? null : new TM.TypedMessage({
                type: TM.MessageType.C.ERROR,
                message: pwixI18n.label( I18N, 'accounts.check.email_exists' )
            });
        });
};

AccountsManager.checks.check_email_verified = async function( args ){
    if( args.update !== false ){
        args.item = args.item || {};
        args.item.emails = args.item.emails || [];
        args.item.emails[args.index] = args.item.emails[args.index] || {};
        args.item.emails[args.index].verified = value;
    }
    return null;
}

/*

import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';

// check functions to be able to use a FormChecker in the UI
export const AccountsChecks = {
    async check_apiAllowed( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item.apiAllowed = value;
        }
        return Promise.resolve( null );
    },

    async check_isAllowed( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item.isAllowed = value;
        }
        return Promise.resolve( null );
    },

    async check_email( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item = data.item || {};
            data.item.emails = data.item.emails || [];
            data.item.emails[0] = data.item.emails[0] || {};
            data.item.emails[0].address = value;
        }
        return Promise.resolve( null )
            .then(() => {
                if( !value ){
                    return new CoreApp.TypedMessage({
                        type: CoreApp.MessageType.C.ERROR,
                        message: pwixI18n.label( I18N, 'accounts.check.email_unset' )
                    });
                } else if( !validator.validate( value )){
                    return new CoreApp.TypedMessage({
                        type: CoreApp.MessageType.C.ERROR,
                        message: pwixI18n.label( I18N, 'accounts.check.email_invalid' )
                    });
                } else {
                    return Meteor.callPromise( 'account.byEmail', value )
                        .then(( user ) => {
                            let ok = false;
                            if( user ){
                                // we have found a user
                                ok = user._id === data.item._id;
                            } else {
                                ok = true;
                            }
                            return ok ? null : new CoreApp.TypedMessage({
                                type: CoreApp.MessageType.C.ERROR,
                                message: pwixI18n.label( I18N, 'accounts.check.email_exists' )
                            });
                        });
                }
            });
    },

    async check_username( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item.username = value;
        }
        return Promise.resolve( null )
            .then(() => {
                if( value ){
                    return Meteor.callPromise( 'account.byUsername', value )
                        .then(( user ) => {
                            let ok = false;
                            if( user ){
                                // we have found a user
                                ok = user._id === data.item._id;
                            } else {
                                ok = true;
                            }
                            return ok ? null : new CoreApp.TypedMessage({
                                type: CoreApp.MessageType.C.ERROR,
                                message: pwixI18n.label( I18N, 'accounts.check.username_exists' )
                            });
                        });
                }
                return null;
            });
    },

    async check_verified( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item = data.item || {};
            data.item.emails = data.item.emails || [];
            data.item.emails[0] = data.item.emails[0] || {};
            data.item.emails[0].verified = value;
        }
        return Promise.resolve( null );
    }
}
*/
