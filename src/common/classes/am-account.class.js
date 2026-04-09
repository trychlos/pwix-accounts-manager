/*
 * pwix:accounts-manager/src/common/classes/am-account.class.js
 *
 * This class manages an AccountsManager, and notably determines which schema is handled in which collection.
 * All permissions are also managed at this class level.
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { check, Match } from 'meteor/check';
import { Field } from 'meteor/pwix:field';
import { Logger } from 'meteor/pwix:logger';
import { ReactiveVar } from 'meteor/reactive-var';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { amOptions } from './am-options.class.js';

import { amFielddef } from '../helpers/am-fielddef.js';
import { amTabular } from '../helpers/am-tabular.js';

const logger = Logger.get();

export class amAccount extends AccountsCore.Account {

    // static data

    // tabular names registry
    static tabulars = {};

    // static methods

    /**
     * @param {String} name a tabular name
     * @returns {amAccount} the corresponding amAccount instance
     */
    static byTabularName( name ){
        return AccountsManager.Account.tabulars[name]?.instance;
    }

    // private data

    // runtime
    #fieldset = null;
    #usersList = new ReactiveVar( [] );

    // private methods

    // @locus Server
    // @summary delete all login tokens
    //  this doesn't really logout clients, but at least prevent them to reconnect
    // @param {String} userId the user identifier to be logged-out
    async _disconnnectAll( userId ){
        const res = await this.collection().updateAsync({ _id: userId }, { $set: { 'services.resume.loginTokens': [] }});
        logger.log( '_disconnnectAll() forced user logout', userId, 'res', res );
    }

    // @locus Server
    // @summary Initialize the transformation functions for new publications from this package
    _initPublishTransformation(){
        if( Meteor.isServer ){
            // publication transformations
            const transforms = this.transformsPublish( AccountsManager.C.pub.tabular.name );
            transforms.push( AccountsCore.Transforms.addDyn );
            transforms.push( AccountsCore.Transforms.addPreferredLabel );
            transforms.push( AccountsCore.Transforms.addUndefined );
            transforms.push( AccountsCore.Transforms.cleanupUserDocument );
            // if we have Roles package, then update our two publication transformations arrays we know about
            if( this.haveRoles()){
                this.transformsPublish( AccountsCore.C.pub.listAll.name ).push( AccountsManager.Transforms.transformRoles );
                this.transformsPublish( AccountsManager.C.pub.tabular.name ).push( AccountsManager.Transforms.transformRoles );
            }
        }
    }

    // @locus Server
    // @summary Initialize common hooks for 'users' collection
    //  these hooks are not used by AccountsCore base class, so safety guards are just as a way to show how to do
    _initUsersHooks(){
        if( Meteor.isServer ){
            const self = this;

            const _origPostDelete = this.hooksServer?.postDeleteFn || null;
            this.hooksServer.postDeleteFn = async function( userDoc, opts={}, userId ){
                if( _origPostDelete ){
                    await _origPostDelete( userDoc, opts, userId );
                }
                // force logout of all clients when an account is deleted
                await self._disconnectAll( userDoc._id );
                // be a good EventEmitter
                AccountsManager.s.eventEmitter.emit( 'delete', { amInstance: self.name(), item: userDoc, userId: userId });
            };

            const _origPostInsert = this.hooksServer?.postInsertFn || null;
            this.hooksServer.postInsertFn = async function( userDoc, opts={}, userId ){
                if( _origPostInsert ){
                    await _origPostInsert( userDoc, opts, userId );
                }
                // be a good EventEmitter
                AccountsManager.s.eventEmitter.emit( 'insert', { amInstance: self.name(), item: userDoc, userId: userId });
            };

            const _origPreUpdate = this.hooksServer?.preUpdateFn || null;
            this.hooksServer.preUpdateFn = async function( userDoc, opts={}, userId ){
                if( _origPreUpdate ){
                    await _origPreUpdate( userDoc, opts, userId );
                }
                // check update permission
                if( !await AccountsCore.isAllowed( 'pwix.accounts_manager.feat.update', userId, { instance: self.name(), id: userDoc._id })){
                    throw new Error( 'Not authorized' );
                }
                // refuse to disable login of the current user
                if( userDoc._id === userId && !userDoc.loginAllowed ){
                    logger.warn( 'preUpdateFn() cowardly refusing to disallow current user login' );
                    userDoc.loginAllowed = true;
                }
            };

            const _origPostUpdate = this.hooksServer?.postUpdateFn || null;
            this.hooksServer.postUpdateFn = async function( userDoc, opts={}, userId ){
                if( _origPostUpdate ){
                    await _origPostUpdate( userDoc, opts, userId );
                }
                // force logout of all clients when a login is disabled
                if( !userDoc.loginAllowed ){
                    await self._disconnectAll( userDoc._id );
                }
                // be a good EventEmitter
                AccountsManager.s.eventEmitter.emit( 'update', { amInstance: self.name(), item: userDoc, userId: userId });
            };
        }
    }

    /**
     * @summary Instanciates a new amAccount instance
     * @constructor
     * @param {Object} args an optional options object
     * @returns {amAccount} this instance
     */
    constructor( args ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amAccount.amAccount()', arguments );
        check( args, Match.OneOf( null, undefined, Object ));
        super( ...arguments );
        //logger.debug( 'amAccount() instanciating \''+this.name()+'\'', args );
        logger.debug( 'amAccount() instanciating \''+this.name()+'\'' );

        this._setOpts( new amOptions( args ));

        // update the publish transformations
        this._initPublishTransformation();

        // define the initial Field.Set
        this.#fieldset = amFielddef.initFieldset( this );

        // attach the defined fieldset as a schema to the collection
        const schema = this.fieldSet().toSchema();
        this.collection().attachSchema( new SimpleSchema( schema ), { replace: true });
        this.collection().attachBehaviour( 'timestampable' );

        // setup common hooks for 'users' collection
        if( this.name() === AccountsCore.Options._defaults.name ){
            this._initUsersHooks();
        }

        // get and maintain the accounts list on the client side
        if( Meteor.isClient && this.opts().listFeedNow() !== false ){
            const self = this;
            Meteor.defer(() => { self.feedList(); });
        }

        return this;
    }

    /**
     * @locus: Client only
     * @summary: Subscribe and autoload the list of user accounts of the collection
     *  NB: we shouldn't rely on tabular publication as this later is only triggered when we display the AccountsList table
     *  Instead we gather here all the accounts and their characteristics
     */
    feedList(){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amAccount.feedList()' );
        if( !Meteor.isClient ){
            logger.error( 'feedList() should only be run from client side', 'throwing...' );
            throw new Error( 'Bad side' );
        }
        //logger.debug( 'feedList()' );
        //logger.debug( 'AccountsCore.ready()', AccountsCore.ready());
        //logger.debug( 'AccountsManager.ready()', AccountsManager.ready());
        const usersHandle = Meteor.subscribe( AccountsCore.C.pub.listAll.name, this.opts().collection());
        const self = this;
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
                if( it.DYN ){
                    //logger.debug( 'it.DYN', it.DYN );
                    const roles = it.DYN.roles;
                    it.DYN.roles = new ReactiveVar({});
                    it.DYN.roles.set( roles );
                    list.push( it );
                }
            }
            self.#usersList.set( list );
        });
    }

    /**
     * Getter
     * @returns {Field.Set} the current field set
     */
    fieldSet(){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amAccount.fieldSet()' );
        return this.#fieldset;
    }

    /**
     * @returns {Array} the list of accounts
     *  A reactive data source
     */
    getUsers(){
        return this.#usersList.get();
    }

    /**
     * @returns {Boolean} whether display a Roles panel
     *  This method considers the presence or not of the pwix:roles package
     */
    haveRoles(){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amAccount.haveRoles()' );
        const hasRoles = Object.keys( Package ).includes( 'pwix:roles' ) && Object.keys( Package['pwix:roles'] ).includes( 'Roles' );
        return hasRoles;
    }

    /**
     * @setup Setup a tabular display
     * @param {String} name the name of the tabular display
     * @param {Object} args
     * @returns {Boolean} true if successful
     */
    setupTabular( name, args ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amAccount.setupTabular()', arguments );
        check( name, Match.NonEmptyString );
        check( args, Object );
        if( AccountsManager.Account.tabulars[name] ){
            logger.error( 'setupTabular() tabular is already defined', name );
            return false;
        }
        // define the Tabular.Table
        const tabular = amTabular._initTabular( this, name, args );
        AccountsManager.Account.tabulars[name] = { instance: this, args, tabular };
        logger.debug( 'registering', name );
        return true;
    }
}
