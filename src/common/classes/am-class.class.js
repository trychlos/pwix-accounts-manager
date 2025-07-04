/*
 * pwix:accounts-manager/src/common/classes/am-class.class.js
 *
 * This class manages an AccountsManager, and notably determines which schema is handled in which collection.
 * All permissions are also managed at this class level.
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Field } from 'meteor/pwix:field';
import { ReactiveVar } from 'meteor/reactive-var';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { amClassFielddef } from './private/am-class-fielddef.js';
import { amClassTabular } from './private/am-class-tabular.js';

export class amClass extends AccountsHub.ahClass {

    // static data

    // static methods

    /**
     * @param {String} name a tabular name
     * @returns {amClass} the corresponding amClass instance
     */
    static instanceByTabularName( name ){
        let found = null;
        Object.values( AccountsHub.instances ).every(( it ) => {
            if( it.tabularName() === name ){
                found = it;
            }
            return !found;
        });
        return found;
    }

    // private data

    // raw provided arguments
    #args = null;

    // checked arguments with their default values
    #fieldSet = null;
    #closeAfterNew = null;
    #haveIdent = null;
    #haveRoles = null;
    #withGlobals = null;
    #withScoped = null;

    // runtime
    #tabular = null;
    #tabularFieldset = null;
    #usersHandle = new ReactiveVar( null );
    #rolesHandle = new ReactiveVar( null );
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
            let columns = this.defaultFieldDef();
            set = new Field.Set( columns );
        }
        return set;
    }

    /*
     * @returns {Boolean} whether close the 'new account' dialog after successful creation
     */
    _closeAfterNew(){
        let close = this.#args.closeAfterNew;
        if( close !== undefined ){
            assert( close === true || close === false, 'pwix:accounts-manager.amClass._closeAfterNew() expects a Boolean argument, got '+close );
        } else {
            close = true;
        }
        return close;
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
     * @returns {Boolean} whether display the 'ident' panel
     */
    _haveIdent(){
        let have = this.#args.haveIdent;
        if( have !== undefined ){
            assert( have === true || have === false, 'pwix:accounts-manager.amClass._haveIdent() expects a Boolean argument, got '+have );
        } else {
            have = true;
        }
        return have;
    }

    /*
     * @returns {Boolean} whether display a Roles panel
     *  This method also takes into account the presence or not of the pwix:roles package
     */
    _haveRoles(){
        let have = this.#args.haveRoles;
        if( have !== undefined ){
            assert( have === true || have === false, 'pwix:accounts-manager.amClass._haveRoles() expects a Boolean argument, got '+have );
        } else {
            have = true;
        }
        have &&= ( Package['pwix:roles'] !== undefined );
        return have;
    }

    /*
     * @locus: client only
     * @summary: automatically update the user's last connection
     */
    _lastConnection(){
        assert( Meteor.isClient, 'pwix:accounts-manager amClass._lastConnection() must only run on client' );
        assert( this.collectionName() === 'users', 'pwix:accounts-manager amClass._lastConnection() must only run for \'users\' collection, got '+this.collectionName());
        const self = this;
        Tracker.autorun(() => {
            const id = Meteor.userId();
            if( id ){
                Meteor.callAsync( 'pwix_accounts_manager_accounts_update_byid', self.collectionName(), id, { lastConnection: new Date() });
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
        //console.debug( 'instanciating', this.name());

        this.#args = o;
        const self = this;

        // interpret arguments
        this.#closeAfterNew = this._closeAfterNew();
        this.#haveIdent = this._haveIdent();
        this.#haveRoles = this._haveRoles();
        this.#withGlobals = this._withGlobals();
        this.#withScoped = this._withScoped();

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
        this.#tabular = amClassTabular.new( this );

        // get and maintain the accounts list in the client side
        if( Meteor.isClient && this.#args.feedNow !== false ){
            this.feedList();
        }

        // update the last connection attribute in the client side for standard Meteor 'users' collection
        if( Meteor.isClient && this.opts().collection() === 'users' ){
            this._lastConnection();
        }

        //console.debug( this );
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
    amById( id ){
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
     * @returns {Any} arguments to the client-side function to create a new account
     */
    clientNewArgs(){
        return this.#args.clientNewArgs || null;
    }

    /**
     * @returns {Function} a client-side function to create a new account
     */
    clientNewFn(){
        return this.#args.clientNewFn || null;
    }

    /**
     * @returns {Any} arguments to the client-side function to update an account
     */
    clientUpdateArgs(){
        return this.#args.clientUpdateArgs || null;
    }

    /**
     * @returns {Function} a client-side function to update an account
     */
    clientUpdateFn(){
        return this.#args.clientUpdateFn || null;
    }

    /**
     * @returns {Boolean} whether to close the 'new account' dialog after successful creation
     */
    closeAfterNew(){
        return this.#closeAfterNew;
    }

    /**
     * @returns {String} the name of the collection
     */
    collectionName(){
        return this.opts().collection();
    }

    /**
     * @returns {Array} the default columns definitions for this instance
     */
    defaultFieldDef(){
        return amClassFielddef.default( this );
    }

    /**
     * @locus: client only
     * @summary: subscribe and autoload the list of user accounts of the collection
     */
    feedList(){
        assert( Meteor.isClient, 'pwix:accounts-manager amClass.feedList() must only run on client' );
        const self = this;
        // subscription
        Tracker.autorun(() => {
            if( Meteor.userId()){
                self.#usersHandle.set( Meteor.subscribe( 'pwix_accounts_hub_list_all', self.collectionName()));
                if( self.haveRoles()){
                    self.#rolesHandle.set( Meteor.subscribe( 'pwix_roles_user_assignments' ));
                }
            } else {
                self.#usersHandle.set( null );
                self.#rolesHandle.set( null );
                self.#usersList.set( [] );
            }
        });
        // load users
        Tracker.autorun(() => {
            const handle = self.#usersHandle.get();
            if( handle && handle.ready()){
                let list = [];
                self.collection().find().fetchAsync().then(( fetched ) => {
                    fetched.forEach(( it ) => {
                        it.DYN = it.DYN || {};
                        it.DYN.roles = new ReactiveVar( [] );
                        list.push( it );
                    });
                    //console.debug( 'list', self.collectionName(), list );
                    self.#usersList.set( list );
                });
            }
        });
        // load roles
        Tracker.autorun(() => {
            const handle = self.#rolesHandle.get();
            if( handle && handle.ready()){
                self.#usersList.get().forEach(( it ) => {
                    Package['pwix:roles'].Roles.directRolesForUser( it, { anyScope: true }).then(( res ) => {
                        it.DYN.roles.set( res );
                    });
                });
            }
        });
    }

    /**
     * @returns {Field.Set} the full field set
     */
    fieldSet(){
        return this.#fieldSet;
    }

    /**
     * @returns {Array} the list of accounts
     *  A reactive data source
     */
    get(){
        return this.#usersList.get();
    }

    /**
     * @returns {Boolean} whether display the 'ident' panel
     */
    haveIdent(){
        return this.#haveIdent;
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
     * @summary Returns the preferred label for the user
     * @locus Anywhere
     * @param {String|Object} user the user identifier or the user document
     * @param {String} preferred the optional caller preference, either AccountsHub.C.PreferredLabel.USERNAME or AccountsHub.C.PreferredLabel.EMAIL_ADDRESS,
     *  defaulting to the value configured at instanciation time
     * @returns {Promise} a Promise which eventually will resolve to an object with following keys:
     *  - label: the computed preferred label
     *  - origin: the origin, which may be 'ID' or AccountsHub.C.PreferredLabel.USERNAME or AccountsHub.C.PreferredLabel.EMAIL_ADDRESS
     */
    async preferredLabel( user, preferred=null ){
        const res = await( this.#args.preferredLabel ? this.#args.preferredLabel( user, preferred ) : super.preferredLabel( user, preferred ));
        return res;
    }

    /**
     * @summary Calls the preNewfn function if any
     * @locus Server
     * @param {Object} item the item to be inserted
     */
    async preNewFn( item ){
        const fn = this.#args.preNewFn;
        if( fn && typeof fn === 'function' ){
            await fn( item );
        }
    }

    /**
     * @summary Calls the postNewFn function if any
     * @locus Server
     * @param {Object} item the item to be inserted
     */
    async postNewFn( item ){
        const fn = this.#args.postNewFn;
        if( fn && typeof fn === 'function' ){
            await fn( item );
        }
    }

    /**
     * @summary Calls the preUpdateFn function if any
     * @locus Server
     * @param {Object} item the item to be inserted
     */
    async preUpdateFn( item ){
        const fn = this.#args.preUpdateFn;
        if( fn && typeof fn === 'function' ){
            await fn( item );
        }
    }

    /**
     * @summary Calls the postUpdateFn function if any
     * @locus Server
     * @param {Object} item the item to be inserted
     */
    async postUpdateFn( item ){
        const fn = this.#args.postUpdateFn;
        if( fn && typeof fn === 'function' ){
            await fn( item );
        }
    }

    /**
     * @summary 'serverTabularExtend' function let the application extends the content of the published tabular record
     * @returns {Function} the provided function or null
     */
    serverTabularExtend(){
        return this.#args.serverTabularExtend || null;
    }

    /**
     * Getter
     * @returns {Boolean} whether tabular checkboxes are active, defaulting to false
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
    tabularFieldset(){
        if( !this.#tabularFieldset ){
            const def = this.#args.tabularFieldsDef || null;
            this.#tabularFieldset = def ? new Field.Set( def ) : this.fieldSet();
        }
        return this.#tabularFieldset;
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
