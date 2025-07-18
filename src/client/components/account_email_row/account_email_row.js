/*
 * pwix:accounts-manager/src/client/components/account_email_row/account_email_row.js
 *
 * Manage an email adress, maybe empty but have at least an id.
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - checker: a ReactiveVar which holds the parent Checker
 * - it: the emails row to be managed here
 * - emailsCount: a ReactiveVar which counts the email addresses
 * - amInstance: a ReactiveVar which holds the amClass instance
 */

import _ from 'lodash';

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';

import './account_email_row.html';

Template.account_email_row.onCreated( function(){
    const self = this;

    self.AM = {
        // the Form.Checker instance for this panel
        checker: new ReactiveVar( null ),

        // remove the email item
        removeById( id ){
            const item = Template.currentData().item.get();
            let emails = item.emails || [];
            let found = -1;
            for( let i=0 ; i<emails.length ; ++i ){
                if( emails[i]._id === id ){
                    found = i;
                    break;
                }
            }
            if( found !== -1 ){
                emails.splice( found, 1 );
                Template.currentData().item.set( item );
                self.AM.checker.get().removeMe();
            } else {
                console.warn( id, 'not found' );
                const trs = $( '.am-account-ident-panel tr.am-account-email-row' );
                $.each( trs, function( index, object ){
                    console.debug( index, $( object ).data( 'item-id' ));
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
        const amInstance = Template.currentData().amInstance.get();
        const parentChecker = Template.currentData().checker.get();
        const checker = self.AM.checker.get();
        if( amInstance && parentChecker && !checker ){
            self.AM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                panel: new Forms.Panel({
                    'emails.$.address': {
                        js: '.js-email',
                        formFrom( $node ){
                            return $node.val();
                        },
                        formTo( $node, item ){
                            $node.val( item.address );
                        }
                    },
                    'emails.$.verified': {
                        js: '.js-verified',
                        formFrom( $node ){
                            return $node.prop( 'checked' );
                        },
                        formTo( $node, item ){
                            $node.prop( 'checked', item.verified );
                        }
                    }
                }, amInstance.fieldSet()),
                data: {
                    item: itemRv,
                    amInstance: amInstance
                },
                id: Template.currentData().it._id,
                fieldStatusShow: Forms.C.ShowStatus.NONE,
                setForm: Template.currentData().it
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
    minusEnabled( it ){
        const haveUseableUsername = this.amInstance?.get().opts().haveUsername() !== AccountsHub.C.Identifier.NONE && this.item.get().username;
        return ( haveUseableUsername || this.emailsCount.get() > 1 ) ? '' : 'disabled';
    },

    minusTitle( it ){
        return pwixI18n.label( I18N, 'panel.remove_title', it.address );
    },

    // provide params to FormsStatusIndicator template
    //  we are using here the CheckStatus value of the Checker itself
    parmsCheckStatus(){
        return {
            statusRv: Template.instance().AM.checker.get()?.iStatusableStatusRv() || null
        };
    }
});

Template.account_email_row.events({
    'click .am-account-email-row .js-minus'( event, instance ){
        instance.AM.removeById( this.it._id );
    },
});

Template.account_email_row.onDestroyed( function(){
    //console.debug( 'onDestroyed', Template.currentData().it.id );
});
