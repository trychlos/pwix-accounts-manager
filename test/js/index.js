/*
 * pwix:toggle-switch/test/js/index.js
 */

// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by the package.
import { name as packageName } from "meteor/pwix:toggle-switch";

// Write your tests here!
// Here is an example.
Tinytest.add('toggleSwitch - example', function( test ){
  test.equal( packageName, "toggle-switch" );
});
