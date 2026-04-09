/*
 * pwix:accounts-manager/src/server/js/index.js
 */

import '../../common/js/index.js';

import './check_npms.js';
import './event_emitter.js';
import './publish.js';
import './transforms.js';
import './users_accounts.js';

// on server side, the package is now fully evaluated, so ready
AccountsManager.ready( true );
