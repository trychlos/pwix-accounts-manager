/*
 * pwix:accounts-manager/src/common/classes/am-class.class.js
 *
 * This class manages an AccountsManager, and notably determines which schema is handled in which collection.
 * All permissions are also managed at this class level.
 */

import _ from 'lodash';

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Field } from 'meteor/pwix:field';
import { Logger } from 'meteor/pwix:logger';
import { ReactiveVar } from 'meteor/reactive-var';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { amClassFielddef } from './private/am-class-fielddef.js';
import { amClassTabular } from './private/am-class-tabular.js';

const logger = Logger.get();

export class amClass extends AccountsHub.ahClass {

    // static data

    // static methods

    /**
     * @param {String} name a tabular name
     * @returns {amClass} the corresponding amClass instance
     */
    static instanceByTabularName( name ){
        return AccountsHub.getByTabularName( name );
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
    #usersList = new ReactiveVar( [] );

    // private methods

    /*
     * @returns {Object} the fieldset extension to be considered
     *  can be falsy (returns null) or :
     *  - must have a 'fields' as an object or an array of objects
     *  - may have a 'before' the name of a field where to insert these ones before, defaulting to appending at the end
     */
    _additionalFieldset(){
        let set = this.#args.additionalFieldset;
        if( set && !_.isObject( set )){
            logger.error( '_additionalFieldset() expects \'set\' be an object when set, got', set, 'throwing...' );
            throw new Error( 'Bad argument: set' );
        }
        if( set && !set.fields ){
            logger.error( '_additionalFieldset() expects \'set\' have a \'fields\' key when set, got', set, 'throwing...' );
            throw new Error( 'Bad argument: fields' );
        }
        if( set && !_.isObject( set.fields ) && !_.isArray( set.fields )){
            logger.error( '_additionalFieldset() expects \'set.fields\' be an object or an array of objects, got', set, 'throwing...' );
            throw new Error( 'Bad argument: fields' );
        }
        set = set || null;
        return set;
    }

    /*
     * @returns {Field.Set} the base fieldset to be considered
     *  can be falsy (and set a default value)
     */
    _baseFieldset(){
        let set = this.#args.baseFieldset;
        if( set ){
            if( !( set instanceof Field.Set )){
                logger.error( '_baseFieldset() expects a \'Field.Set\' argument when set, got', set, 'throwing...' );
                throw new Error( 'Bad argument: set' );
            }
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
        if( close === undefined || close === null ){
            close = true;
        } else if( close === true || close === false ){
            // fine
        } else {
            logger.error( '_closeAfterNew() expects a Boolean argument, got', close, 'throwing...' );
            throw new Error( 'Bad argument: close' );
        }
        return close;
    }

    /*
     * @returns {String} the name of the managed accounts collection
     */
    _collectionName(){
        let name = this.#args.collection;
        if( name ){
            if( _.isString( name )){
                // fine
            } else {
                logger.error( '_collectionName() expects a String argument, got', name, 'throwing...' );
                throw new Error( 'Bad argument: name' );
            }
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
        if( have === undefined || have === null ){
            have = true;
        } else if( have === true || have === false ){
            // fine
        } else {
            logger.error( '_haveIdent() expects a Boolean argument, got', have, 'throwing...' );
            throw new Error( 'Bad argument: have' );
        }
        return have;
    }

    /*
     * @returns {Boolean} whether display a Roles panel
     *  This method also takes into account the presence or not of the pwix:roles package
     */
    _haveRoles(){
        let have = this.#args.haveRoles;
        if( have === undefined || have === null ){
            have = true;
        } else if( have === true || have === false ){
            // fine
        } else {
            logger.error( '_haveRoles() expects a Boolean argument, got', have, 'throwing...' );
            throw new Error( 'Bad argument: have' );
        }
        have &&= ( Object.keys( Package ).includes( 'pwix:roles' ) && Object.keys( Package['pwix:roles'] ).includes( 'Roles' ));
        return have;
    }

    /*
     * @returns {Boolean} whether display a "Global roles" pane
     */
    _withGlobals(){
        let pane = this.#args.withGlobals;
        if( pane === undefined || pane === null ){
            pane = true;
        } else if( pane === true || pane === false ){
            // fine
        } else {
            logger.error( '_withGlobals() expects a Boolean argument, got', pane, 'throwing...' );
            throw new Error( 'Bad argument: pane' );
        }
        return pane;
    }

    /*
     * @returns {Boolean} whether display a "Scoped roles" pane
     */
    _withScoped(){
        let pane = this.#args.withScoped;
        if( pane === undefined || pane === null ){
            pane = true;
        } else if( pane === true || pane === false ){
            // fine
        } else {
            logger.error( '_withScoped() expects a Boolean argument, got', pane, 'throwing...' );
            throw new Error( 'Bad argument: pane' );
        }
        return pane;
    }

    /**
     * @summary
     *  All needed parameters must be specified at instanciation time, as this class doesn't provide any application-level setter.
     *  The collection is entirely defined here.
     *  As a consequence, options parameter is mandatory.
     * @constructor
     * @param {Object} o mandatory options
     * @returns {amClass} this instance
     */
    constructor( o ){
        if( o && _.isObject( o )){
            super( ...arguments );
            logger.debug( 'amClass() instanciating \''+this.name()+'\'', o );

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
                Meteor.defer(() => { self.feedList(); });
            }

           return this;
        }
 
        logger.error( 'amClass() expects a single Object options argument, got', o, 'throwing...' );
        throw new Error( 'Bad argment: o' );
    }

    /**
     * @returns {Array<Object>} the additional tabs to be inserted
     */
    async additionalTabs(){
        let adds = this.#args.additionalTabs;
        if( adds ){
            if( _.isFunction( adds )){
                adds = await adds( this );
            }
        }
        if( adds ){
            if( _.isObject( adds ) && !_.isArray( adds )){
                adds = [ adds ];
            }
        }
        return adds;
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
        if( Meteor.isClient ){
            let found = null;
            this.#usersList.get().every(( doc ) => {
                if( doc._id === id ){
                    found = doc;
                }
                return found === null;
            });
            return found;
        }
        logger.error( 'amById() should only be run from client side', 'throwing...' );
        throw new Error( 'Executione side' );
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
     *  NB: we shouldn't rely on tabular publication as this later is only triggered when we display the AccountsList table
     *  Instead we gather here all the accounts and their characteristics
     */
    feedList(){
        if( !Meteor.isClient ){
            logger.error( 'feedList() should only be run from client side', 'throwing...' );
            throw new Error( 'Bad side' );
        }
        //logger.debug( 'feedList()' );
        //logger.debug( 'AccountsHub.ready()', AccountsHub.ready());
        //logger.debug( 'AccountsManager.ready()', AccountsManager.ready());
        const self = this;
        const usersHandle = Meteor.subscribe( 'pwix.AccountsHub.p.listAll', self.collectionName());
        Tracker.autorun( async () => {
            if( !Meteor.userId()){
                self.#usersList.set( [] );
                return;
            }
            if( !usersHandle.ready()){
                return;
            }
            // usersHandle is ready
            let list = [];
            const fetched = await self.collection().find().fetchAsync();
            for( const it of fetched ){
                it.DYN = it.DYN || {};
                const roles = it.DYN.roles;
                it.DYN.roles = new ReactiveVar({});
                it.DYN.roles.set( roles );
                list.push( it );
            }
            self.#usersList.set( list );
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
