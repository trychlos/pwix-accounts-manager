/*
 * pwix:accounts-manager/src/common/collections/accounts/server/methods.js
 */

Meteor.methods({
    // remove an account
    async 'account.remove'( id ){
        return await AccountsManager.server.removeAccount( id, Meteor.userId());
    },

/*
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
*/

    // update the user account
    async 'account.updateAccount'( item ){
        return await AccountsManager.server.updateAccount( item, Meteor.userId());
    }
});
