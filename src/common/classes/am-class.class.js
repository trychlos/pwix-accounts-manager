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
            let columns = amClassFielddef.default( this );
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

        this.#args = o;
        const self = this;

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
