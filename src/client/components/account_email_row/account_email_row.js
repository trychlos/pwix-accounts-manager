/*
 * pwix:accounts-manager/srv/client/components/account_email_row/account_email_row.js
 *
 * Manage an email adress, maybe empty but have at least an id.
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - checker: a ReactiveVar which holds the parent Checker
 * - it: the emails row to be managed here
 * - emailsCount: a ReactiveVar which counts the email addresses
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';

import './account_email_row.html';

Template.account_email_row.onCreated( function(){
    const self = this;

    self.AM = {
        panel: new Forms.PanelSpec({
            'emails.$.address': {
                js: '.js-email'
            },
            'emails.$.verified': {
                js: '.js-verified'
            }
        }),
        // the Form.Checker instance for this panel
        checker: new ReactiveVar( null ),

        // remove the email item
        removeById( id ){
            const item = Template.currentData().item.get();
            let emails = item.emails || [];
            let found = -1;
            for( let i=0 ; i<emails.length ; ++i ){
                if( emails[i].id === id ){
                    found = i;
                    break;
                }
            }
            if( found !== -1 ){
                emails.splice( found, 1 );
                self.$( '.c-account-email-row' ).remove();
                Blaze.remove( self.view );
                const count = Template.currentData().emailsCount.get();
                Template.currentData().emailsCount.set( count-1 );
                //self.$( '.c-account-email-row' ).trigger( 'panel-clear', {
                //    emitter: 'emails'+id
                //});
            } else {
                console.warn( id, 'not found' );
                const trs = $( '.c-account-ident-panel tr.c-account-email-row' );
                $.each( trs, function( index, object ){
                    console.debug( index, $( object ).data( 'item-id' ));
                });
            }
        },

        // send panel data
        sendPanelData( dataContext, valid ){
            if( _.isBoolean( valid )){
                self.$( '.c-account-ident-panel' ).trigger( 'panel-data', {
                    emitter: 'ident',
                    ok: valid,
                    data: self.AM.checker.get().getForm()
                });
            }
        }
    };
});

Template.account_email_row.onRendered( function(){
    const self = this;
    let itemRv = null;

    // get the item reactive var
    self.autorun(() => {
        itemRv = Template.currentData().item;
    });

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const parentChecker = Template.currentData().checker.get();
        const checker = self.AM.checker.get();
        if( parentChecker && !checker ){
            self.AM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                panel: self.AM.panel.iPanelPlus( AccountsManager.fieldsSet ),
                data: {
                    item: itemRv
                },
                id: Template.currentData().it.id
            }));
        }
    });
});

Template.account_email_row.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // rule: doesn't remove last connection way, i.e. keep at least one username or one email address
    minusEnabled(){
        const haveUseableUsername = AccountsManager._conf.haveUsername !== AccountsManager.C.Input.NONE && this.item.get().username;
        return haveUseableUsername || this.emailsCount.get() > 1 ? '' : 'disabled';
    },

    // provide params to FormsCheckStatusIndicator template
    //  we are using here the CheckStatus value of the Checker itself
    parmsCheckStatus(){
        return {
            statusRv: Template.instance().AM.checker.get()?.iStatusableStatusRv() || null
        };
    }
});

Template.account_email_row.events({
    'click .c-account-email-row .js-minus'( event, instance ){
        console.debug( 'click.js-minus', event );
        //this.entityChecker.errorClear();
        //const id = instance.$( event.currentTarget ).closest( 'tr' ).data( 'item-id' );
        const id = this.it.id;
        console.debug( 'removing', id );
        //const btnid = instance.$( event.currentTarget ).data( 'item-id' );
        //console.debug( 'btnid', btnid );
        instance.AM.removeById( id );
    },
});

Template.account_email_row.onDestroyed( function(){
    console.debug( 'onDestroyed', Template.currentData().it.id );
    // a no-op operation just to trigger a reactivity on itemRV
    const item = Template.currentData().item.get();
    console.debug( item.emails );
    //Template.currentData().item.set( item );
});
