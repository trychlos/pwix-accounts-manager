/*
 * pwix:accounts-manager/src/client/components/account_emails_list/account_emails_list.js
 *
 * On creation, we embed the acUserLogin panel from pwix:accounts-ui package
 * When updating, we rely on the Checker to have same checks.
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - checker: a ReactiveVar which holds the parent Checker
 * - amInstance: a ReactiveVar which holds the amClass instance
 */

import _ from 'lodash';

import { pwixI18n } from 'meteor/pwix:i18n';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';

import './account_emails_list.html';

Template.account_emails_list.onCreated( function(){
    const self = this;

    self.AM = {
        emailsCount: new ReactiveVar( 0 )
    };

    // keep the count of email addresses up to date
    self.autorun(() => {
        const item = Template.currentData().item.get();
        self.AM.emailsCount.set(( item.emails || [] ).length );
    });

    // tracking the count of email addresses
    self.autorun(() => {
        //console.debug( 'emailsCount', self.AM.emailsCount.get());
    });
});

Template.account_emails_list.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // emails addresses list
    itemsList(){
        const count = Template.instance().AM.emailsCount.get();
        return this.item.get().emails || [];
    },

    // passes the same data context, just replacing the parent checker by our own
    parmsEmailRow( it ){
        const parms = { ...this };
        parms.emailsCount = Template.instance().AM.emailsCount;
        parms.it = it;
        return parms;
    },

    plusEnabled(){
        return '';
    }
});

Template.account_emails_list.events({
    'click .c-account-emails-list .js-plus'( event, instance ){
        //console.debug( 'click.js-plus' );
        const item = this.item.get();
        item.emails = item.emails || [];
        const id = Random.id();
        //console.debug( 'adding', id );
        item.emails.push({
            id: id
        });
        this.item.set( item );
    }
});
