/*
 * pwix:accounts-manager/src/common/classes/am-class.class.js
 *
 * This class manages an AccountsManager, and notably determines which schema is handled in which collection.
 * All permissions are also managed at this class level.
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import strftime from 'strftime';

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Field } from 'meteor/pwix:field';
import { Forms } from 'meteor/pwix:forms';
import { Notes } from 'meteor/pwix:notes';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tabular } from 'meteor/pwix:tabular';
import { Tracker } from 'meteor/tracker';

import { amCollection } from '../collections/accounts/index.js';

export class amClass extends AccountsHub.ahClass {

    // static data

    // private data

    // raw provided arguments
    #args = null;

    // checked arguments with their default values
    #fieldSet = null;
    #haveRoles = null;
    #withGlobals = null;
    #withScoped = null;

    // runtime
    #tabular = null;
    #usersHandle = null;
    #rolesHandle = null;
    #usersList = new ReactiveVar( [] );

    // private methods

    /*
     * @returns {Object} the fieldset extension to be considered
     */
    _additionalFieldset(){
        let set = this.#args.additionalFieldset;
        if( set ){
            assert( _.isObject( set ), 'pwix:accounts-manager.amClass.additionalFieldset() expects an Object argument, got '+set );
            assert( set.fields && ( _.isObject( set.fields ) || _.isArray( set.fields )), 'pwix:accounts-manager.amClass.additionalFieldset() expects set.fields be an object or an array, got '+set.fields );
        } else {
            set = null;
        }
        return set;
    }

    /*
     * @returns {Field.Set} the base fieldset to be considered
     */
    _baseFieldset(){
        let set = this.#args.baseFieldset;
        if( set ){
            assert( set instanceof Field.Set, 'pwix:accounts-manager.amClass.baseFieldset() expects a Field.Set argument, got '+set );
        } else {
            let columns = this._defaultFieldSet();
            set = new Field.Set( columns );
        }
        return set;
    }

    /*
     * @returns {String} the name of the managed accounts collection
     */
    _collectionName(){
        let name = this.#args.collection;
        if( name ){
            assert( _.isString( name ), 'pwix:accounts-manager.amClass._collectionName() expects a String argument, got '+name );
        } else {
            name = 'users';
        }
        return name;
    }

    /*
     * the default field set for the Meteor.users user accounts collection
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
    _defaultFieldSet(){
        const self = this;
        let columns = [];
    
        // if have an email address
        if( this.opts().haveEmailAddress() !== AccountsHub.C.Identifier.NONE ){
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
                form_check: amCollection.checks.email_address,
                form_type: Forms.FieldType.C.MANDATORY
            },
            {
                name: 'emails.$.verified',
                type: Boolean,
                defaultValue: false,
                dt_data: false,
                dt_title: pwixI18n.label( I18N, 'list.email_verified_th' ),
                dt_template: Meteor.isClient && Template.dt_email_verified,
                dt_className: 'dt-center',
                form_check: amCollection.checks.email_verified
            },
            {
                name: 'emails.$.label',
                type: String,
                optional: true
            },
            {
                dt_template: Meteor.isClient && Template.dt_email_more,
                dt_className: 'dt-center'
            });
        }
    
        // if have a username
        if( this.opts().haveUsername() !== AccountsHub.C.Identifier.NONE ){
            columns.push({
                name: 'username',
                type: String,
                optional: true,
                dt_title: pwixI18n.label( I18N, 'list.username_th' )
            });
        }
    
        // other columns
        columns.push(
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
                form_check: amCollection.checks.loginAllowed,
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
        if( Package['pwix:roles'] ){
            columns.push({
                name: 'roles',
                schema: false,
                dt_title: pwixI18n.label( I18N, 'list.roles_th' ),
                dt_type: 'string',
                dt_createdCell: cell => $( cell ).addClass( 'ui-ellipsized' ),
                dt_render( data, type, rowData ){
                    if( type === 'display' ){
                        const item = self.byId( rowData._id );
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

    /*
     * @locus: client only
     * @summary: subscribe and autoload the list of user accounts of the collection
     */
    _feedList(){
        assert( Meteor.isClient, 'pwix:accounts-manager amClass._feedList() must only run on client' );
        const self = this;
        // subscription
        Tracker.autorun(() => {
            if( Meteor.userId()){
                self.#usersHandle = Meteor.subscribe( 'pwix_accounts_manager_accounts_list_all', self.collectionName());
                if( self.haveRoles()){
                    self.#rolesHandle = Meteor.subscribe( 'pwix_roles_user_assignments' );
                }
            } else {
                self.#usersHandle = null;
                self.#rolesHandle = null;
                self.#usersList.set( [] );
            }
        });
        // load users
        Tracker.autorun(() => {
            if( self.#usersHandle && self.#usersHandle.ready()){
                let list = [];
                self.collection().find().fetchAsync().then(( fetched ) => {
                    fetched.forEach(( it ) => {
                        it.DYN = {
                            roles: new ReactiveVar( [] )
                        };
                        list.push( it );
                    });
                    self.#usersList.set( list );
                });
            }
        });
        // load roles
        Tracker.autorun(() => {
            if( self.#rolesHandle && self.#rolesHandle.ready()){
                self.#usersList.get().forEach(( it ) => {
                    Package['pwix:roles'].Roles.directRolesForUser( it, { anyScope: true }).then(( res ) => {
                        it.DYN.roles.set( res );
                    });
                });
            }
        });
    }

    /*
     * @returns {Boolean} whether display a Roles panel
     *  This method also takes into account the presence or not of the pwix:roles package
     */
    _haveRoles(){
        let have = this.#args.haveRoles;
        if( have ){
            assert( have === true || have === false, 'pwix:accounts-manager.amClass._haveRoles() expects a Boolean argument, got '+have );
        } else {
            have = true;
        }
        have &&= ( Package['pwix:roles'] !== undefined );
        return have;
    }

    /*
     * @locus: client only
     * @summary: subscribe and autoload the list of user accounts of the collection
     */
    _lastConnection(){
        assert( Meteor.isClient, 'pwix:accounts-manager amClass._lastConnection() must only run on client' );
        assert( this.collectionName() === 'users', 'pwix:accounts-manager amClass._lastConnection() must only run for \'users\' collection, got '+this.collectionName());
        const self = this;
        Tracker.autorun(() => {
            const id = Meteor.userId();
            if( id ){
                Meteor.callAsync( 'pwix_accounts_manager_accounts_update_attribute', id, self.collectionName(), { lastConnection: new Date() });
            }
        });
    }

    /*
     * @returns {Boolean} whether display a "Global roles" pane
     */
    _withGlobals(){
        let pane = this.#args.withGlobals;
        if( pane ){
            assert( pane === true || pane === false, 'pwix:accounts-manager.amClass._withGlobals() expects a Boolean argument, got '+pane );
        } else {
            pane = true;
        }
        return pane;
    }

    /*
     * @returns {Boolean} whether display a "Scoped roles" pane
     */
    _withScoped(){
        let pane = this.#args.withScoped;
        if( pane ){
            assert( pane === true || pane === false, 'pwix:accounts-manager.amClass._withScoped() expects a Boolean argument, got '+pane );
        } else {
            pane = true;
        }
        return pane;
    }

    /*
     *
     */
    async _tabular_identifier( it ){
        const res = await AccountsTools.preferredLabel( it );
        return res.label;
    }
    
    /**
     * @summary
     *  All needed parameters must be specified at instanciation time, as this class doesn't provide any application-level setter.
     *  The collection is entirely defined here.
     * @constructor
     * @returns {amClass} this instance
     */
    constructor( o ){
        assert( o && _.isObject( o ), 'pwix:accounts-manager.amClass() expects an object argument, got '+o );
        super( ...arguments );

        this.#args = o;
        const self = this;

        if( AccountsManager.configure().verbosity & AccountsManager.C.Verbose.INSTANCE ){
            console.log( 'pwix:accounts-manager.amClass() instanciated for', this.opts().collection());
        }

        // define the Field.Set
        let set = this._baseFieldset();
        let adds = this._additionalFieldset();
        if( adds ){
            set.extend( adds );
        }
        this.#fieldSet = set;

        // attach the defined fieldset as a schema to the collection
        this.collection().attachSchema( new SimpleSchema( this.#fieldSet.toSchema()), { replace: true });
        this.collection().attachBehaviour( 'timestampable' );

        // define the Tabular.Table
        this.#tabular = new Tabular.Table({
            name: this.tabularName(),
            collection: this.collectionDb(),
            columns: this.fieldSet().toTabular(),
            tabular: {
                // do not let the user delete himself
                async deleteButtonEnabled( it ){
                    return it._id !== Meteor.userId();
                },
                // display the first email address (if any) instead of the identifier in the button title
                async deleteButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.delete_title', await self._tabular_identifier( it ));
                },
                async deleteConfirmationText( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_text', await self._tabular_identifier( it ));
                },
                async deleteConfirmationTitle( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_title', await self._tabular_identifier( it ));
                },
                async editButtonEnabled( it ){
                    return await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.edit', self, Meteor.userId(), it );
                },
                async editButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.edit_title', await self._tabular_identifier( it ));
                },
                async infoButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.info_title', await self._tabular_identifier( it ));
                }
            },
            destroy: true
        });
    
        // interpret arguments
        this.#haveRoles = this._haveRoles();
        this.#withGlobals = this._withGlobals();
        this.#withScoped = this._withScoped();

        // get and maintain the accounts list in the client side
        if( Meteor.isClient ){
            this._feedList();
        }

        // update the last connection attribute in the client side for standard Meteor 'users' collection
        if( Meteor.isClient && this.opts().collection() === 'users' ){
            this._lastConnection();
        }

        return this;
    }

    /**
     * @returns {Function} the allowFn configured function
     */
    allowFn(){
        return this.#args.allowFn || null;
    }

    /**
     * @locus Client only
     * @param {String} id
     * @returns {Object} the identified user object
     */
    byId( id ){
        assert( Meteor.isClient, 'pwix:accounts-manager amClass.byId() is only available on client' );
        let found = null;
        this.#usersList.get().every(( doc ) => {
            if( doc._id === id ){
                found = doc;
            }
            return found === null;
        });
        return found;
    }

    /**
     * @returns {String} the classes to be added to the display
     */
    classes(){
        return this.#args.classes || '';
    }

    /**
     * @returns {Mongo.Collection} the addressed collection
     */
    collectionDb(){
        return this.collection();
    }

    /**
     * @returns {String} the name of the collection
     */
    collectionName(){
        return this.opts().collection();
    }

    /**
     * @returns {Boolean} whether display a Roles panel
     *  This method also takes into account the presence or not of the pwix:roles package
     */
    haveRoles(){
        return this.#haveRoles;
    }

    /**
     * @returns {Boolean} whether the disabled links should be hidden
     */
    hideDisabled(){
        let hide = this.#args.hideDisabled;
        if( hide !== true && hide !== false ){
            hide = true;
        }
        return hide;
    }

    /**
     * @returns {Field.Set} the full field set
     */
    fieldSet(){
        return this.#fieldSet;
    }

    /**
     * @returns {Boolean} whether tabular checkboxes are active
     */
    tabularActiveCheckboxes(){
        let active = this.#args.tabularActiveCheckboxes;
        if( active !== true && active !== false ){
            active = false;
        }
        return active;
    }

    /**
     * @returns {String} the Tabular.Table instance name
     */
    tabularName(){
        return this.collectionName();
    }

    /**
     * @returns {Boolean} whether display a "Global roles" pane
     */
    withGlobals(){
        return this.#withGlobals;
    }

    /**
     * @returns {Boolean} whether display a "Scoped roles" pane
     */
    withScoped(){
        return this.#withScoped;
    }
}
