/*
 * pwix:accounts-manager/src/client/components/am_email_addresses_panel/am_email_addresses_panel.js
 *
 * A small panel to display additional email addresses.
 *
 * Parms:
 * - item: the tabular item
 * - amInstance: a ReactiveVar which holds the amAccount instance
 */

import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';

import '../account_emails_list/account_emails_list.js';

import './am_email_addresses_panel.html';

const logger = Logger.get();

Template.am_email_addresses_panel.onCreated( function(){
    const self = this;
    logger.debug( this );

    self.AM = {
        checker: new ReactiveVar( new Forms.Checker( self )),
        item: new ReactiveVar( null )
    };

    // set the item into a ReactiveVar to be compatible with underlying components
    self.autorun(() => {
        const dc = Template.currentData();
        if( dc.item ){
            self.AM.item.set( dc.item );
        }
    });
});

Template.am_email_addresses_panel.helpers({
    parmsEmailsList(){
        return {
            item: Template.instance().AM.item,
            checker: Template.instance().AM.checker,
            amInstance: this.amInstance,
            updatable: false
        };
    }
});
