/*
 * pwix:accounts-manager/srv/client/components/account_emails_edit/account_emails_edit.js
 *
 * Let the user have several email adresses.
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - checker: a ReactiveVar which holds the parent Checker
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Random } from 'meteor/random';
import { UIU } from 'meteor/pwix:ui-utils';

import './account_emails_edit.html';

Template.account_emails_edit.onCreated( function(){
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
            let emails = item.emails;
            let found = -1;
            for( let i=0 ; i<emails.length ; ++i ){
                if( emails[i].id === id ){
                    found = i;
                    break;
                }
            }
            if( found !== -1 ){
                emails.splice( found, 1 );
                Template.currentData().item.set( item );
                self.$( '.c-account-emails-edit' ).trigger( 'panel-clear', {
                    emitter: 'emails'+id
                });
            } else {
                console.warn( id, 'not found' );
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

Template.account_emails_edit.onRendered( function(){
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
            self.AM.checker.set( new Forms.Checker({
                instance: self,
                parent: parentChecker,
                panel: self.AM.panel.iPanelPlus( AccountsManager.fieldsSet ),
                data: {
                    item: itemRv
                },
                id( $eventTarget ){
                    return $eventTarget.closest( 'tr' ).data( 'item-id' );
                }
            }));
        }
    });
});

Template.account_emails_edit.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // emails addresses list
    itemsList(){
        return this.item.get().emails || [];
    },

    // rule: doesn't remove last connection way, i.e. keep at least one username or one email address
    minusEnabled(){
        return '';
    },

    // provide params to FormsCheckStatusIndicator template
    parmsCheckStatus(){
        return {
            checker: Template.instance().AM.checker.get()
        };
    },

    plusEnabled(){
        return '';
    }
});

Template.account_emails_edit.events({
    'click .c-account-emails-edit .js-plus'( event, instance ){
        console.debug( 'click.js-plus' );
        const item = this.item.get();
        let emails = item.emails || [];
        const id = Random.id();
        emails.push({
            id: id
        });
        item.emails = emails;
        this.item.set( item );
        // setup the new row
        //UIU.DOM.waitFor( '.c-account-emails-edit tr[data-item-id="'+id+'"]' );
            //.then(( elt ) => { return instance.APP.form.get().setupDom({ id: id, $parent: instance.$( elt ) }); })
            //.then(( valid ) => { instance.APP.sendPanelData( id, valid ); });
    },

    'click .c-account-emails-edit .js-minus'( event, instance ){
        console.debug( 'click.js-minus' );
        //this.entityChecker.errorClear();
        const id = instance.$( event.currentTarget ).closest( 'tr' ).data( 'item-id' );
        instance.AM.removeById( id );
    },
});
