/*
 * pwix:accounts-manager/src/client/components/account_roles_panel/account_roles_panel.js
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - isNew: true|false
 * - checker: a ReactiveVar which holds the parent Checker
 * - amInstance: a ReactiveVar which holds the amClass instance
 */

import { Logger } from 'meteor/pwix:logger';

import './account_roles_panel.html';

const logger = Logger.get();

Template.account_roles_panel.helpers({
    // parms for prEditPanel roles edition panel
    parmsRoles(){
        return {
            user: this.item.get()
        };
    }
});

Template.account_roles_panel.events({
    // trace global roles updates
    'pr-global-state .am-account-roles-panel'( event, instance, data ){
        //logger.debug( event, data, Roles.EditPanel.roles());
        //logger.debug( Roles.EditPanel.roles());
        //logger.debug( 'global', data.global );
    },
    // trace scoped roles updates
    'pr-scoped-state .am-account-roles-panel'( event, instance, data ){
        //logger.debug( event, data, Roles.EditPanel.roles());
        //logger.debug( Roles.EditPanel.roles());
        //logger.debug( 'scoped', data.scoped );
    }
});
