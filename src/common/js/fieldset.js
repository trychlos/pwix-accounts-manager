/*
 * pwix:accounts-manager/src/common/js/fieldset.js
 *
 * Define here the fields we manage at the pwix:accounts-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - by Datatables, via pwix:tabular and aldeed:tabular
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels
 */

import { Field } from 'meteor/pwix:field';
import { Notes } from 'meteor/pwix:notes';
import { pwixI18n } from 'meteor/pwix:i18n';
import SimpleSchema from 'meteor/aldeed:simple-schema';

import '../collections/accounts/checks.js';

AccountsManager.fieldSet = new Field.Set(
    {
        name: '_id',
        type: String,
        dt_tabular: false
    },
    {
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
        form_check: AccountsManager.checks.check_email_verified
    },
    {
        dt_template: Meteor.isClient && Template.dt_email_more
    },
    {
        name: 'username',
        type: String,
        optional: true,
        dt_title: pwixI18n.label( I18N, 'list.username_th' )
    },
    {
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
        name: 'lastConnection',
        type: Date,
        dt_title: pwixI18n.label( I18N, 'list.last_connection_th' ),
    },
    {
        name: 'loginAllowed',
        type: Boolean,
        defaultValue: true,
        dt_title: pwixI18n.label( I18N, 'list.login_allowed_th' )
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
    }
);
