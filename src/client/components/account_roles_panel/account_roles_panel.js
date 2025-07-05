/*
 * pwix:accounts-manager/src/client/components/account_roles_panel/account_roles_panel.js
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - isNew: true|false
 * - checker: a ReactiveVar which holds the parent Checker
 * - amInstance: a ReactiveVar which holds the amClass instance
 */

import './account_roles_panel.html';

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
        //console.debug( event, data, Roles.EditPanel.roles());
        //console.debug( Roles.EditPanel.roles());
        //console.debug( 'global', data.global );
    },
    // trace scoped roles updates
    'pr-scoped-state .am-account-roles-panel'( event, instance, data ){
        //console.debug( event, data, Roles.EditPanel.roles());
        //console.debug( Roles.EditPanel.roles());
        //console.debug( 'scoped', data.scoped );
    }
});
