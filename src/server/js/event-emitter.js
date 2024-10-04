/*
 * pwix:accounts-manager/src/common/js/event-emitter.js
 */

import EventEmitter from 'node:events';

AccountsManager.s = AccountsManager.s || {};
AccountsManager.s.eventEmitter = new EventEmitter();
//console.debug( 'AccountsManager is an EventEmitter' );
