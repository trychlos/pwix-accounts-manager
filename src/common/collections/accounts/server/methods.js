/*
 * pwix:accounts-manager/src/common/collections/accounts/server/methods.js
 */

/*
import { Accounts } from 'meteor/accounts-base';

import '../accounts.js';

Meteor.methods({

    // retrieve an account by its email address
    'account.byEmail'( email ){
        return Accounts.findUserByEmail( email );
    },

    // retrieve an account by its username
    'account.byUsername'( username ){
        return Accounts.findUserByUsername( username );
    },

    // remove specified attributes
    'account.clearAttributes'( id, array ){
        let unset = {};
        array.every(( field ) => {
            unset[field] = '';
            return true;
        });
        const res = Meteor.users.update({ _id: id }, { $unset: unset });
        console.debug( 'account.clearAttributes', id, array, res );
        return res;
    },

    // remove an account
    'account.remove'( id ){
        let ret = null;
        try {
            ret = Meteor.users.remove({ _id: id });
        } catch( e ){
            throw new Meteor.Error(
                'account.remove',
                'Unable to remove "'+id+'" account' );
        }
        return ret;
    },

    // set attributes on an account
    'account.setAttribute'( id, o ){
        o.updatedAt = new Date();
        o.updatedBy = this.userId;
        const ret = Meteor.users.update( id, { $set: o });
        if( !ret ){
            throw new Meteor.Error(
                'account.setAttribute',
                'Unable to update "'+id+'" account' );
        }
        return ret;
    },

    // set the first email address as verified
    //  whether we set it as verified or not verified, we erase the verification tokens
    //  after this operation, the user will need to reask a new mail with a verification link
    'account.setVerified'( id, isVerified ){
        const ret = Meteor.users.update( id, { $set: {
            updatedAt: new Date(),
            updatedBy: this.userId,
            'emails.0.verified': isVerified,
            'services.email.verificationTokens': []
        }});
        if( !ret ){
            throw new Meteor.Error(
                'account.setVerified',
                'Unable to update "'+id+'" account' );
        }
        return ret;
    },

    // update the user account
    'account.updateUser'( item ){
        const orig = Meteor.users.findOne({ _id: item._id });
        let ret = null;
        if( orig ){
            ret = Meteor.users.update({ _id: item._id }, { $set: Meteor.APP.Helpers.removeUnsetValues({
                updatedAt: new Date(),
                updatedBy: this.userId,
                'emails.0.address': item.emails[0].address,
                'emails.0.verified': item.emails[0].verified,
                isAllowed: item.isAllowed,
                apiAllowed: item.apiAllowed,
                username: item.username ? item.username : null
            }) });
            if( !ret ){
                throw new Meteor.Error(
                    'account.updateUser',
                    'Unable to update "'+item._id+'" account' );
            }
        } else {
            console.warn( 'user not found', item._id );
        }
        return ret;
    }
});
*/