/*
 * pwix:accounts-manager/src/common/classes/private/am-class-fielddef.js
 *
 * Define here the standard field definitions provided by AccountsManager.
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import strftime from 'strftime';

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Forms } from 'meteor/pwix:forms';
import { Notes } from 'meteor/pwix:notes';
import { pwixI18n } from 'meteor/pwix:i18n';
import SimpleSchema from 'meteor/aldeed:simple-schema';

import { amClassChecks } from './am-class-checks.js';

export const amClassFielddef = {

    /*
    * @summary The default fields definition for our accounts collections
    * @param {amClass} instance
    * @returns {Array<Field.Def>} the columns definitions
    *
    * Source:
    *  https://guide.meteor.com/accounts.html
    *  https://docs.meteor.com/api/accounts.html
    *
    * Thanks to the accounts-base package, Meteor automagically creates a 'users' collection. The document created defaults to be:
    *
    *  {
    *      _id: 'oDTZ93Dr3TyRKgeaF',
    *      services: {
    *        password: {
    *          bcrypt: '$2b$10$C8brjVoSZhl4phmV7KJGGeKP3az9bd7YB4i5xpyIE172D5RWrmjJ6'
    *        },
    *        resume: {
    *          loginTokens: [
    *            {
    *              when: ISODate('2024-06-03T15:42:20.849Z'),
    *              hashedToken: '+g9yq6RdL1jMrYVSDXmVhLIDfS2IVtUdBVHC6A63jjs='
    *            },
    *            {
    *              when: ISODate('2024-06-03T15:42:43.305Z'),
    *              hashedToken: 'ACQ/4Z8WSevPzDLo9ix6GZ+SLZgTO9qK4Yf0TDdPX7Q='
    *            }
    *          ]
    *        },
    *        email: { verificationTokens: [] }
    *      },
    *      emails: [ { address: 'aaaa@aaa.aa', verified: false } ],
    *    }
    */
    default( instance ){
        let columns = [];

        // if have an email address
        if( instance.opts().haveEmailAddress() !== AccountsHub.C.Identifier.NONE ){
            columns.push({
                name: 'emails',
                type: Array,
                optional: true,
                dt_visible: false
            },
            {
                name: 'emails.$',
                type: Object,
                optional: true,
                tabular: false
            },
            {
                name: 'emails.$._id',
                type: String,
                dt_data: false,
                dt_visible: false
            },
            {
                name: 'emails.$.address',
                type: String,
                regEx: SimpleSchema.RegEx.Email,
                dt_data: false,
                dt_title: pwixI18n.label( I18N, 'list.email_address_th' ),
                dt_template: Meteor.isClient && Template.dt_email_address,
                form_check: amClassChecks.email_address,
                form_type: instance.opts().haveEmailAddress() === AccountsHub.C.Identifier.MANDATORY ? Forms.FieldType.C.MANDATORY : Forms.FieldType.C.OPTIONAL
            },
            {
                name: 'emails.$.verified',
                type: Boolean,
                defaultValue: false,
                dt_data: false,
                dt_title: pwixI18n.label( I18N, 'list.email_verified_th' ),
                dt_template: Meteor.isClient && Template.dt_email_verified,
                dt_className: 'dt-center',
                form_check: amClassChecks.email_verified
            },
            {
                name: 'emails.$.label',
                type: String,
                optional: true,
                form_check: amClassChecks.email_label,
                form_type: Forms.FieldType.C.OPTIONAL
            },
            {
                dt_template: Meteor.isClient && Template.dt_email_more,
                dt_className: 'dt-center'
            });
        }

        // if have a username
        if( instance.opts().haveUsername() !== AccountsHub.C.Identifier.NONE ){
            columns.push({
                name: 'username',
                type: String,
                optional: true,
                dt_title: pwixI18n.label( I18N, 'list.username_th' ),
                form_check: amClassChecks.username,
                form_type: instance.opts().haveUsername() === AccountsHub.C.Identifier.MANDATORY ? Forms.FieldType.C.MANDATORY : Forms.FieldType.C.OPTIONAL
            });
        }

        // other columns
        columns.push(
            // for Meteor.users compatibility
            {
                name: 'profile',
                type: Object,
                optional: true,
                blackbox: true,
                tabular: false
            },
            // for Meteor.users compatibility
            {
                name:  'services',
                type: Object,
                optional: true,
                blackbox: true,
                tabular: false
            },
            // AccountsManager specifics
            {
                name: 'loginAllowed',
                type: Boolean,
                defaultValue: true,
                dt_title: pwixI18n.label( I18N, 'list.login_allowed_th' ),
                dt_className: 'dt-center',
                dt_template: 'dt_checkbox',
                dt_templateContext( rowData ){
                    return {
                        item: rowData,
                        readonly: true,
                        enabled: true
                    }
                },
                form_check: amClassChecks.loginAllowed,
                form_status: false
            },
            {
                name: 'lastConnection',
                type: Date,
                optional: true,
                dt_title: pwixI18n.label( I18N, 'list.last_connection_th' ),
                dt_render( data, type, rowData ){
                    return type === 'display' && rowData.lastConnection ? strftime( AccountsManager.configure().datetime, rowData.lastConnection ) : '';
                },
                dt_className: 'dt-center',
                form_status: false,
                form_check: false
            }
        );
        // if the application uses the pwix:roles package, then have atabular column which summarizes the main roles of the account
        if( instance.haveRoles()){
            columns.push({
                name: 'roles',
                schema: false,
                dt_title: pwixI18n.label( I18N, 'list.roles_th' ),
                dt_type: 'string',
                dt_createdCell: cell => $( cell ).addClass( 'ui-ellipsized' ),
                dt_render( data, type, rowData ){
                    if( type === 'display' ){
                        const item = instance.amById( rowData._id );
                        return item.DYN.roles.get().join( ', ' );
                    } else {
                        return '';
                    }
                },
                form: false
            });
        }
        columns.push(
            Notes.fieldDef({
                name: 'adminNotes',
                dt_title: pwixI18n.label( I18N, 'list.admin_notes_th' ),
                form_title: pwixI18n.label( I18N, 'tabs.admin_notes_title' )
            }),
            Notes.fieldDef({
                name: 'userNotes',
                dt_title: pwixI18n.label( I18N, 'list.user_notes_th' ),
                form_title: pwixI18n.label( I18N, 'tabs.user_notes_title' )
            }),
            Timestampable.fieldDef()
        );

        return columns;
    }
};
