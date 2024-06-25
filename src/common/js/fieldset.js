/*
 * pwix:accounts-manager/src/common/js/fieldset.js
 *
 * Define here the fields we manage at the pwix:accounts-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - by Datatables, via pwix:tabular and aldeed:tabular
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels
 */

import strftime from 'strftime';

import { Field } from 'meteor/pwix:field';
import { Notes } from 'meteor/pwix:notes';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import '../collections/accounts/checks.js';

AccountsManager.fieldSet = new ReactiveVar( null );

const _defaultFieldSet = function( conf ){

    let columns = [{
        name: '_id',
        type: String,
        dt_tabular: false
    }];

    // if have an email address
    if( conf.haveEmailAddress !== AccountsManager.C.Input.NONE ){
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
            dt_tabular: false
        },
        {
            name: 'emails.$.id',
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
            form_check: AccountsManager.checks.check_email_address,
            form_type: Forms.FieldType.C.MANDATORY

        },
        {
            name: 'emails.$.verified',
            type: Boolean,
            dt_data: false,
            dt_title: pwixI18n.label( I18N, 'list.email_verified_th' ),
            dt_template: Meteor.isClient && Template.dt_email_verified,
            dt_className: 'dt-center',
            form_check: AccountsManager.checks.check_email_verified
        },
        {
            dt_template: Meteor.isClient && Template.dt_email_more,
            dt_className: 'dt-center'
        });
    }

    // if have a username
    if( conf.haveUsername !== AccountsManager.C.Input.NONE ){
        columns.push({
            name: 'username',
            type: String,
            optional: true,
            dt_title: pwixI18n.label( I18N, 'list.username_th' )
        });
    }

    // other columns
    columns.push({
        name: 'profile',
        type: Object,
        optional: true,
        blackbox: true,
        dt_tabular: false
    },
    {
        name:  'services',
        type: Object,
        optional: true,
        blackbox: true,
        dt_tabular: false
    },
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
        }
    },
    {
        name: 'lastConnection',
        type: Date,
        optional: true,
        dt_title: pwixI18n.label( I18N, 'list.last_connection_th' ),
        dt_render( data, type, rowData ){
            return strftime( AccountsManager.configure().datetime, data );
        },
        dt_className: 'dt-center'
    },
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
    {
        name: 'createdAt',
        schema: false,
        dt_visible: false
    },
    {
        name: 'createdBy',
        schema: false,
        dt_visible: false
    },
    {
        name: 'updatedAt',
        schema: false,
        dt_visible: false
    },
    {
        name: 'updatedBy',
        schema: false,
        dt_visible: false
    });

    return columns;
};

Tracker.autorun(() => {
    const _conf = AccountsManager.configure();
    let columns = _defaultFieldSet( _conf );
    let _fieldset = new Field.Set( columns );
    if( _conf.fields ){
        _fieldset.extend( _conf.fields );
    }
    AccountsManager.fieldSet.set( _fieldset );
});
