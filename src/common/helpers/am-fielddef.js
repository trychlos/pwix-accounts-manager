/*
 * pwix:accounts-manager/src/common/helpers/am-fielddef.js
 *
 * Define here the standard field definitions provided by AccountsManager.
 */

import _ from 'lodash';

import strftime from 'strftime';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { Notes } from 'meteor/pwix:notes';
import { pwixI18n } from 'meteor/pwix:i18n';
import SimpleSchema from 'meteor/aldeed:simple-schema';

import { amChecks } from './am-checks.js';

const logger = Logger.get();

export const amFielddef = {

    // @summary The default fields definition for our accounts collections
    // @param {amAccount} acInstance
    // @returns {Array<Field.Def>} the columns definitions
    //
    // Source:
    //  https://guide.meteor.com/accounts.html
    //  https://docs.meteor.com/api/accounts.html
    //
    // Thanks to the accounts-base package, Meteor automagically creates a 'users' collection. The document created defaults to be:
    //
    //  {
    //      _id: 'oDTZ93Dr3TyRKgeaF',
    //      services: {
    //        password: {
    //          bcrypt: '$2b$10$C8brjVoSZhl4phmV7KJGGeKP3az9bd7YB4i5xpyIE172D5RWrmjJ6'
    //        },
    //        resume: {
    //          loginTokens: [
    //            {
    //              when: ISODate('2024-06-03T15:42:20.849Z'),
    //              hashedToken: '+g9yq6RdL1jMrYVSDXmVhLIDfS2IVtUdBVHC6A63jjs='
    //            },
    //            {
    //              when: ISODate('2024-06-03T15:42:43.305Z'),
    //              hashedToken: 'ACQ/4Z8WSevPzDLo9ix6GZ+SLZgTO9qK4Yf0TDdPX7Q='
    //            }
    //          ]
    //        },
    //        email: { verificationTokens: [] }
    //      },
    //      emails: [ { address: 'aaaa@aaa.aa', verified: false } ],
    //    }
    defaultColumns( acInstance ){
        check( acInstance, AccountsManager.amAccount );
        let columns = [];

        // if may have an email address
        if( acInstance.emailMayHaveOne()){
            columns.push(
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
                    tabular: false
                },
                {
                    name: 'emails.$._id',
                    type: String,
                    dt_data: false,
                    dt_visible: false
                },
                {
                    // dt_data: 'any' prevents "MongoServerError: FieldPath field names may not start with '$'. Consider using $getField or $setField." exception
                    // dt_data: 'emails.0.address' gives server-side sort for the columns where we are using a Blaze template
                    name: 'emails.$.address',
                    type: String,
                    regEx: SimpleSchema.RegEx.Email,
                    dt_data: 'emails.0.address',
                    dt_title: pwixI18n.label( I18N, 'list.email_address_th' ),
                    dt_template: Meteor.isClient && Template.dt_email_addresses,
                    form_check: amChecks.email_address,
                    form_type: acInstance.emailAtLeastOne() ? Forms.FieldType.C.MANDATORY : Forms.FieldType.C.OPTIONAL
                },
                {
                    name: 'emails.$.verified',
                    type: Boolean,
                    defaultValue: false,
                    dt_data: 'emails.0.verified',
                    dt_title: pwixI18n.label( I18N, 'list.email_verified_th' ),
                    dt_template: Meteor.isClient && Template.dt_email_verified,
                    dt_className: 'dt-center',
                    dt_orderDataType: 'dom-checkbox',
                    form_check: amChecks.email_verified
                },
                {
                    name: 'emails.$.preferred',
                    type: Boolean,
                    optional: true,
                    dt_visible: false,
                    form_check: amChecks.email_preferred,
                    form_type: Forms.FieldType.C.OPTIONAL
                },
                {
                    name: 'emails.$.label',
                    type: String,
                    optional: true,
                    dt_visible: false,
                    dt_data: 'any',
                    dt_title: pwixI18n.label( I18N, 'list.email_label_th' ),
                    form_check: amChecks.email_label,
                    form_type: Forms.FieldType.C.OPTIONAL
                }
            );
        }

        // if may have a username
        if( acInstance.usernameMayHaveOne()){
            columns.push(
                {
                    name: 'username',
                    type: String,
                    optional: true,
                    dt_visible: false,
                    dt_title: pwixI18n.label( I18N, 'list.username_th' ),
                    form_check: amChecks.username,
                    form_type: acInstance.usernameAtLeastOne() ? Forms.FieldType.C.MANDATORY : Forms.FieldType.C.OPTIONAL
                },
                {
                    name: 'usernames',
                    type: Array,
                    optional: true,
                    tabular: false
                },
                {
                    name: 'usernames.$',
                    type: Object,
                    optional: true,
                    tabular: false
                },
                {
                    name: 'usernames.$.username',
                    type: String,
                    optional: true,
                    dt_visible: false
                },
                {
                    name: 'usernames.$.preferred',
                    type: Boolean,
                    optional: true,
                    dt_visible: false
                },
                {
                    name: 'usernames.$.label',
                    type: String,
                    optional: true,
                    dt_visible: false
                }
            );
        }
        // other columns for Meteor.users compatibility
        columns.push(
            {
                name: 'profile',
                type: Object,
                optional: true,
                blackbox: true,
                tabular: false
            },
            {
                name:  'services',
                type: Object,
                optional: true,
                blackbox: true,
                tabular: false
            }
        );
        // let DYN sub-object arrives until the client
        columns.push(
            {
                name: 'DYN',
                type: Object,
                blackbox: true,
                optional: true,
                dt_visible: false
            }
        );
        // AccountsManager specifics
        columns.push(
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
                dt_orderDataType: 'dom-checkbox',
                form_check: amChecks.loginAllowed,
                form_status: false
            },
            {
                name: 'loginLastConnection',
                type: Date,
                optional: true,
                dt_title: pwixI18n.label( I18N, 'list.last_connection_th' ),
                dt_render( data, type, rowData, meta ){
                    return type === 'display' && rowData.loginLastConnection ? strftime( AccountsManager.configure().datetime, rowData.loginLastConnection ) : '';
                },
                dt_className: 'dt-center',
                dt_type: 'date',
                form_status: false,
                form_check: false
            }
        );
        // if the application uses the pwix:roles package, then have a tabular column which summarizes the main roles of the account
        // these are displayed as an ellipsized string for global and scoped levels
        if( acInstance.haveRoles()){
            columns.push({
                name: 'roles',
                schema: false,
                dt_title: pwixI18n.label( I18N, 'list.roles_th' ),
                dt_type: 'string',
                dt_render( data, type, rowData, meta ){
                    //logger.debug( 'roles dt_render', arguments );
                    if( type === 'display' ){
                        if( !rowData?.DYN?.roles ){
                            return '';
                        }
                        let roleLabels = {};
                        if( Package['pwix:roles'] ){
                            roleLabels = Package['pwix:roles'].Roles.scopes.labels.all();
                        }
                        let html = '';
                        const roles = rowData.DYN.roles;
                        //logger.debug( 'rowData', rowData );
                        //logger.debug( 'roles', roles );
                        if(( roles?.global.direct || [] ).length ){
                            html += '<div class="role-level global ui-ellipsized" title="'+pwixI18n.label( I18N, 'list.role_global_tooltip', rowData.DYN.preferredLabel.label )+'">';
                            html += '<div class="title">'+pwixI18n.label( I18N, 'list.role_global',  )+'</div>';
                            html += '<div class="roles">'+roles.global.direct.join( ', ' )+'</div>';
                            html += '</div>';
                        }
                        if( Object.keys( roles?.scoped || [] ).length ){
                            Object.keys( roles.scoped ).every(( scope ) => {
                                html += '<div class="role-level scope ui-ellipsized" data-scope="'+scope+'" title="'+pwixI18n.label( I18N, 'list.role_scoped_tooltip', rowData.DYN.preferredLabel.label, roleLabels[scope] )+'">';
                                html += '<div class="title">'+pwixI18n.label( I18N, 'list.role_scoped' )+'</div>';
                                html += '<div class="roles">'+roles.scoped[scope].direct.join( ', ' )+'</div>';
                                html += '</div>';
                                return true;
                            });
                        }
                        //logger.debug( 'html', html );
                        return html;
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
            })
        );
        columns = columns.concat( Timestampable.fieldDef());

        return columns;
    },

    // define the default fieldset at instanciation time
    initFieldset( acInstance ){
        check( acInstance, AccountsManager.amAccount );
        let columns = amFielddef.defaultColumns( acInstance );
        return new Field.Set( columns );
    }
};
